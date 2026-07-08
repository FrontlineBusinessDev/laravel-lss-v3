import { SettingsShell } from '@/pages/settings/SettingsShell';
import type { PermissionModules } from '@/pages/settings/roles/RoleModal';

/**
 * Developer settings entry. Reuses the shared SettingsShell and exposes the
 * Roles sub-tab. Admins get pages/admin/settings (Users only) — same shell.
 */
export default function DeveloperSettings({
    permissionModules,
}: {
    permissionModules?: PermissionModules;
}) {
    return <SettingsShell showRoles permissionModules={permissionModules} />;
}
