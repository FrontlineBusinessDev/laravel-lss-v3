<?php

namespace App\Http\Controllers\v1\Developer\Evaluation;

use App\Http\Controllers\v1\Controller;
use App\Http\Responses\InertiaPageResponse;
use App\Mail\TrainerEvaluationDueMail;
use App\Models\EvaluationSeminarQuestion;
use App\Models\EvaluationTrainerQuestion;
use App\Models\Notification;
use App\Models\SeminarEvaluation;
use App\Models\Trainees;
use App\Models\TrainerEvaluation;
use App\Support\GoogleChatAlert;
use App\Support\Permissions;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Evaluation Overview tab — analytics dashboard + unified submissions feed +
 * manual reminder tool for the Admin Evaluation module (Trainer + Seminar
 * questionnaires). The question banks themselves are managed by
 * EvaluationTrainerQuestionnaire / EvaluationSeminarQuestionnaire and the
 * trainee/trainer-facing submission endpoints (Milestone 4).
 */
class EvaluationViewController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(['auth', 'throttle:60,1']),
            new Middleware('permission:' . Permissions::MANAGE_EVALUATION),
        ];
    }

    /** CSR shell (GET /evaluation/overview). */
    public function index(): mixed
    {
        return InertiaPageResponse::csr('developer/evaluation/index');
    }

    /**
     * Aggregated metrics for the Overview stat cards + rating distribution +
     * per-batch/per-seminar chart. Cheap counts/averages only.
     */
    public function metrics(Request $request): mixed
    {
        $activeTrainerQuestions = EvaluationTrainerQuestion::query()->where('status', Statuses::ACTIVE)->count();
        $activeSeminarQuestions = EvaluationSeminarQuestion::query()->where('status', Statuses::ACTIVE)->count();

        $trainerEvaluations = TrainerEvaluation::query()->whereNotNull('submitted_at');
        $seminarEvaluations = SeminarEvaluation::query()->whereNotNull('submitted_at');

        $totalTrainerSubmissions = (clone $trainerEvaluations)->count();
        $totalSeminarSubmissions = (clone $seminarEvaluations)->count();
        $avgTrainerScore = (clone $trainerEvaluations)->avg('total_score');
        $avgSeminarScore = (clone $seminarEvaluations)->avg('total_score');

        $byBatch = DB::table('app_trainer_evaluations')
            ->join('app_batches', 'app_batches.id', '=', 'app_trainer_evaluations.batch_id')
            ->whereNotNull('app_trainer_evaluations.submitted_at')
            ->selectRaw('app_batches.id as batch_id, app_batches.batch_code, count(*) as answer_count, avg(app_trainer_evaluations.total_score) as average_score')
            ->groupBy('app_batches.id', 'app_batches.batch_code')
            ->orderByDesc('answer_count')
            ->get()
            ->map(fn($row) => [
                'batch_id' => $row->batch_id,
                'batch_code' => $row->batch_code,
                'answer_count' => (int) $row->answer_count,
                'average_score' => $row->average_score !== null ? round((float) $row->average_score, 1) : null,
            ]);

        $bySeminar = DB::table('app_seminar_evaluations')
            ->join('app_seminars', 'app_seminars.id', '=', 'app_seminar_evaluations.seminar_id')
            ->whereNotNull('app_seminar_evaluations.submitted_at')
            ->selectRaw('app_seminars.id as seminar_id, app_seminars.topic, count(*) as answer_count, avg(app_seminar_evaluations.total_score) as average_score')
            ->groupBy('app_seminars.id', 'app_seminars.topic')
            ->orderByDesc('answer_count')
            ->get()
            ->map(fn($row) => [
                'seminar_id' => $row->seminar_id,
                'topic' => $row->topic,
                'answer_count' => (int) $row->answer_count,
                'average_score' => $row->average_score !== null ? round((float) $row->average_score, 1) : null,
            ]);

        // Rating distribution (1..5 stars, rounded) across trainer + seminar submissions combined.
        $scores = (clone $trainerEvaluations)->whereNotNull('total_score')->pluck('total_score')
            ->merge((clone $seminarEvaluations)->whereNotNull('total_score')->pluck('total_score'));
        $distribution = ['1' => 0, '2' => 0, '3' => 0, '4' => 0, '5' => 0];
        foreach ($scores as $score) {
            $bucket = (string) max(1, min(5, (int) round((float) $score)));
            $distribution[$bucket]++;
        }

        return response()->json([
            'active_trainer_questions' => $activeTrainerQuestions,
            'active_seminar_questions' => $activeSeminarQuestions,
            'total_trainer_submissions' => $totalTrainerSubmissions,
            'total_seminar_submissions' => $totalSeminarSubmissions,
            'average_trainer_score' => $avgTrainerScore ? round((float) $avgTrainerScore, 1) : null,
            'average_seminar_score' => $avgSeminarScore ? round((float) $avgSeminarScore, 1) : null,
            'rating_distribution' => $distribution,
            'answers_by_batch' => $byBatch,
            'answers_by_seminar' => $bySeminar,
        ]);
    }

    /**
     * Unified, paginated, searchable, sortable feed of submitted evaluations
     * (Trainer + Seminar), shaped to match BaseController::paginationSearch()'s
     * envelope so <DataTableCardField> needs no special-casing.
     */
    public function records(Request $request): JsonResponse
    {
        $trainerRows = DB::table('app_trainer_evaluations as te')
            ->join('app_trainees as t', 't.id', '=', 'te.trainee_id')
            ->join('users as tr', 'tr.id', '=', 'te.trainer_id')
            ->join('app_batches as b', 'b.id', '=', 'te.batch_id')
            ->leftJoin('app_trainee_certificates as tc', function ($join) {
                $join->on('tc.trainee_id', '=', 't.id')->whereNotNull('tc.issued_at');
            })
            ->whereNotNull('te.submitted_at')
            ->selectRaw(
                "te.id as id, 'trainer' as type, "
                . "concat(t.first_name, ' ', t.last_name) as respondent, "
                . "concat(tr.first_name, ' ', tr.last_name) as evaluated, "
                . "'Trainer' as scope_label, b.batch_code as scope_detail, "
                . 'te.total_score as score, te.submitted_at as submitted_at, te.archived_at as archived_at, '
                . '(case when tc.id is not null then 1 else 0 end) as locked',
            );

        $seminarRows = DB::table('app_seminar_evaluations as se')
            ->join('app_seminar_participants as sp', 'sp.id', '=', 'se.participant_id')
            ->join('app_seminars as s', 's.id', '=', 'se.seminar_id')
            ->leftJoin('app_seminar_certificates as sc', function ($join) {
                $join->on('sc.seminar_participant_id', '=', 'sp.id')->whereNotNull('sc.issued_at');
            })
            ->whereNotNull('se.submitted_at')
            ->selectRaw(
                "se.id as id, 'seminar' as type, sp.name as respondent, "
                . "'Resource speaker' as evaluated, "
                . "'Seminar' as scope_label, s.topic as scope_detail, "
                . 'se.total_score as score, se.submitted_at as submitted_at, se.archived_at as archived_at, '
                . '(case when sc.id is not null then 1 else 0 end) as locked',
            );

        $union = $trainerRows->unionAll($seminarRows);
        $query = DB::query()->fromSub($union, 'records');

        $search = trim((string) $request->input('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('respondent', 'like', "%{$search}%")
                    ->orWhere('evaluated', 'like', "%{$search}%")
                    ->orWhere('scope_detail', 'like', "%{$search}%");
            });
        }

        $filters = (array) $request->input('filters', []);
        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (! empty($filters['status'])) {
            $filters['status'] === 'archived'
                ? $query->whereNotNull('archived_at')
                : $query->whereNull('archived_at');
        }

        $sortable = ['submitted_at', 'score'];
        $sortBy = in_array($request->string('sort_by')->toString(), $sortable, true)
            ? $request->string('sort_by')->toString()
            : 'submitted_at';
        $sortDir = $request->string('sort_dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = max(1, min((int) $request->input('per_page', 10), 100));
        $paginator = $query->paginate($perPage, ['*'], 'page', (int) $request->input('page', 1));

        $items = collect($paginator->items())->map(fn($row) => [
            ...(array) $row,
            'locked' => (bool) $row->locked,
        ]);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'data' => $items,
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
            ],
        ]);
    }

    public function archiveRecord(string $type, int|string $id): JsonResponse
    {
        $model = $this->resolveRecord($type, $id);
        abort_if($this->isRecordLocked($type, $model), 422, 'This evaluation backs an issued certificate and cannot be archived.');
        $model->update(['archived_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Record archived successfully.', 'data' => $model]);
    }

    public function destroyRecord(string $type, int|string $id): JsonResponse
    {
        $model = $this->resolveRecord($type, $id);
        abort_if($this->isRecordLocked($type, $model), 422, 'This evaluation backs an issued certificate and cannot be deleted.');
        $model->delete();

        return response()->json(null, 204);
    }

    /** @return TrainerEvaluation|SeminarEvaluation */
    private function resolveRecord(string $type, int|string $id): TrainerEvaluation|SeminarEvaluation
    {
        abort_unless(in_array($type, ['trainer', 'seminar'], true), 404);

        return $type === 'trainer'
            ? TrainerEvaluation::findOrFail($id)
            : SeminarEvaluation::findOrFail($id);
    }

    private function isRecordLocked(string $type, TrainerEvaluation|SeminarEvaluation $model): bool
    {
        if ($type === 'trainer') {
            /** @var TrainerEvaluation $model */
            return DB::table('app_trainee_certificates')
                ->where('trainee_id', $model->trainee_id)
                ->whereNotNull('issued_at')
                ->exists();
        }

        /** @var SeminarEvaluation $model */
        return DB::table('app_seminar_certificates')
            ->where('seminar_participant_id', $model->participant_id)
            ->whereNotNull('issued_at')
            ->exists();
    }

    /** Per-batch submitted/expected (trainees × assigned trainers) evaluation response ratio. */
    public function batchProgress(): JsonResponse
    {
        $rows = DB::table('app_batches as b')
            ->leftJoin('app_trainees as t', 't.batch_id', '=', 'b.id')
            ->leftJoin('app_batch_trainer as bt', 'bt.batch_id', '=', 'b.id')
            ->selectRaw(
                'b.id as batch_id, b.batch_code, b.status, '
                . 'count(distinct t.id) as trainee_count, count(distinct bt.trainer_id) as trainer_count',
            )
            ->groupBy('b.id', 'b.batch_code', 'b.status')
            ->get();

        $submittedCounts = TrainerEvaluation::query()
            ->whereNotNull('submitted_at')
            ->selectRaw('batch_id, count(*) as submitted')
            ->groupBy('batch_id')
            ->pluck('submitted', 'batch_id');

        $data = $rows->map(fn($row) => [
            'batch_id' => $row->batch_id,
            'batch_code' => $row->batch_code,
            'status' => $row->status,
            'submitted' => (int) ($submittedCounts[$row->batch_id] ?? 0),
            'expected' => (int) $row->trainee_count * (int) $row->trainer_count,
        ]);

        return response()->json(['data' => $data]);
    }

    /** Per-seminar submitted/registered evaluation response ratio. */
    public function seminarProgress(): JsonResponse
    {
        $rows = DB::table('app_seminars as s')
            ->leftJoin('app_seminar_participants as p', 'p.seminar_id', '=', 's.id')
            ->selectRaw('s.id as seminar_id, s.topic, s.status, count(distinct p.id) as expected')
            ->groupBy('s.id', 's.topic', 's.status')
            ->get();

        $submittedCounts = SeminarEvaluation::query()
            ->whereNotNull('submitted_at')
            ->join('app_seminar_participants', 'app_seminar_participants.id', '=', 'app_seminar_evaluations.participant_id')
            ->selectRaw('app_seminar_participants.seminar_id, count(*) as submitted')
            ->groupBy('app_seminar_participants.seminar_id')
            ->pluck('submitted', 'seminar_id');

        $data = $rows->map(fn($row) => [
            'seminar_id' => $row->seminar_id,
            'topic' => $row->topic,
            'status' => $row->status,
            'submitted' => (int) ($submittedCounts[$row->seminar_id] ?? 0),
            'expected' => (int) $row->expected,
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Trainees who have met their required hours but still have at least one
     * assigned trainer without a submitted evaluation — candidates for a
     * manual admin-triggered reminder (distinct from HourThresholdDispatcher's
     * automatic one-shot notice; this list can be re-sent to repeatedly).
     */
    public function reminders(): JsonResponse
    {
        $candidates = $this->pendingReminderTrainees()->get(['id', 'first_name', 'last_name', 'batch_id']);
        $batchCodes = DB::table('app_batches')->whereIn('id', $candidates->pluck('batch_id')->filter())->pluck('batch_code', 'id');

        $data = $candidates->map(fn($t) => [
            'trainee_id' => $t->id,
            'name' => trim("{$t->first_name} {$t->last_name}"),
            'batch_code' => $batchCodes[$t->batch_id] ?? null,
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Manually (re)sends the Trainer-Evaluation-due nudge to eligible
     * trainees. Unlike HourThresholdDispatcher, this never reads or sets
     * `hour_threshold_notified_at` — it's a repeatable admin action, logged
     * per send to the trainee's in-app notification history.
     */
    public function notifyReminders(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'trainee_ids' => ['nullable', 'array'],
            'trainee_ids.*' => ['integer'],
            'email' => ['required', 'boolean'],
            'chat' => ['required', 'boolean'],
        ]);

        $query = $this->pendingReminderTrainees();
        if (! empty($validated['trainee_ids'])) {
            $query->whereIn('id', $validated['trainee_ids']);
        }
        $trainees = $query->get();

        foreach ($trainees as $trainee) {
            Notification::create([
                'user_id' => $trainee->user_id,
                'type' => 'evaluation.reminder_manual',
                'title' => 'Trainer evaluation reminder',
                'body' => 'Reminder: please accomplish your pending Trainer Evaluation form.',
                'data' => ['trainee_id' => $trainee->id],
            ]);

            if ($validated['email']) {
                try {
                    Mail::to($trainee->email)->queue(new TrainerEvaluationDueMail($trainee));
                } catch (Throwable $e) {
                    Log::error('evaluation reminder mail failed', ['trainee_id' => $trainee->id, 'message' => $e->getMessage()]);
                }
            }

            if ($validated['chat']) {
                GoogleChatAlert::send(sprintf(
                    'Reminder: %s %s still has a pending Trainer Evaluation to accomplish.',
                    $trainee->first_name,
                    $trainee->last_name,
                ));
            }
        }

        return response()->json(['data' => ['notified' => $trainees->count()]]);
    }

    /**
     * Hours-met, at-least-one-trainer-unevaluated trainees, with a linked user account.
     *
     * @return Builder<Trainees>
     */
    private function pendingReminderTrainees(): Builder
    {
        $completedHoursExpr = '(select coalesce(sum(time_spent), 0) from app_tasks'
            . ' where app_tasks.trainee_id = app_trainees.id and app_tasks.status = \'completed\')';

        $pendingTrainerEvalExpr = '(select count(*) from app_batch_trainer'
            . ' where app_batch_trainer.batch_id = app_trainees.batch_id'
            . ' and app_batch_trainer.trainer_id not in ('
            . 'select trainer_id from app_trainer_evaluations'
            . ' where app_trainer_evaluations.trainee_id = app_trainees.id'
            . ' and app_trainer_evaluations.submitted_at is not null'
            . '))';

        return Trainees::query()
            ->whereNotNull('user_id')
            ->whereRaw("{$completedHoursExpr} >= required_hours")
            ->whereRaw("{$pendingTrainerEvalExpr} > 0");
    }
}
