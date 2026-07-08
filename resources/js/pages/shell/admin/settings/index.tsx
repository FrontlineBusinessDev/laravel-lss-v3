import { SettingsShell } from '@/pages/settings/SettingsShell';

/**
 * Admin settings entry. Reuses the exact same shared SettingsShell as the
 * developer page but omits the Roles module (Users management only), per the
 * admin visibility rule in CLAUDE.md.
 */
export default function AdminSettings() {
    return <SettingsShell />;
}
