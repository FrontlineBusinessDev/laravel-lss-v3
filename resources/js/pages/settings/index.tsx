import { useState } from 'react'
import { UsersTab } from './tabs/users/UsersTab'
import { PartnerSchoolsTab } from './tabs/partner-schools/PartnerSchoolsTab'
import { AcademicTab } from './tabs/academic/AcademicTab'
import { cn } from '@/lib/utils'

const TABS = ['Users', 'Partner schools', 'Academic'] as const
type Tab = (typeof TABS)[number]

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('Users')

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Settings</h1>
      <p className="mb-4 text-sm text-neutral-500">Manage user accounts, partner schools, and academic reference data</p>

      <div className="mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5 lss-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'whitespace-nowrap pb-2.5 text-sm font-medium transition-colors',
              tab === t ? 'border-b-2 border-brand-500 text-ink font-semibold' : 'text-neutral-500 hover:text-neutral-700',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Users' && <UsersTab />}
      {tab === 'Partner schools' && <PartnerSchoolsTab />}
      {tab === 'Academic' && <AcademicTab />}
    </div>
  )
}
