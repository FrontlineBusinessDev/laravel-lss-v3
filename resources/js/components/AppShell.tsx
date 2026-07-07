import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <div className="no-print contents">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col lg:ml-[236px]">
        <div className="no-print contents">
          <TopBar onOpenMenu={() => setMobileOpen(true)} />
        </div>
        <main className="flex-1 p-4 sm:p-5 lg:p-6">
          <div className="mx-auto max-w-[1320px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
