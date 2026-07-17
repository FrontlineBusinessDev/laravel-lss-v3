import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { router } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { ChangePasswordModal } from '@/components/modal/ChangePasswordModal';
import { Menu, LogOut, UserCog, KeyRound } from 'lucide-react';
import { LogoMark } from './Logo';
import { NotificationBell } from './NotificationBell';
export function TopBar({
  onOpenMenu
}: {
  onOpenMenu: () => void;
}) {
  const navigate = useNavigate();
  const {
    displayName,
    initials,
    role
  } = useAuth();
  const [open, setOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);
  return <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-neutral-200 bg-white px-3 lg:hidden" data-cy="top-bar-header-1">
      <button onClick={onOpenMenu} aria-label="Open menu" className="rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 active:scale-95" data-cy="top-bar-button-open-menu">
        <Menu size={18} data-cy="top-bar-menu-3" />
      </button>
      <div className="flex flex-1 items-center gap-1.5" data-cy="top-bar-div-4">
        <LogoMark size={18} data-cy="top-bar-logo-mark-5" />
        <span className="text-[11px] font-bold tracking-wide text-ink" data-cy="top-bar-span-ls-admin">LS ADMIN</span>
      </div>
      <NotificationBell data-cy="top-bar-notification-bell-7" />
      <div ref={ref} className="relative" data-cy="top-bar-div-8">
        <button onClick={() => setOpen(v => !v)} aria-haspopup="menu" aria-expanded={open} className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-[11px] font-semibold text-white" data-cy="top-bar-button-set-open">
          {initials}
        </button>
        {open && <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 animate-scaleIn overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 shadow-popover" data-cy="top-bar-div-10">
            <div className="border-b border-neutral-100 px-3 py-2.5" data-cy="top-bar-div-11">
              <p className="truncate text-sm font-semibold text-ink" data-cy="top-bar-p-12">{displayName}</p>
              <p className="truncate text-xs text-neutral-500 capitalize" data-cy="top-bar-p-13">{role}</p>
            </div>
            <button onClick={() => {
          setOpen(false);
          navigate('/settings');
        }} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50" data-cy="top-bar-button-set-open-2">
              <UserCog size={14} className="shrink-0" data-cy="top-bar-user-cog-15" />
              Account settings
            </button>
            <button onClick={() => {
          setOpen(false);
          setChangePasswordOpen(true);
        }} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50" data-cy="top-bar-button-change-password">
              <KeyRound size={14} className="shrink-0" data-cy="top-bar-key-round-16" />
              Change password
            </button>
            <button onClick={() => {
          setOpen(false);
          router.post('/logout');
        }} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-danger-600 transition-colors hover:bg-danger-50" data-cy="top-bar-button-set-open-3">
              <LogOut size={14} className="shrink-0" data-cy="top-bar-log-out-17" />
              Log out
            </button>
          </div>}
      </div>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </header>;
}