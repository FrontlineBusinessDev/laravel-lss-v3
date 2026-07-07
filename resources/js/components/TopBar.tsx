import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@/lib/router-compat'
import { router } from '@inertiajs/react'
import { useAuth } from '@/hooks/use-auth'
import { Menu, LogOut, UserCog } from 'lucide-react'
import { LogoMark } from './Logo'
import { NotificationBell } from './NotificationBell'

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const navigate = useNavigate()
  const { displayName, initials, role } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-neutral-200 bg-white px-3 lg:hidden">
      <button
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 active:scale-95"
      >
        <Menu size={18} />
      </button>
      <div className="flex flex-1 items-center gap-1.5">
        <LogoMark size={18} />
        <span className="text-[11px] font-bold tracking-wide text-ink">LS ADMIN</span>
      </div>
      <NotificationBell />
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-[11px] font-semibold text-white"
        >
          {initials}
        </button>
        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 animate-scaleIn overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 shadow-popover">
            <div className="border-b border-neutral-100 px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
              <p className="truncate text-xs text-neutral-500 capitalize">{role}</p>
            </div>
            <button
              onClick={() => {
                setOpen(false)
                navigate('/settings')
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <UserCog size={14} className="shrink-0" />
              Account settings
            </button>
            <button
              onClick={() => {
                setOpen(false)
                router.post('/logout')
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium text-danger-600 transition-colors hover:bg-danger-50"
            >
              <LogOut size={14} className="shrink-0" />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
