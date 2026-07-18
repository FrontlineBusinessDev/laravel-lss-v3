import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { Bell, CalendarOff, CheckCheck } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNotifications } from '@/context/NotificationsContext';
import { cn } from '@/lib/utils';
function timeAgoLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
export function NotificationBell({
  className
}: {
  className?: string;
}) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      const menuWidth = 340;
      const left = Math.min(Math.max(8, r.left), window.innerWidth - menuWidth - 8);
      setCoords({
        top: r.bottom + 8,
        left
      });
    };
    place();
    const onDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node) || btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('resize', place);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', place);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  function openNotification(id: string, link?: string) {
    markRead(id);
    setOpen(false);
    if (link) navigate(link);
  }
  return <>
      <button ref={btnRef} type="button" onClick={() => setOpen(v => !v)} aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`} aria-haspopup="menu" aria-expanded={open} className={cn('relative flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700', open && 'bg-neutral-100 text-neutral-700', className)} data-cy="notification-bell-button-button">
        <Bell size={17} data-cy="notification-bell-bell-2" />
        {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger-600 px-1 text-[9px] font-bold leading-none text-white" data-cy="notification-bell-span-3">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>}
      </button>
      {open && createPortal(<div ref={menuRef} role="menu" style={{
      position: 'fixed',
      top: coords.top,
      left: coords.left,
      width: 340
    }} className="z-[70] max-h-[70vh] animate-scaleIn overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-popover" data-cy="notification-bell-div-4">
            <div className="flex items-center justify-between border-b border-neutral-100 px-3.5 py-2.5" data-cy="notification-bell-div-5">
              <span className="text-sm font-semibold text-ink" data-cy="notification-bell-span-notifications">Notifications</span>
              {unreadCount > 0 && <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] font-medium text-brand-600 transition-colors hover:text-brand-700" data-cy="notification-bell-button-mark-all-read">
                  <CheckCheck size={12} data-cy="notification-bell-check-check-8" /> Mark all read
                </button>}
            </div>
            <div className="max-h-[54vh] overflow-y-auto lss-scrollbar" data-cy="notification-bell-div-9">
              {notifications.length === 0 && <div className="px-4 py-8 text-center text-xs text-neutral-400" data-cy="notification-bell-div-no-notifications-yet">
                  <CalendarOff size={18} className="mx-auto mb-2 text-neutral-300" data-cy="notification-bell-calendar-off-11" />
                  No notifications yet.
                </div>}
              {notifications.map(n => <button key={n.id} role="menuitem" onClick={() => openNotification(n.id, n.link)} className={cn('flex w-full items-start gap-2.5 border-b border-neutral-50 px-3.5 py-3 text-left transition-colors hover:bg-neutral-50', !n.read && 'bg-brand-50/40')} data-cy="notification-bell-button-open-notification">
                  <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand-500')} data-cy="notification-bell-span-13" />
                  <span className="min-w-0 flex-1" data-cy="notification-bell-span-14">
                    <span className={cn('block text-xs leading-snug', n.read ? 'font-medium text-neutral-600' : 'font-semibold text-ink')} data-cy="notification-bell-span-15">
                      {n.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500" data-cy="notification-bell-span-16">{n.body}</span>
                    <span className="mt-1 block text-[10px] text-neutral-400" data-cy="notification-bell-span-17">{timeAgoLabel(n.createdAt)}</span>
                  </span>
                </button>)}
            </div>
          </div>, document.body)}
    </>;
}