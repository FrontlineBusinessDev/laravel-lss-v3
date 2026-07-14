/**
 * @file api-service-layer/index.ts
 * Public entry point for the API service layer. Exposes the shared transport,
 * the CRUD factory, role helpers, and every resource service. Because
 * `developer === admin`, the role folders re-export the same admin services;
 * this barrel surfaces the canonical `admin/*` implementations plus the role
 * helpers so callers can normalize a developer to admin where needed.
 */

// Transport + building blocks
export { http, createHttpClient, unwrap, ApiError } from './client';
export type { ApiEnvelope } from './client';
export { createCrudResource } from './http';
export type {
    CrudResource,
    CrudResourceOptions,
    LookupOption,
    WriteOptions,
} from './http';
export {
    buildFormData,
    buildQueryString,
    hasBinaryFiles,
} from './form-data';

// Role mapping (developer === admin)
export {
    APP_ROLES,
    normalizeRole,
    sharesAdminAccess,
    assignableRoles,
} from './roles';
export type { AppRole } from './roles';

// Resource services (canonical admin implementations)
export * from './admin/department';
export * from './admin/partner-school';
export * from './admin/academic';
export * from './admin/user';
export * from './admin/role';
export * from './admin/batch';
export * from './admin/batch-trainee';
export * from './admin/batch-view';
export * from './admin/trainee';
