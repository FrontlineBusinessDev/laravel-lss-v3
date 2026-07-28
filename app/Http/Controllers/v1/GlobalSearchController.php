<?php

namespace App\Http\Controllers\v1;

use App\Models\Announcement;
use App\Models\Batches;
use App\Models\LeaveRequest;
use App\Models\Seminar;
use App\Models\Task;
use App\Models\TraineeCertificate;
use App\Models\Trainees;
use App\Models\TraineesPayments;
use App\Models\User;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Single global-search endpoint (Ctrl+K / Cmd+K command palette). Branches
 * on the authenticated user's role/permissions server-side — the client
 * never declares which "index" it wants, so a trainer/trainee can never
 * request another role's dataset by tampering with a request param.
 *
 * Trainer/trainee branches reuse the exact scoping every other controller
 * for that role already uses (ScopesToAssignedBatches::assignedBatchIds(),
 * the same `Trainees::where('user_id', ...)` lookup every
 * Trainee\*Controller repeats) rather than re-deriving new scoping logic.
 *
 * To add a new searchable entity: add a `group()` call inside the relevant
 * `searchAs*()` method below. No frontend change is needed — results just
 * start appearing grouped under the new `key`/`label` the frontend already
 * renders generically.
 */
class GlobalSearchController extends Controller
{
    use ScopesToAssignedBatches;

    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->string('q'));
        if (mb_strlen($q) < 2) {
            return response()->json(['success' => true, 'data' => ['groups' => []]]);
        }

        /** @var User $user */
        $user = $request->user();
        $groups = match (true) {
            $user->hasRole('trainee') => $this->searchAsTrainee($user, $q),
            $user->hasRole('trainer') => $this->searchAsTrainer($q),
            default => $this->searchAsAdmin($q), // developer + admin: identical, per this app's admin/developer parity rule
        };

        return response()->json([
            'success' => true,
            'data' => ['groups' => array_values(array_filter($groups))],
        ]);
    }

    /** @return array<int, array{key: string, label: string, results: list<array<string, mixed>>}|null> */
    protected function searchAsAdmin(string $q): array
    {
        return [
            $this->group('trainees', 'Trainees', Trainees::query(), ['first_name', 'last_name', 'email', 'mobile_number'], $q,
                fn(Trainees $t) => $this->result($t->id, trim("{$t->first_name} {$t->last_name}"), $t->email, "/trainees/{$t->id}")),
            $this->group('batches', 'Batches', Batches::query(), ['batch_code'], $q,
                fn(Batches $b) => $this->result($b->id, $b->batch_code, ucfirst($b->status), "/batches/{$b->id}")),
            $this->group('tasks', 'Tasks', Task::query(), ['task'], $q,
                fn(Task $t) => $this->result($t->id, $t->task, 'Task', '/tasks')),
            $this->group('leave_requests', 'Leave requests', LeaveRequest::query(), ['reason'], $q,
                fn(LeaveRequest $l) => $this->result($l->id, $l->reason, ucfirst($l->status), '/leave')),
            $this->group('payments', 'Payments', TraineesPayments::query(), ['reference_no', 'official_receipt_number'], $q,
                fn(TraineesPayments $p) => $this->result($p->id, $p->official_receipt_number ?? $p->reference_no ?? "Payment #{$p->id}", 'Payment', "/payments/{$p->trainee_id}")),
            $this->group('trainee_certificates', 'Certificates', TraineeCertificate::query()->whereNotNull('certificate_no'), ['certificate_no'], $q,
                fn(TraineeCertificate $c) => $this->result($c->id, $c->certificate_no, 'Trainee certificate', "/trainees/{$c->trainee_id}/certificate")),
            $this->group('seminars', 'Seminars', Seminar::query(), ['topic', 'venue'], $q,
                fn(Seminar $s) => $this->result($s->id, $s->topic, $s->venue, '/seminars/list-of-seminars')),
            $this->group('users', 'Staff', User::role(['admin', 'developer', 'trainer']), ['first_name', 'last_name', 'email'], $q,
                fn(User $u) => $this->result($u->id, $u->name, $u->email, '/settings/users')),
            $this->group('announcements', 'Announcements', Announcement::query(), ['subject', 'description'], $q,
                fn(Announcement $a) => $this->result($a->id, $a->subject, ucfirst($a->status), '/announcements')),
        ];
    }

    /** @return array<int, array{key: string, label: string, results: list<array<string, mixed>>}|null> */
    protected function searchAsTrainer(string $q): array
    {
        $batchIds = $this->assignedBatchIds();

        return [
            $this->group('batches', 'Batches', Batches::query()->whereIn('id', $batchIds), ['batch_code'], $q,
                fn(Batches $b) => $this->result($b->id, $b->batch_code, ucfirst($b->status), "/trainer/batches/{$b->id}")),
            $this->group('trainees', 'Trainees', Trainees::query()->whereIn('batch_id', $batchIds), ['first_name', 'last_name', 'email'], $q,
                fn(Trainees $t) => $this->result($t->id, trim("{$t->first_name} {$t->last_name}"), $t->email, "/trainer/trainees/{$t->id}")),
            $this->group('tasks', 'Tasks', Task::query()->whereIn('batch_id', $batchIds), ['task'], $q,
                fn(Task $t) => $this->result($t->id, $t->task, 'Task', '/trainer/tasks')),
            $this->group('leave_requests', 'Leave requests', LeaveRequest::query()->whereIn('batch_id', $batchIds), ['reason'], $q,
                fn(LeaveRequest $l) => $this->result($l->id, $l->reason, ucfirst($l->status), '/trainer/leave')),
        ];
    }

    /** @return array<int, array{key: string, label: string, results: list<array<string, mixed>>}|null> */
    protected function searchAsTrainee(User $user, string $q): array
    {
        $trainee = Trainees::where('user_id', $user->id)->firstOrFail();

        return [
            $this->group('tasks', 'Tasks', Task::query()->where('trainee_id', $trainee->id), ['task'], $q,
                fn(Task $t) => $this->result($t->id, $t->task, 'Task', '/trainee/tasks')),
            $this->group('leave_requests', 'Leave requests', LeaveRequest::query()->where('trainee_id', $trainee->id), ['reason'], $q,
                fn(LeaveRequest $l) => $this->result($l->id, $l->reason, ucfirst($l->status), '/trainee/leave')),
            $this->group('payments', 'Payments', TraineesPayments::query()->where('trainee_id', $trainee->id), ['reference_no', 'official_receipt_number'], $q,
                fn(TraineesPayments $p) => $this->result($p->id, $p->official_receipt_number ?? $p->reference_no ?? "Payment #{$p->id}", 'Payment', '/trainee/payments')),
            $this->group('announcements', 'Announcements', Announcement::query()->where('status', 'active'), ['subject', 'description'], $q,
                fn(Announcement $a) => $this->result($a->id, $a->subject, 'Announcement', '/trainee/announcements')),
        ];
    }

    /**
     * Runs a LIKE-across-columns search (mirrors BaseController::paginationSearch's
     * search-term handling) against an already role/scope-narrowed query, caps
     * results, and maps rows through the caller's shape closure. Returns null
     * (filtered out by the caller) when nothing matches, so empty groups never
     * reach the frontend.
     *
     * @param list<string> $columns
     * @return array{key: string, label: string, results: list<array<string, mixed>>}|null
     */
    protected function group(string $key, string $label, Builder $query, array $columns, string $q, callable $map): ?array
    {
        $query->where(function (Builder $sub) use ($columns, $q) {
            foreach ($columns as $index => $column) {
                $index === 0
                    ? $sub->where($column, 'like', "%{$q}%")
                    : $sub->orWhere($column, 'like', "%{$q}%");
            }
        });

        $results = $query->limit(5)->get()->map($map)->values()->all();

        return $results === [] ? null : ['key' => $key, 'label' => $label, 'results' => $results];
    }

    /** @return array{id: int|string, label: string, subtitle: string, url: string} */
    protected function result(int|string $id, string $label, ?string $subtitle, string $url): array
    {
        return ['id' => $id, 'label' => $label, 'subtitle' => $subtitle ?? '', 'url' => $url];
    }
}
