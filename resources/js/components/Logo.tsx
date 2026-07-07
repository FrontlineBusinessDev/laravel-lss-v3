interface LogoProps {
  size?: number
  className?: string
}

/** The Frontline Business Solutions spiral sphere mark. */
export function LogoMark({ size = 40, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lss-grad-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E31C8D" />
          <stop offset="100%" stopColor="#5A1A45" />
        </linearGradient>
      </defs>
      <path d="M 50 5 C 30 5 20 20 22 35 C 40 25 60 20 78 30 C 75 15 65 5 50 5 Z" fill="#E31C8D" />
      <path d="M 20 38 C 19 48 22 58 30 65 C 45 55 62 48 82 45 C 80 40 78 35 75 32 C 58 28 36 30 20 38 Z" fill="#5A1A45" />
      <path d="M 32 68 C 40 78 52 82 63 78 C 60 68 55 58 48 52 C 40 56 34 62 32 68 Z" fill="#E31C8D" />
      <path d="M 65 78 C 75 73 82 63 83 52 C 76 50 68 50 61 52 C 62 62 63 71 65 78 Z" fill="#5A1A45" />
    </svg>
  )
}

export function LogoLockup() {
  return (
    <div className="flex flex-col items-center">
      <LogoMark size={52} className="mb-3" />
      <div className="text-center">
        <div className="text-[15px] font-bold tracking-wide text-ink">FRONTLINE</div>
        <div className="text-[10px] text-neutral-600 mb-1.5">business solutions</div>
        <div className="inline-block bg-brand-500 text-white text-[9px] font-semibold tracking-widest px-2.5 py-1 rounded">
          LEARNING SOLUTIONS
        </div>
      </div>
    </div>
  )
}
