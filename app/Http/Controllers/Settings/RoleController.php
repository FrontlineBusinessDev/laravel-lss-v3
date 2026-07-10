<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\BaseController;
use App\Http\Resources\RoleResource;
use App\Http\Responses\InertiaPageResponse;
use App\Support\Permissions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

/**
 * Roles admin API (prefix /settings/roles, developer-only via the
 * `permission:manage roles` middleware). Reuses BaseController listing but
 * overrides the writes because Spatie roles have no status column and carry a
 * permissions pivot the generic CRUD doesn't know about.
 */
class RoleController extends BaseController
{
    protected string $model = Role::class;
    protected string $view = 'settings/roles/index';
    protected array $searchable = ['name'];
    /** Roles have no status column, so expose no column filters. */
    protected array $filterable = [];
    protected array $sortable = ['name', 'created_at'];
    protected string $sortBy = 'name';
    protected ?string $resource = RoleResource::class;
    /** Core roles that may not be renamed or deleted. */
    private const PROTECTED_ROLES = ['developer', 'admin', 'trainer', 'trainee'];
    public function index(Request $request): mixed
    {
        /** @disregard P1008 */ // this disregard the error below but it works 
        return InertiaPageResponse::csr($this->view, [
            'roles' => RoleResource::collection($this->newQuery()->get()),
            'permissionModules' => Permissions::modules(),
        ]);
    }
    protected function newQuery(): Builder
    {
        return Role::query()->with('permissions');
    }
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->storeRules());
        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);
        $role->syncPermissions($data['permissions'] ?? []);

        return $this->sendResponse(
            new RoleResource($role->load('permissions')),
            'Role created successfully.',
            201,
        );
    }

    public function update(Request $request, int|string $id): JsonResponse
    {
        /** @var Role $role */
        $role = $this->resolveModel($id);
        $data = $request->validate($this->updateRules($role));

        // Core role names are frozen; only their permission set may change.
        if (! in_array($role->name, self::PROTECTED_ROLES, true)) {
            $role->update(['name' => $data['name']]);
        }

        $role->syncPermissions($data['permissions'] ?? []);

        return $this->sendResponse(
            new RoleResource($role->load('permissions')),
            'Role updated successfully.',
        );
    }

    public function destroy(int|string $id): JsonResponse
    {
        /** @var Role $role */
        $role = $this->resolveModel($id);

        if (in_array($role->name, self::PROTECTED_ROLES, true)) {
            return $this->sendError('Core roles cannot be deleted.', [], 422);
        }

        $assigned = $role->users()->count();

        if ($assigned > 0) {
            return $this->sendError(
                'This role is assigned to users and cannot be deleted.',
                ['in_use' => [['label' => 'Users', 'count' => $assigned]]],
                422,
            );
        }
        /** @disregard P1005 */ // this disregard the error below but it works 
        $role->delete();

        return response()->json(null, 204);
    }

    protected function storeRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::in(Permissions::all())],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($model->getKey()),
            ],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::in(Permissions::all())],
        ];
    }
}
