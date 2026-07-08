import { NavLink, useNavigate } from '@/lib/router-compat';
import { router } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useRef, useState } from 'react';
import {
    LayoutDashboard,
    UsersRound,
    User,
    CalendarOff,
    Star,
    Banknote,
    CalendarDays,
    BadgeCheck,
    FileBarChart,
    Settings,
    X,
    ChevronsUpDown,
    LogOut,
    UserCog,
    Megaphone,
    ListChecks,
    Fingerprint,
    GraduationCap,
    ClipboardList,
} from 'lucide-react';
import { LogoMark } from './Logo';
import { NotificationBell } from './NotificationBell';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/batches', label: 'Batches', icon: UsersRound },
    { to: '/trainees', label: 'Trainees', icon: User },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/leave', label: 'Leave', icon: CalendarOff },
    { to: '/biometrics', label: 'Biometrics', icon: Fingerprint },
    { to: '/tasks', label: 'Tasks', icon: ListChecks },
    { to: '/ratings', label: 'Ratings', icon: Star },
    { to: '/evaluation', label: 'Evaluation', icon: ClipboardList },
    { to: '/payments', label: 'Payments', icon: Banknote },
    { to: '/schedule', label: 'Schedule', icon: CalendarDays },
    { to: '/seminars', label: 'Seminars', icon: GraduationCap },
    { to: '/certificates', label: 'Certificates', icon: BadgeCheck },
    { to: '/reports', label: 'Reports', icon: FileBarChart },
    { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
    mobileOpen: boolean;
    onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 animate-fadeIn bg-ink/40 lg:hidden"
                    onClick={onCloseMobile}
                    aria-hidden="true"
                />
            )}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex h-screen w-[236px] flex-col gap-0.5 border-r border-neutral-200 bg-white p-3 transition-transform duration-200 ease-out lg:z-30 lg:translate-x-0',
                    mobileOpen
                        ? 'translate-x-0 animate-slideInLeft'
                        : '-translate-x-full',
                )}
            >
                <div className="mb-3 flex items-center justify-between gap-2 px-2 py-1">
                    <div className="flex items-center gap-2">
                        <LogoMark size={22} />
                        <span className="text-[11px] font-bold tracking-wide text-ink">
                            LS ADMIN
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <NotificationBell />
                        <button
                            onClick={onCloseMobile}
                            className="rounded-sm p-1 text-neutral-400 hover:bg-neutral-100 lg:hidden"
                            aria-label="Close menu"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
                <nav className="lss-scrollbar flex flex-1 flex-col gap-0.5 overflow-y-auto">
                    {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
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
                            <Icon size={17} strokeWidth={2} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <UserMenu />
            </aside>
        </>
    );
}

function UserMenu() {
    const navigate = useNavigate();
    const { displayName, email, initials, role } = useAuth();
    const [open, setOpen] = useState(false);
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
        >
            {open && (
                <div className="absolute right-0 bottom-[calc(100%+6px)] left-0 z-10 animate-scaleIn overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 shadow-popover">
                    <div className="border-b border-neutral-100 px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-ink">
                            {displayName}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                            {email}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setOpen(false);
                            navigate('/settings');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                        <UserCog size={14} className="shrink-0" />
                        Account settings
                    </button>
                    <button
                        onClick={() => {
                            setOpen(false);
                            router.post('/logout');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-danger-600 transition-colors hover:bg-danger-50"
                    >
                        <LogOut size={14} className="shrink-0" />
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
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-semibold text-white">
                    {initials}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm leading-tight font-semibold text-ink">
                        {displayName}
                    </span>
                    <span className="block truncate text-xs leading-tight text-neutral-500 capitalize">
                        {role}
                    </span>
                </span>
                <ChevronsUpDown
                    size={14}
                    className="shrink-0 text-neutral-400"
                />
            </button>
        </div>
    );
}
