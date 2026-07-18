<?php

namespace App\Http\Controllers\v1\Developer\Trainees;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Mail\TraineeActivatedMail;
use App\Mail\UserInviteMail;
use App\Models\AcademicLearningOutcomes;
use App\Models\Trainees;
use App\Support\PasswordSetupUrl;
use App\Support\Statuses;
use App\Support\TraineeAccountLinker;
use App\Support\TraineeCascadeDeleter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class TraineesController extends BaseController
{
    protected string $model = Trainees::class;
    protected string $view = 'developer/trainees/index';
    protected array $searchable = ['first_name', 'last_name', 'email', 'mobile_number'];
    protected array $filterable = [
        'status',
        'first_name',
        'last_name',
        'email',
        'batch_id',
        'gender',
        'school_id',
        'academic_industry_id',
        'academic_level_id',
        'academic_program_id'
    ];
    protected array $sortable = [
        'status',
        'id',
        'last_name',
        'date_completed',
        'required_hours'
    ];
    // batch_id/school_id/academic_*_id are FK ids — must match exactly, not LIKE
    // (a LIKE '%3%' would also match ids 13, 23, 30-39, etc.).
    protected array $exactFilters = [
        'status',
        'batch_id',
        'school_id',
        'academic_industry_id',
        'academic_level_id',
        'academic_program_id',
    ];
    protected array $activeColumns = ['id', 'first_name', 'last_name', 'email'];
    protected string $sortBy = 'last_name';
    // Informational only: surfaced by inUse() so the frontend can warn before
    // the type-to-confirm delete modal, since destroy() below cascades rather
    // than hard-blocking on these relations.
    protected array $inUseRelations = ['documents', 'tasks', 'leaveRequests', 'taskRatings'];

    /**
     * Eager-load the industry/program relations so the list serializes their
     * names (as `academic_industry` / `academic_program`) instead of the
     * frontend having to display raw foreign-key ids.
     *
     * @return Builder<Model>
     */
    protected function newQuery(): Builder
    {
        $query = parent::newQuery()->with([
            'school:id,school_name',
            'batch:id,batch_code,setup,academic_industry_id,academic_program_id,academic_level_id',
            'batch.academicIndustry:id,name',
            'batch.academicProgram:id,name,course_name',
            'batch.academicLevel:id,name,name',
        ]);

        // Opt-in exclusion for the task-assignment trainee picker: pass
        // ?exclude_on_leave_date=YYYY-MM-DD to drop trainees with an approved
        // leave covering that date. Not a `filterable` column, so it's read
        // directly off the request rather than the generic filters[] loop.
        $excludeOnLeaveDate = request()->string('exclude_on_leave_date')->toString();
        if ($excludeOnLeaveDate !== '') {
            $query->whereDoesntHave('leaveRequests', function (Builder $leaveQuery) use ($excludeOnLeaveDate) {
                $leaveQuery->where('status', 'approved')
                    ->whereDate('leave_date', '<=', $excludeOnLeaveDate)
                    ->whereDate('return_date', '>=', $excludeOnLeaveDate);
            });
        }

        return $query;
    }

    protected function storeRules(): array
    {
        return [
            'batch_id' => ['required', 'exists:app_batches,id'],
            'school_id' => ['required', 'exists:app_settings_partner_schools,id'],
            'public_url_id' => ['required', 'string', 'unique:app_trainees,public_url_id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:app_trainees,email'],
            'birthday' => ['required', 'date'],
            'birth_place' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:male,female'],
            'mobile_number' => ['required', 'string', 'max:50'],
            'landline_number' => ['nullable', 'string', 'max:50'],
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_number' => ['required', 'string', 'max:50'],
            'required_hours' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'completed_hours' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'date_completed' => ['nullable', 'date'],
            'termination_remarks' => ['nullable', 'string'],
            'address' => ['required', 'string'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'batch_id' => ['required', 'exists:app_batches,id'],
            'school_id' => ['required', 'exists:app_settings_partner_schools,id'],
            'public_url_id' => ['required', 'string', Rule::unique('app_trainees')->ignore($model->id)],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('app_trainees')->ignore($model->id)],
            'birthday' => ['required', 'date'],
            'birth_place' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:male,female'],
            'mobile_number' => ['required', 'string', 'max:50'],
            'landline_number' => ['nullable', 'string', 'max:50'],
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_number' => ['required', 'string', 'max:50'],
            'required_hours' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'completed_hours' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'date_completed' => ['nullable', 'date'],
            'termination_remarks' => ['nullable', 'string'],
            'address' => ['required', 'string'],
        ];
    }

    /**
     * Cascading hard-delete: documents/tasks/leave-requests/ratings are all
     * restrictOnDelete FKs, so the DB would reject deleting a trainee that
     * still has any of them. Per product decision this is destructive by
     * design — TraineeCascadeDeleter removes everything under the trainee
     * (payments/certificate/learning-outcomes cascade via DB FKs already).
     */
    public function destroy(int|string $id): JsonResponse
    {
        return DB::transaction(function () use ($id) {
            $trainee = $this->newQuery()->lockForUpdate()->findOrFail($id);
            $this->authorize('delete', $trainee);

            abort_if($trainee->status === self::STATUS_ACTIVE, 422, 'Set to inactive before deleting.');

            TraineeCascadeDeleter::delete($trainee);

            return response()->json(null, 204);
        });
    }

    /**
     * Enable login for the trainee: creates a User account the first time
     * (mirrors self-registration) and emails an invite, or simply reactivates
     * a previously unlinked account on subsequent calls.
     */
    public function linkAccount(int|string $id): JsonResponse
    {
        $trainee = $this->resolveModel($id);
        $this->authorize('linkAccount', $trainee);

        [$user, $isNewAccount] = TraineeAccountLinker::link($trainee);

        if ($isNewAccount) {
            $resetUrl = PasswordSetupUrl::generate($user);
            Mail::to($user->email)->queue(new UserInviteMail($user, $resetUrl));
        }

        return $this->sendResponse($trainee->fresh('user'), 'Account linked successfully.');
    }

    /** Disable login for the trainee without severing the account link. */
    public function unlinkAccount(int|string $id): JsonResponse
    {
        $trainee = $this->resolveModel($id);
        $this->authorize('unlinkAccount', $trainee);

        TraineeAccountLinker::unlink($trainee);

        return $this->sendResponse($trainee->fresh('user'), 'Account unlinked successfully.');
    }

    /**
     * Admit a PENDING trainee to a batch, activate the record, provision
     * their login account, and email them a password-setup link. The batch
     * chosen at registration is the frontend's default but can be reassigned
     * here before confirming.
     */
    public function approve(Request $request, int|string $id): JsonResponse
    {
        $trainee = $this->resolveModel($id);
        $this->authorize('approve', $trainee);

        abort_if($trainee->status !== Statuses::PENDING, 422, 'Trainee is not pending approval.');

        $validated = $request->validate([
            'batch_id' => ['required', 'exists:app_batches,id'],
        ]);

        $newUser = null;
        DB::transaction(function () use ($trainee, $validated, &$newUser) {
            $trainee->update([
                'batch_id' => $validated['batch_id'],
                'status' => Statuses::ACTIVE,
                'approved_by_id' => auth()->id(),
                'approved_at' => now(),
            ]);
            $newUser = TraineeAccountLinker::createAndLink($trainee);
        });

        if ($newUser) {
            $resetUrl = PasswordSetupUrl::generate($newUser);
            Mail::to($newUser->email)->queue(new TraineeActivatedMail($newUser, $resetUrl));
        }

        return $this->sendResponse($trainee->fresh(['user', 'batch']), 'Trainee approved successfully.');
    }

    /** Decline a PENDING trainee's application. No account is created. */
    public function decline(Request $request, int|string $id): JsonResponse
    {
        $trainee = $this->resolveModel($id);
        $this->authorize('decline', $trainee);

        abort_if($trainee->status !== Statuses::PENDING, 422, 'Trainee is not pending approval.');

        $validated = $request->validate([
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $trainee->update([
            'status' => Statuses::INACTIVE,
            'decline_remarks' => $validated['remarks'] ?? null,
        ]);

        return $this->sendResponse($trainee->fresh(), 'Trainee application declined.');
    }

    /**
     * Upload/replace the trainee's cropped profile picture. Kept separate
     * from update() so the personal-info save (all fields required) doesn't
     * force a full form resubmit every time the avatar changes.
     */
    public function updateAvatar(Request $request, int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        $request->validate([
            'avatar_path' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $disk = config('filesystems.default');
        $folder = env('AWS_S3_STORAGE', 'laravel-ls-system') . '/trainee-avatars';
        $path = Storage::disk($disk)->putFile($folder, $request->file('avatar_path'), 'private');

        if ($model->avatar_path) {
            $this->deleteStoredFile($model->avatar_path, $disk);
        }

        $model->update(['avatar_path' => $path]);

        return $this->sendResponse($model, 'Profile picture updated successfully.');
    }

    /** Remove the trainee's profile picture: deletes the stored file and clears avatar_path. */
    public function destroyAvatar(int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);

        if ($model->avatar_path) {
            $this->deleteStoredFile($model->avatar_path, config('filesystems.default'));
        }

        $model->update(['avatar_path' => null]);

        return $this->sendResponse($model, 'Profile picture removed successfully.');
    }

    /**
     * Set or clear a single billing override field. Kept separate from
     * update() so the Payment Details override toggles (one field at a
     * time) don't force a full personal-info form resubmit.
     */
    public function updateBillingOverrides(Request $request, int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        $validated = $request->validate([
            'override_rate_per_hour' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'override_hours_discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'override_group_discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $model->update($validated);

        return $this->sendResponse($model, 'Billing override updated successfully.');
    }

    /**
     * Toggle a single learning outcome's achieved status for this trainee.
     * The outcome must belong to the trainee's batch industry.
     */
    public function updateLearningOutcomeStatus(Request $request, int|string $id, int|string $outcomeId): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $outcome = AcademicLearningOutcomes::findOrFail($outcomeId);
        abort_if(
            $outcome->academic_industry_id !== $model->batch?->academic_industry_id,
            403,
            'This learning outcome does not belong to the trainee\'s industry.',
        );

        $model->learningOutcomes()->syncWithoutDetaching([
            $outcome->id => ['status' => $validated['status']],
        ]);

        return $this->sendResponse(['status' => $validated['status']], 'Learning outcome updated successfully.');
    }
}
