<?php

namespace App\Http\Controllers\Lss;

use App\Http\Controllers\BaseController;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Users admin API (prefix /settings/users, see routes/web.php). Reuses the
 * BaseController CRUD; the only user-specific concerns layered on top are:
 *   - roles live in Spatie's pivot, so filtering/display/assignment are custom
 *   - the create/edit form submits a single "name" split into first/last
 *   - the creator-scoped role matrix + last-active-admin safeguard
 */
class UserController extends BaseController
{
    protected string $model = User::class;

    protected string $view = 'developer/settings/index';

    protected array $searchable = ['first_name', 'last_name', 'email'];

    protected array $filterable = ['status', 'email', 'first_name', 'last_name'];

    protected array $sortable = ['first_name', 'last_name', 'email', 'status', 'created_at'];

    protected string $sortBy = 'first_name';

    protected ?string $resource = UserResource::class;

    /** Role captured during validation so afterCreate/afterUpdate can sync it. */
    private ?string $pendingRole = null;

    /** The settings shell is rendered by SettingController; bounce stray hits. */
    // public function index(Request $request): mixed
    // {
    //     return redirect()->route('settings.index');
    // }

    /**
     * Eager-load roles for display, and translate the Spatie role filter
     * (a pivot, not a column) into a scoped constraint. Applies only when the
     * list request carries filters[role]; other endpoints see a plain query.
     */
    protected function newQuery(): Builder
    {
        $query = User::query()->with('roles');
        $role = request()->input('filters.roles');

        if (is_string($role) && $role !== '') {
            $query->whereHas('roles', fn(Builder $q) => $q->where('name', $role));
        }

        return $query;
    }

    protected function storeRules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', Rule::in($this->assignableRoles())],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($model->getKey()),
            ],
            'role' => ['required', 'string', Rule::in($this->assignableRoles())],
        ];
    }

    protected function validationMessages(): array
    {
        return ['role.in' => 'You are not allowed to assign that role.'];
    }

    /**
     * Split the single "Full name" field into first/last, seed a password for
     * new accounts, and stash the role for afterCreate/afterUpdate. `role` and
     * `name` are removed because neither maps to a users-table column.
     */
    protected function beforeSave(array $validated, ?Model $model = null): array
    {
        $this->pendingRole = $validated['role'] ?? null;
        unset($validated['role']);

        if (isset($validated['name'])) {
            [$first, $last] = $this->splitName($validated['name']);
            $validated['first_name'] = $first;
            $validated['last_name'] = $last;
            unset($validated['name']);
        }

        // Block demoting the final administrator on update.
        if ($model instanceof User && $this->pendingRole !== 'admin') {
            abort_if(
                $this->isLastActiveAdmin($model),
                422,
                'Assign another administrator before changing this account\'s role.',
            );
        }

        if ($model === null) {
            $validated['password'] = Hash::make(Str::password(16));
        }

        return $validated;
    }

    protected function afterCreate(Model $model): void
    {
        $this->syncPendingRole($model);
    }

    protected function afterUpdate(Model $model): void
    {
        $this->syncPendingRole($model);
    }

    /** Guard the last active admin before delegating to the base archive. */
    public function archive(int|string $id): JsonResponse
    {
        $user = $this->resolveModel($id);
        abort_if(
            $user instanceof User && $this->isLastActiveAdmin($user),
            422,
            'Assign another administrator before archiving this account.',
        );

        return parent::archive($id);
    }

    /** Roles the current actor may assign (creator-scoped matrix). */
    protected function assignableRoles(): array
    {
        /** @disregard P1013 */ // this disregard the error below but it works 
        $actor = auth()->user();
        if ($actor?->hasRole('developer')) {
            return ['developer', 'admin', 'trainer'];
        }

        if ($actor?->hasRole('admin')) {
            return ['admin', 'trainer'];
        }

        return [];
    }

    private function syncPendingRole(Model $model): void
    {
        if ($model instanceof User && $this->pendingRole !== null) {
            $model->syncRoles([$this->pendingRole]);
        }
    }

    private function isLastActiveAdmin(User $user): bool
    {
        if (! $user->hasRole('admin') || $user->status !== Statuses::ACTIVE) {
            return false;
        }
        // Find the last active admin's ID
        $lastActiveAdminId = User::role('admin')
            ->where('status', Statuses::ACTIVE)
            ->latest('id')
            ->value('id');
        // return User::role('admin')->where('status', Statuses::ACTIVE)->count() <= 1;
        return $lastActiveAdminId === $user->id;
    }

    /** @return array{0: string, 1: string} */
    private function splitName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name), 2) ?: [];

        return [$parts[0] ?? '', $parts[1] ?? ''];
    }
}
