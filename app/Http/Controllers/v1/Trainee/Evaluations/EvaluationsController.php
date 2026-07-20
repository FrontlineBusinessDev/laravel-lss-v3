<?php

namespace App\Http\Controllers\v1\Trainee\Evaluations;

use App\Models\Batches;
use App\Models\EvaluationTrainerQuestion;
use App\Models\Trainees;
use App\Models\TrainerEvaluation;
use App\Support\RequiredDocumentTypes;
use App\Support\Statuses;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Trainee-facing Trainer Evaluation gateway (prefix /trainee/evaluations).
 * Access is gated on hours/documents/balance (computeEligibility()); the form
 * itself supports evaluating multiple trainers (one submission per assigned
 * trainer, enforced by app_trainer_evaluations' unique batch/trainee/trainer
 * constraint). Questions are fetched live from the admin-managed question
 * bank (App\Models\EvaluationTrainerQuestion) — never hardcoded.
 */
class EvaluationsController
{
    public function index(): Response
    {
        return Inertia::render('trainee/evaluation/index')->asCsr();
    }

    /** Eligibility + the list of trainers assigned to the trainee's batch, with submitted status per trainer. */
    public function gateway(): JsonResponse
    {
        $trainee = $this->currentTrainee();
        $eligibility = $this->computeEligibility($trainee);

        $batch = $this->currentBatch($trainee);
        $trainers = $batch
            ? $batch->trainers()->orderBy('first_name')->get(['users.id', 'users.first_name', 'users.last_name'])
            : collect();

        $submittedTrainerIds = TrainerEvaluation::where('trainee_id', $trainee->id)
            ->whereNotNull('submitted_at')
            ->pluck('trainer_id');

        return response()->json([
            'data' => [
                'eligible' => $eligibility['eligible'],
                'reasons' => $eligibility['reasons'],
                'trainers' => $trainers->map(fn($trainer) => [
                    'id' => $trainer->id,
                    'name' => trim("{$trainer->first_name} {$trainer->last_name}"),
                    'submitted' => $submittedTrainerIds->contains($trainer->id),
                ])->values(),
            ],
        ]);
    }

    /**
     * Active questions from the admin-managed trainer-questionnaire bank,
     * scoped to the trainee's own batch's Academic Industry, ordered for the form.
     */
    public function activeQuestions(): JsonResponse
    {
        $trainee = $this->currentTrainee();
        $batch = $this->currentBatch($trainee);

        $questions = EvaluationTrainerQuestion::where('status', Statuses::ACTIVE)
            ->where('academic_industry_id', $batch?->academic_industry_id)
            ->orderBy('order')
            ->get(['id', 'section', 'question', 'type', 'order']);

        return response()->json(['data' => $questions]);
    }

    /** Submit an evaluation for one assigned trainer. Idempotent: one submission per trainer, enforced server-side and by a DB unique constraint. */
    public function store(Request $request): JsonResponse
    {
        $trainee = $this->currentTrainee();
        $eligibility = $this->computeEligibility($trainee);
        abort_unless($eligibility['eligible'], 422, 'You are not yet eligible to submit a trainer evaluation.');

        $batch = $this->currentBatch($trainee);
        abort_if(! $batch, 422, 'You are not assigned to a batch.');

        $validated = $request->validate([
            'trainer_id' => ['required', 'integer', 'exists:users,id'],
            'remarks' => ['nullable', 'string'],
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'exists:app_evaluation_trainer_questions,id'],
            'answers.*.score' => ['nullable', 'integer', 'between:1,5'],
            'answers.*.text_answer' => ['nullable', 'string'],
        ]);

        abort_unless(
            $batch->trainers()->where('users.id', $validated['trainer_id'])->exists(),
            422,
            'That trainer is not assigned to your batch.',
        );

        $alreadySubmitted = TrainerEvaluation::where('batch_id', $batch->id)
            ->where('trainee_id', $trainee->id)
            ->where('trainer_id', $validated['trainer_id'])
            ->whereNotNull('submitted_at')
            ->exists();
        abort_if($alreadySubmitted, 422, 'You have already submitted an evaluation for this trainer.');

        try {
            $evaluation = DB::transaction(function () use ($validated, $trainee, $batch) {
                /** @var array<int, array{question_id: int, score?: int|null, text_answer?: string|null}> $answers */
                $answers = $validated['answers'];
                $scores = collect($answers)->pluck('score')->filter(fn($score) => $score !== null);

                $evaluation = TrainerEvaluation::create([
                    'batch_id' => $batch->id,
                    'trainee_id' => $trainee->id,
                    'trainer_id' => $validated['trainer_id'],
                    'remarks' => $validated['remarks'] ?? null,
                    'total_score' => $scores->isNotEmpty() ? round($scores->avg(), 1) : null,
                    'submitted_at' => now(),
                ]);

                $evaluation->answers()->createMany(array_map(
                    fn(array $answer) => [
                        'question_id' => $answer['question_id'],
                        'score' => $answer['score'] ?? null,
                        'text_answer' => $answer['text_answer'] ?? null,
                    ],
                    $answers,
                ));

                return $evaluation;
            });
        } catch (QueryException $e) {
            abort(422, 'You have already submitted an evaluation for this trainer.');
        }

        return response()->json(['data' => $evaluation->load('answers')], 201);
    }

    /**
     * @return array{eligible: bool, reasons: array<int, string>}
     */
    private function computeEligibility(Trainees $trainee): array
    {
        $hoursOk = (float) ($trainee->completed_hours ?? 0) >= (float) $trainee->required_hours;

        $submittedTypes = $trainee->documents()->pluck('document_type')->all();
        $missingDocs = array_values(array_diff(RequiredDocumentTypes::TYPES, $submittedTypes));
        $docsOk = $missingDocs === [] || $trainee->evaluation_access_override;

        $balanceOk = (float) $trainee->outstanding_balance <= 0;

        $reasons = [];
        if (! $hoursOk) {
            $reasons[] = sprintf(
                '%.1f of %.1f required hours completed',
                (float) ($trainee->completed_hours ?? 0),
                (float) $trainee->required_hours,
            );
        }
        if (! $docsOk) {
            foreach ($missingDocs as $type) {
                $reasons[] = ucwords(str_replace('-', ' ', $type)) . ' not submitted';
            }
        }
        if (! $balanceOk) {
            $reasons[] = 'Outstanding balance of ₱' . number_format((float) $trainee->outstanding_balance, 2);
        }

        return [
            'eligible' => $hoursOk && $docsOk && $balanceOk,
            'reasons' => $reasons,
        ];
    }

    private function currentTrainee(): Trainees
    {
        return Trainees::query()->withCompletedHours()->where('user_id', auth()->id())->firstOrFail();
    }

    private function currentBatch(Trainees $trainee): ?Batches
    {
        return $trainee->batch_id ? Batches::query()->whereKey($trainee->batch_id)->first() : null;
    }
}
