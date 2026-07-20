import { ChangePasswordModal } from '@/components/modal/ChangePasswordModal';
import { useAuth } from '@/hooks/use-auth';
import { usePermission } from '@/hooks/use-permissions';
import { NavLink, useNavigate } from '@/lib/router-compat';
import { cn } from '@/lib/utils';
import type { NavigationItem } from '@/types/reusable/navigation';
import { router } from '@inertiajs/react';
import {
    BadgeCheck,
    Banknote,
    CalendarDays,
    CalendarOff,
    ChevronsUpDown,
    ClipboardList,
    FileBarChart,
    Fingerprint,
    GraduationCap,
    IdCard,
    KeyRound,
    LayoutDashboard,
    ListChecks,
    LogOut,
    Megaphone,
    ScrollText,
    Settings,
    Star,
    User,
    UserCog,
    UsersRound,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LogoMark } from './Logo';
import { NotificationBell } from './NotificationBell';
const NAV_ITEMS = [
    {
        to: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
    },
    {
        to: '/batches',
        label: 'Batches',
        icon: UsersRound,
    },
    {
        to: '/trainees',
        label: 'Trainees',
        icon: User,
    },
    {
        to: '/announcements',
        label: 'Announcements',
        icon: Megaphone,
    },
    {
        to: '/leave',
        label: 'Leave',
        icon: CalendarOff,
    },
    {
        to: '/biometrics',
        label: 'Biometrics',
        icon: Fingerprint,
    },
    {
        to: '/tasks',
        label: 'Tasks',
        icon: ListChecks,
    },
    {
        to: '/ratings',
        label: 'Ratings',
        icon: Star,
    },
    {
        to: '/evaluation',
        label: 'Evaluation',
        icon: ClipboardList,
    },
    {
        to: '/payments',
        label: 'Payments',
        icon: Banknote,
    },
    {
        to: '/schedule',
        label: 'Schedule',
        icon: CalendarDays,
    },
    {
        to: '/seminars',
        label: 'Seminars',
        icon: GraduationCap,
    },
    {
        to: '/certificates',
        label: 'Certificates',
        icon: BadgeCheck,
    },
    {
        to: '/reports',
        label: 'Reports',
        icon: FileBarChart,
    },
    {
        to: '/settings',
        label: 'Settings',
        icon: Settings,
    },
];

// Developer-only entries, appended when the current user has the developer role.
const DEVELOPER_ITEMS = [
    {
        to: '/system-log',
        label: 'System Log',
        icon: ScrollText,
    },
];

// Trainer's nav is scoped to its own /trainer/* placeholder pages, kept
// separate from the shared admin routes above (see routes/web.php).
const TRAINER_ITEMS: NavigationItem[] = [
    { to: '/trainer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/trainer/batches', label: 'Batches', icon: UsersRound },
    { to: '/trainer/trainees', label: 'Trainees', icon: User },
    { to: '/trainer/tasks', label: 'Tasks', icon: ListChecks },
    { to: '/trainer/schedule', label: 'Schedule', icon: CalendarDays },
    { to: '/trainer/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/trainer/leave', label: 'Leave', icon: CalendarOff },
    { to: '/trainer/ratings', label: 'Ratings', icon: Star },
];

// Trainee's nav is scoped to its own /trainee/* placeholder pages.
const TRAINEE_ITEMS: NavigationItem[] = [
    { to: '/trainee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/trainee/tasks', label: 'Tasks', icon: ListChecks },
    // { to: '/trainee/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/trainee/leave', label: 'Leave', icon: CalendarOff },
    // { to: '/trainee/biometrics', label: 'Biometrics', icon: Fingerprint },
    { to: '/trainee/evaluations', label: 'Evaluation', icon: ClipboardList },
    { to: '/trainee/ratings', label: 'Ratings', icon: Star },
    { to: '/trainee/payments', label: 'Payments', icon: Banknote },
    { to: '/trainee/my-info', label: 'My Info', icon: IdCard },
];
interface SidebarProps {
    mobileOpen: boolean;
    onCloseMobile: () => void;
}
export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
    const { role } = useAuth();
    const { hasRole } = usePermission();
    const navItems = hasRole('trainer')
        ? TRAINER_ITEMS
        : hasRole('trainee')
          ? TRAINEE_ITEMS
          : hasRole('developer')
            ? [...NAV_ITEMS, ...DEVELOPER_ITEMS]
            : NAV_ITEMS;

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 animate-fadeIn bg-ink/40 lg:hidden"
                    onClick={onCloseMobile}
                    aria-hidden="true"
                    data-cy="sidebar-div-close-mobile"
                />
            )}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex h-screen w-59 flex-col gap-0.5 border-r border-neutral-200 bg-white p-3 transition-transform duration-200 ease-out lg:z-30 lg:translate-x-0',
                    mobileOpen
                        ? 'translate-x-0 animate-slideInLeft'
                        : '-translate-x-full',
                )}
                data-cy="sidebar-aside-2"
            >
                <div
                    className="mb-3 flex items-center justify-between gap-2 px-2 py-1"
                    data-cy="sidebar-div-3"
                >
                    <div
                        className="flex items-center gap-2"
                        data-cy="sidebar-div-4"
                    >
                        <LogoMark size={22} data-cy="sidebar-logo-mark-5" />
                        <span
                            className="text-[11px] font-bold tracking-wide text-ink uppercase"
                            data-cy="sidebar-span-ls-admin"
                        >
                            LS {role}
                        </span>
                    </div>
                    <div
                        className="flex items-center gap-1"
                        data-cy="sidebar-div-7"
                    >
                        <NotificationBell data-cy="sidebar-notification-bell-8" />
                        <button
                            onClick={onCloseMobile}
                            className="rounded-sm p-1 text-neutral-400 hover:bg-neutral-100 lg:hidden"
                            aria-label="Close menu"
                            data-cy="sidebar-button-close-menu"
                        >
                            <X size={16} data-cy="sidebar-x-10" />
                        </button>
                    </div>
                </div>
                <nav
                    className="lss-scrollbar flex flex-1 flex-col gap-0.5 overflow-y-auto"
                    data-cy="sidebar-nav-11"
                >
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onCloseMobile}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm font-medium text-neutral-600 transition-colors duration-100',
                                    isActive
                                        ? 'bg-brand-50 text-brand-700'
                                        : 'hover:bg-neutral-100',
                                )
                            }
                        >
                            <Icon
                                size={17}
                                strokeWidth={2}
                                data-cy="sidebar-icon-13"
                            />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <UserMenu data-cy="sidebar-user-menu-14" />
            </aside>
        </>
    );
}

function UserMenu() {
    const navigate = useNavigate();
    const { displayName, email, initials, role } = useAuth();
    const [open, setOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) =>
            e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);
    return (
        <div
            ref={ref}
            className="relative mt-1 border-t border-neutral-100 pt-2"
            data-cy="sidebar-div-15"
        >
            {open && (
                <div
                    className="absolute right-0 bottom-[calc(100%+6px)] left-0 z-10 animate-scaleIn overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 shadow-popover"
                    data-cy="sidebar-div-16"
                >
                    <div
                        className="border-b border-neutral-100 px-3 py-2.5"
                        data-cy="sidebar-div-17"
                    >
                        <p
                            className="truncate text-sm font-semibold text-ink"
                            data-cy="sidebar-p-18"
                        >
                            {displayName}
                        </p>
                        <p
                            className="truncate text-xs text-neutral-500"
                            data-cy="sidebar-p-19"
                        >
                            {email}
                        </p>
                    </div>
                    {/* <button
                        onClick={() => {
                            setOpen(false);
                            navigate('/settings');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                        data-cy="sidebar-button-set-open"
                    >
                        <UserCog
                            size={14}
                            className="shrink-0"
                            data-cy="sidebar-user-cog-21"
                        />
                        Account settings
                    </button> */}
                    <button
                        onClick={() => {
                            setOpen(false);
                            setChangePasswordOpen(true);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                        data-cy="sidebar-button-change-password"
                    >
                        <KeyRound
                            size={14}
                            className="shrink-0"
                            data-cy="sidebar-key-round-22"
                        />
                        Change password
                    </button>
                    <button
                        onClick={() => {
                            setOpen(false);
                            router.post('/logout');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-danger-600 transition-colors hover:bg-danger-50"
                        data-cy="sidebar-button-set-open-2"
                    >
                        <LogOut
                            size={14}
                            className="shrink-0"
                            data-cy="sidebar-log-out-23"
                        />
                        Log out
                    </button>
                </div>
            )}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors',
                    open ? 'bg-neutral-100' : 'hover:bg-neutral-100',
                )}
                data-cy="sidebar-button-set-open-3"
            >
                <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-semibold text-white"
                    data-cy="sidebar-span-25"
                >
                    {initials}
                </span>
                <span className="min-w-0 flex-1" data-cy="sidebar-span-26">
                    <span
                        className="block truncate text-sm leading-tight font-semibold text-ink"
                        data-cy="sidebar-span-27"
                    >
                        {displayName}
                    </span>
                    <span
                        className="block truncate text-xs leading-tight text-neutral-500 capitalize"
                        data-cy="sidebar-span-28"
                    >
                        {role}
                    </span>
                </span>
                <ChevronsUpDown
                    size={14}
                    className="shrink-0 text-neutral-400"
                    data-cy="sidebar-chevrons-up-down-29"
                />
            </button>

            <ChangePasswordModal
                open={changePasswordOpen}
                onClose={() => setChangePasswordOpen(false)}
            />
        </div>
    );
}
