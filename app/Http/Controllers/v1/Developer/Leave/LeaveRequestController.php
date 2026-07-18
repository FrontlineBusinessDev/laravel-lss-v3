<?php

namespace App\Http\Controllers\v1\Developer\Leave;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Mail\LeaveDecisionMail;
use App\Mail\LeaveSubmittedMail;
use App\Models\LeaveCategory;
use App\Models\LeaveRequest;
use App\Models\Notification;
use App\Models\Trainees;
use App\Models\User;
use App\Traits\ScopesToAssignedBatches;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Throwable;

/**
 * JSON API for the /leave module (developer/admin full management, trainee
 * self-submission). The three role-specific `Leave\LeaveController`s
 * (developer/trainer/trainee) only render the CSR page shell; every list/
 * mutation call below is the single source of truth all three consume.
 *
 * Doesn't use BaseController's default store/archive/restore/destroy: those
 * assume the active/inactive Statuses domain, but a leave request's status is
 * pending/approved/declined — a different lifecycle entirely.
 */
class LeaveRequestController extends BaseController
{
    use ScopesToAssignedBatches;

    protected string $model = LeaveRequest::class;
    protected string $view = 'developer/leave/index';
    protected array $searchable = ['reason'];
    protected array $filterable = ['status', 'leave_category_id', 'trainee_id', 'batch_id'];
    protected array $sortable = ['leave_date', 'return_date', 'status', 'created_at'];
    protected string $sortBy = 'leave_date';

    public function paginationSearch(Request $request): JsonResponse
    {
        $this->authorize('viewAny', LeaveRequest::class);

        return parent::paginationSearch($request);
    }

    protected function newQuery(): Builder
    {
        /** @var User $user */
        $user = auth()->user();
        $query = LeaveRequest::query()->with([
            'trainee:id,first_name,last_name,batch_id',
            'batch:id,batch_code',
            'leaveCategory:id,name,requires_document',
            'decidedBy:id,first_name,last_name',
        ]);

        if ($user->hasRole('trainee') && ! $user->can('manage leave')) {
            $trainee = Trainees::where('user_id', $user->id)->first();

            return $query->where('trainee_id', $trainee ? $trainee->id : 0);
        }

        // Trainers see requests from their assigned batches only, pending
        // first then most-recent — the Leave Management module's default view.
        if ($user->hasRole('trainer') && ! $user->can('manage leave')) {
            return $query->whereIn('batch_id', $this->assignedBatchIds())
                ->orderByRaw("status = 'pending' desc")
                ->orderByDesc('created_at');
        }

        return $query;
    }

    /** Narrows resolveModel()'s generic Model return to LeaveRequest for status/decision_remarks access below. */
    protected function resolveModel(int|string $id): LeaveRequest
    {
        return LeaveRequest::query()->findOrFail($id);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', LeaveRequest::class);

        /** @var User $user */
        $user = auth()->user();
        $trainee = Trainees::where('user_id', $user->id)->firstOrFail();

        $category = LeaveCategory::find((int) $request->input('leave_category_id'));

        $validated = $request->validate([
            'leave_category_id' => ['required', 'integer', 'exists:app_leave_categories,id'],
            'leave_date' => ['required', 'date'],
            'return_date' => ['required', 'date', 'after_or_equal:leave_date'],
            'reason' => ['required', 'string'],
            'document' => [
                Rule::requiredIf($category?->requires_document === true),
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:5120',
            ],
        ]);

        $this->assertWithinCategoryLimits(
            $trainee->id,
            (int) $validated['leave_category_id'],
            $validated['leave_date'],
            $validated['return_date'],
        );

        $leaveRequest = new LeaveRequest([
            'leave_category_id' => $validated['leave_category_id'],
            'leave_date' => $validated['leave_date'],
            'return_date' => $validated['return_date'],
            'reason' => $validated['reason'],
            'trainee_id' => $trainee->id,
            'batch_id' => $trainee->batch_id,
            'status' => 'pending',
        ]);

        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $folder = env('AWS_S3_STORAGE', 'laravel-ls-system') . '/leave-documents';
            $leaveRequest->document_path = Storage::disk(config('filesystems.default'))->putFile($folder, $file, 'private');
            $leaveRequest->document_original_name = $file->getClientOriginalName();
            $leaveRequest->document_mime_type = $file->getClientMimeType();
            $leaveRequest->document_size = $file->getSize();
        }

        $leaveRequest->save();

        $this->notifyAdminsOfSubmission($leaveRequest->fresh(['trainee', 'leaveCategory']));

        return $this->sendResponse($leaveRequest, 'Leave request submitted.', 201);
    }

    public function approve(int|string $id): JsonResponse
    {
        $leaveRequest = $this->resolveModel($id);
        $this->authorize('approve', $leaveRequest);
        abort_if($leaveRequest->status !== 'pending', 422, 'Only pending requests can be approved.');
        $leaveRequest->update([
            'status' => 'approved',
            'decided_by_id' => auth()->id(),
            'decided_at' => now(),
        ]);
        $this->notifyTraineeOfDecision($leaveRequest->fresh(['trainee', 'leaveCategory']));

        return $this->sendResponse($leaveRequest, 'Leave request approved.');
    }

    public function decline(Request $request, int|string $id): JsonResponse
    {
        $leaveRequest = $this->resolveModel($id);
        $this->authorize('decline', $leaveRequest);
        abort_if($leaveRequest->status !== 'pending', 422, 'Only pending requests can be declined.');
        $validated = $request->validate(['decision_remarks' => ['nullable', 'string']]);
        $leaveRequest->update([
            'status' => 'declined',
            'decision_remarks' => $validated['decision_remarks'] ?? null,
            'decided_by_id' => auth()->id(),
            'decided_at' => now(),
        ]);
        $this->notifyTraineeOfDecision($leaveRequest->fresh(['trainee', 'leaveCategory']));

        return $this->sendResponse($leaveRequest, 'Leave request declined.');
    }

    public function destroy(int|string $id): JsonResponse
    {
        $leaveRequest = $this->resolveModel($id);
        $this->authorize('delete', $leaveRequest);
        abort_if($leaveRequest->status === 'approved', 422, 'Approved leave cannot be deleted.');
        $leaveRequest->delete();

        return response()->json(null, 204);
    }

    /**
     * Cumulative, all-time limit check (the category table has no notion of
     * a reset period) against the trainee's pending + approved requests in
     * the same category — declined requests don't count against the limit.
     */
    protected function assertWithinCategoryLimits(int $traineeId, int $categoryId, string $leaveDate, string $returnDate): void
    {
        $category = LeaveCategory::find($categoryId);
        if (! $category) {
            return;
        }

        $requestedDays = Carbon::parse($leaveDate)->diffInDays(Carbon::parse($returnDate)) + 1;

        $existing = LeaveRequest::where('trainee_id', $traineeId)
            ->where('leave_category_id', $categoryId)
            ->whereIn('status', ['pending', 'approved'])
            ->get(['leave_date', 'return_date']);

        if ($category->max_instances !== null && $existing->count() + 1 > $category->max_instances) {
            abort(422, "This exceeds the maximum of {$category->max_instances} {$category->name} application(s) allowed.");
        }

        if ($category->max_days !== null) {
            $usedDays = $existing->sum(
                fn($r) => Carbon::parse($r->leave_date)->diffInDays(Carbon::parse($r->return_date)) + 1,
            );

            if ($usedDays + $requestedDays > $category->max_days) {
                abort(422, "This exceeds the maximum of {$category->max_days} {$category->name} day(s) allowed.");
            }
        }
    }

    /**
     * Notifies every admin/developer, plus any trainer assigned to the
     * request's batch, of a new submission — in-app + email.
     */
    protected function notifyAdminsOfSubmission(LeaveRequest $leaveRequest): void
    {
        $assignedTrainers = User::role('trainer')
            ->whereHas('assignedBatches', fn(Builder $q) => $q->where('app_batches.id', $leaveRequest->batch_id))
            ->get();

        $recipients = User::role(['admin', 'developer'])->get()->merge($assignedTrainers)->unique('id');
        $traineeName = trim(($leaveRequest->trainee->first_name ?? '') . ' ' . ($leaveRequest->trainee->last_name ?? ''));
        $categoryName = $leaveRequest->leaveCategory->name ?? 'Leave';

        foreach ($recipients as $recipient) {
            Notification::create([
                'user_id' => $recipient->id,
                'type' => 'leave.submitted',
                'title' => 'New leave request',
                'body' => "{$traineeName} submitted a {$categoryName} request.",
                'data' => ['leave_request_id' => $leaveRequest->id],
            ]);

            try {
                Mail::to($recipient->email)->queue(new LeaveSubmittedMail($leaveRequest));
            } catch (Throwable $e) {
                Log::error('Leave submission mail failed', [
                    'leave_request_id' => $leaveRequest->id,
                    'recipient_id' => $recipient->id,
                    'message' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Notifies the submitting trainee of an approve/decline decision — in-app
     * (if they hold a linked login account) + email (always, since every
     * trainee has an email on file even without one).
     */
    protected function notifyTraineeOfDecision(LeaveRequest $leaveRequest): void
    {
        if (! $leaveRequest->trainee) {
            return;
        }

        if ($leaveRequest->trainee->user_id) {
            Notification::create([
                'user_id' => $leaveRequest->trainee->user_id,
                'type' => "leave.{$leaveRequest->status}",
                'title' => $leaveRequest->status === 'approved'
                    ? 'Leave request approved'
                    : 'Leave request declined',
                'body' => "Your {$leaveRequest->leaveCategory->name} request has been {$leaveRequest->status}.",
                'data' => ['leave_request_id' => $leaveRequest->id],
            ]);
        }

        try {
            Mail::to($leaveRequest->trainee->email)->queue(new LeaveDecisionMail($leaveRequest));
        } catch (Throwable $e) {
            Log::error('Leave decision mail failed', [
                'leave_request_id' => $leaveRequest->id,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
