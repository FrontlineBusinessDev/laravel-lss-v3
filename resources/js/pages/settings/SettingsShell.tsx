import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PermissionModules } from './roles/RoleModal';
import { RolesManagement } from './roles/RolesManagement';
import { AcademicTab } from './tabs/academic/AcademicTab';
import { PartnerSchoolsTab } from './tabs/partner-schools/PartnerSchoolsTab';
import { UsersManagement } from './users/UsersManagement';

const TABS = ['Users', 'Partner schools', 'Academic'] as const;
type Tab = (typeof TABS)[number];

const SUB_TABS = ['Users', 'Roles'] as const;
type SubTab = (typeof SUB_TABS)[number];

interface SettingsShellProps {
    /** Developers see the Roles sub-tab; admins get Users only. */
    showRoles?: boolean;
    permissionModules?: PermissionModules;
}

/**
 * Shared settings surface consumed by both pages/developer and pages/admin.
 * The only difference is `showRoles`, so the two role-scoped entry points stay
 * thin wrappers and the implementation lives here (DRY).
 */
export function SettingsShell({
    showRoles = false,
    permissionModules = {},
}: SettingsShellProps) {
    const [tab, setTab] = useState<Tab>('Users');
    const [sub, setSub] = useState<SubTab>('Users');

    return (
        <div>
            <h1 className="text-xl font-semibold text-ink">Settings</h1>
            <p className="mb-4 text-sm text-neutral-500">
                Manage user accounts, partner schools, and academic reference
                data
            </p>

            <div className="lss-scrollbar mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            'pb-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                            tab === t
                                ? 'border-b-2 border-brand-500 font-semibold text-ink'
                                : 'text-neutral-500 hover:text-neutral-700',
                        )}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Users' && (
                <>
                    {showRoles && (
                        <div className="my-2 inline-flex flex-wrap gap-1.5">
                            {SUB_TABS.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setSub(t)}
                                    className={cn(
                                        'rounded-pill px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.97]',
                                        sub === t
                                            ? 'bg-brand-500 text-white'
                                            : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300',
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                    {showRoles && sub === 'Roles' ? (
                        <RolesManagement
                            permissionModules={permissionModules}
                        />
                    ) : (
                        <UsersManagement />
                    )}
                </>
            )}
            {tab === 'Partner schools' && <PartnerSchoolsTab />}
            {tab === 'Academic' && <AcademicTab />}
        </div>
    );
}
