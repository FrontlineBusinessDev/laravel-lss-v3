<?php

namespace App\Http\Controllers\v1\Developer\Ratings;

use App\Http\Controllers\v1\Developer\Controller;
use App\Models\BehavioralEvaluation;
use App\Models\BehavioralQuestion;
use App\Models\Trainees;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Behavioral Assessment Form API (prefix /ratings/behavioral-rating).
 * Batch -> trainee -> dynamic question form, real DB-backed
 * (app_behavioral_evaluations / app_behavioral_evaluation_answers).
 * Shared by admin/developer (full access) and trainer
 * (assertBatchAccessible() restricts every batch_id-bearing call to their
 * assigned batches), matching TaskRatingController's convention.
 */
class BehavioralEvaluationController extends Controller
{
    use ScopesToAssignedBatches;

    /** Active trainees in a batch, for the trainee-selection step. */
    public function trainees(Request $request): JsonResponse
    {
        $this->assertNotTrainee();
        $validated = $request->validate(['batch_id' => ['required', 'integer', 'exists:app_batches,id']]);
        $this->assertBatchAccessible((int) $validated['batch_id']);

        $trainees = Trainees::where('batch_id', $validated['batch_id'])
            ->where('status', 'active')
            ->with('school:id,school_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'school_id']);

        return response()->json(['data' => $trainees]);
    }

    /** Active questions, ordered for the dynamic evaluation form. */
    public function activeQuestions(): JsonResponse
    {
        $this->assertNotTrainee();

        $questions = BehavioralQuestion::where('status', 'active')
            ->orderBy('order')
            ->get(['id', 'section', 'question', 'type', 'order']);

        return response()->json(['data' => $questions]);
    }

    /** The saved evaluation (if any) for a batch+trainee, with its answers. */
    public function forTrainee(Request $request): JsonResponse
    {
        $this->assertNotTrainee();
        $validated = $request->validate([
            'batch_id' => ['required', 'integer', 'exists:app_batches,id'],
            'trainee_id' => ['required', 'integer', 'exists:app_trainees,id'],
        ]);
        $this->assertBatchAccessible((int) $validated['batch_id']);

        $evaluation = BehavioralEvaluation::where('batch_id', $validated['batch_id'])
            ->where('trainee_id', $validated['trainee_id'])
            ->with(['answers', 'evaluator:id,first_name,last_name', 'trainee:id,first_name,last_name'])
            ->first();

        return response()->json(['data' => $evaluation]);
    }

    /** Submit or update a trainee's behavioral evaluation for a batch. */
    public function store(Request $request): JsonResponse
    {
        $this->assertNotTrainee();
        $validated = $request->validate([
            'batch_id' => ['required', 'integer', 'exists:app_batches,id'],
            'trainee_id' => ['required', 'integer', 'exists:app_trainees,id'],
            'remarks' => ['nullable', 'string'],
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'exists:app_behavioral_questions,id'],
            'answers.*.score' => ['nullable', 'integer', 'between:1,5'],
            'answers.*.text_answer' => ['nullable', 'string'],
        ]);
        $this->assertBatchAccessible((int) $validated['batch_id']);

        $evaluation = DB::transaction(function () use ($validated) {
            /** @var array<int, array{question_id: int, score?: int|null, text_answer?: string|null}> $answers */
            $answers = $validated['answers'];
            $scores = collect($answers)
                ->pluck('score')
                ->filter(fn($score) => $score !== null);

            $evaluation = BehavioralEvaluation::firstOrNew([
                'batch_id' => $validated['batch_id'],
                'trainee_id' => $validated['trainee_id'],
            ]);
            $evaluation->fill([
                'evaluator_id' => auth()->id(),
                'remarks' => $validated['remarks'] ?? null,
                'total_score' => $scores->isNotEmpty() ? round($scores->avg(), 1) : null,
            ])->save();

            $evaluation->answers()->delete();
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

        return response()->json([
            'data' => $evaluation->load(['answers', 'evaluator:id,first_name,last_name', 'trainee:id,first_name,last_name']),
        ]);
    }

    /**
     * No-op for admin/developer (full access). Trainers are restricted to
     * their assigned batches — 403s otherwise, mirroring
     * TaskRatingController::assertBatchAccessible().
     */
    private function assertBatchAccessible(int $batchId): void
    {
        /** @disregard P1013 */
        $user = auth()->user();
        if ($user->hasRole('trainer') && ! $user->hasAnyRole(['admin', 'developer'])) {
            $this->assertBatchAssigned($batchId);
        }
    }

    /**
     * Confidentiality Engine — behavioral ratings are never readable or
     * writable by a trainee session, no matter how the request is shaped.
     * Redundant with the route-level `permission:manage ratings` gate
     * (trainees never hold it), kept here as an explicit, request-level
     * defense-in-depth check per the module's confidentiality requirement.
     */
    private function assertNotTrainee(): void
    {
        /** @disregard P1013 */
        abort_if(auth()->user()->hasRole('trainee'), 403, 'Behavioral ratings are not accessible to trainee accounts.');
    }
}
