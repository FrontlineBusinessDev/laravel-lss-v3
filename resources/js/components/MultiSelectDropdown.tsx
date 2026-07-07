import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiSelectProps {
  options: string[]
  value: string[]
  placeholder: string
  onChange: (value: string[]) => void
  className?: string
}

export function MultiSelectDropdown({ options, value, placeholder, onChange, className }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect()
      if (!r) return
      setCoords({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 200) })
    }
    place()
    const onDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node) || btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 shadow-card transition-all duration-150 hover:border-neutral-300 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-brand-100',
          open && 'border-brand-400 ring-2 ring-brand-100',
          value.length === 0 && 'text-neutral-400',
          className,
        )}
      >
        <span className="truncate">{value.length === 0 ? placeholder : `${placeholder} (${value.length})`}</span>
        <ChevronDown size={14} className={cn('shrink-0 text-neutral-400 transition-transform duration-150', open && 'rotate-180 text-brand-500')} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{ position: 'fixed', top: coords.top, left: coords.left, minWidth: coords.width }}
            className="z-[60] max-h-64 animate-scaleIn overflow-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-popover lss-scrollbar"
          >
            {options.map((opt) => {
              const checked = value.includes(opt)
              return (
                <button
                  key={opt}
                  role="option"
                  aria-selected={checked}
                  onClick={() => toggle(opt)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-700',
                    checked && 'bg-brand-50 text-brand-700',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border',
                      checked ? 'border-brand-500 bg-brand-500' : 'border-neutral-300 bg-white',
                    )}
                  >
                    {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="truncate">{opt}</span>
                </button>
              )
            })}
            {options.length === 0 && <div className="px-2.5 py-2 text-xs text-neutral-400">No options</div>}
          </div>,
          document.body,
        )}
    </>
  )
}
