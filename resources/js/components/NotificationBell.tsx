import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@/lib/router-compat'
import { Bell, CalendarOff, CheckCheck } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useNotifications } from '@/context/NotificationsContext'
import { cn } from '@/lib/utils'

function timeAgoLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function NotificationBell({ className }: { className?: string }) {
  const navigate = useNavigate()
  const { adminNotifications, unreadAdminCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect()
      if (!r) return
      const menuWidth = 340
      const left = Math.min(Math.max(8, r.left), window.innerWidth - menuWidth - 8)
      setCoords({ top: r.bottom + 8, left })
    }
    place()
    const onDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node) || btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('resize', place)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', place)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function openNotification(id: string, link?: string) {
    markRead(id)
    setOpen(false)
    if (link) navigate(link)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadAdminCount ? ` (${unreadAdminCount} unread)` : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'relative flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700',
          open && 'bg-neutral-100 text-neutral-700',
          className,
        )}
      >
        <Bell size={17} />
        {unreadAdminCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger-600 px-1 text-[9px] font-bold leading-none text-white">
            {unreadAdminCount > 9 ? '9+' : unreadAdminCount}
          </span>
        )}
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: 340 }}
            className="z-[70] max-h-[70vh] animate-scaleIn overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-popover"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-3.5 py-2.5">
              <span className="text-sm font-semibold text-ink">Notifications</span>
              {unreadAdminCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-brand-600 transition-colors hover:text-brand-700"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[54vh] overflow-y-auto lss-scrollbar">
              {adminNotifications.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-neutral-400">
                  <CalendarOff size={18} className="mx-auto mb-2 text-neutral-300" />
                  No notifications yet.
                </div>
              )}
              {adminNotifications.map((n) => (
                <button
                  key={n.id}
                  role="menuitem"
                  onClick={() => openNotification(n.id, n.link)}
                  className={cn(
                    'flex w-full items-start gap-2.5 border-b border-neutral-50 px-3.5 py-3 text-left transition-colors hover:bg-neutral-50',
                    !n.read && 'bg-brand-50/40',
                  )}
                >
                  <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand-500')} />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-xs leading-snug', n.read ? 'font-medium text-neutral-600' : 'font-semibold text-ink')}>
                      {n.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500">{n.body}</span>
                    <span className="mt-1 block text-[10px] text-neutral-400">{timeAgoLabel(n.createdAt)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
