import { useNavigate } from '@/lib/router-compat'
import { useBatches } from '@/context/BatchesContext'
import {
  UsersRound,
  GraduationCap,
  Activity,
  Star,
  Clock,
  FileWarning,
  CalendarOff,
  ListChecks,
  Megaphone,
  ChevronRight,
  BarChart3,
} from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { EarningsCard } from '@/components/EarningsCard'
import { MiniCalendar } from '@/components/MiniCalendar'
import { YearlyTraineesChart } from '@/components/YearlyTraineesChart'
import { DonutChart } from '@/components/DonutChart'
import {
  leaveRecords,
  tasks,
  announcements,
  calendarEvents,
  overallProgramRating,
  traineesPerYear,
  seminarParticipants,
  TODAY,
} from '@/data/mockData'
import { computeTotalEarnings } from '@/pages/reports/reportsUtils'
import { cn } from '@/lib/utils'

const MS_PER_DAY = 1000 * 60 * 60 * 24

function daysUntil(dateStr: string) {
  const target = new Date(dateStr)
  return Math.ceil((target.getTime() - TODAY.getTime()) / MS_PER_DAY)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TASK_STATUS_LABEL: Record<(typeof tasks)[number]['status'], string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  done: 'Done',
}
const TASK_STATUS_STYLE: Record<(typeof tasks)[number]['status'], string> = {
  pending: 'bg-neutral-100 text-neutral-600',
  in_progress: 'bg-warning-50 text-warning-800',
  done: 'bg-success-50 text-success-800',
}

function SectionCard({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string
  icon: React.ElementType
  count?: number
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white transition-colors duration-150 hover:border-neutral-300">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon size={15} className="text-neutral-400" />
          {title}
        </h2>
        {count !== undefined && <span className="text-xs font-medium text-neutral-400">{count}</span>}
      </div>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { batches, trainees } = useBatches()
  const totalTraineesEnrolled = trainees.length
  const totalEarnings = computeTotalEarnings(trainees, seminarParticipants)
  const ongoingTrainees = trainees.filter((t) => t.status === 'active').length

  const nearingEndTrainees = trainees
    .filter((t) => t.status === 'active')
    .map((t) => ({ ...t, daysLeft: daysUntil(t.endDate) }))
    .filter((t) => t.daysLeft >= 0 && t.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const incompleteDocsTrainees = trainees.filter((t) => !t.documentsComplete)
  const openTasks = tasks.filter((t) => t.status !== 'done')
  const onLeaveNow = leaveRecords.filter(
    (l) => l.status === 'approved' && l.leaveDate <= TODAY.toISOString().slice(0, 10) && l.returnDate >= TODAY.toISOString().slice(0, 10),
  )

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-neutral-500">Overview across all active programs · {formatDate(TODAY.toISOString())}</p>
      </div>

      {/* Top-line stats — every card carries a hint line so the row stays a uniform height */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total batches" value={batches.length} icon={UsersRound} hint={`${batches.filter((b) => b.status === 'active').length} currently active`} />
        <StatCard label="Total trainees" value={totalTraineesEnrolled} icon={GraduationCap} tone="accent" hint="Across all batches, all time" />
        <StatCard label="Ongoing trainees" value={ongoingTrainees} icon={Activity} tone="success" hint={`Across ${batches.filter((b) => b.status === 'active').length} active batches`} />
        <StatCard
          label="Overall LS program rating"
          value={overallProgramRating.toFixed(1)}
          icon={Star}
          tone="warning"
          hint="Based on partner school & trainee feedback"
        />
      </div>

      {/* Earnings + trainee status breakdown */}
      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <EarningsCard amount={totalEarnings} />
        <div className="rounded-lg border border-neutral-200 bg-white p-3.5 transition-colors hover:border-neutral-300">
          <h2 className="mb-3 text-xs text-neutral-500">Trainee status breakdown</h2>
          <DonutChart
            centerValue={totalTraineesEnrolled}
            centerLabel="total trainees"
            segments={[
              { label: 'Active', value: trainees.filter((t) => t.status === 'active').length, color: '#2176E3' },
              { label: 'Completed', value: trainees.filter((t) => t.status === 'completed').length, color: '#639922' },
              { label: 'Terminated', value: trainees.filter((t) => t.status === 'terminated').length, color: '#E24B4A' },
              { label: 'Archived', value: trainees.filter((t) => t.status === 'archived').length, color: '#9AA2AB' },
            ]}
          />
        </div>
        <MiniCalendar events={calendarEvents} initialDate={TODAY} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left / main column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <SectionCard title="Nearing training end date" icon={Clock} count={nearingEndTrainees.length}>
            {nearingEndTrainees.length === 0 ? (
              <p className="px-4 py-5 text-center text-xs text-neutral-400">No trainees ending within the next 2 weeks.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {nearingEndTrainees.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/trainees/${t.id}`)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink">{t.name}</div>
                      <div className="text-xs text-neutral-500">
                        {t.batchNo} · ends {formatDate(t.endDate)}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-medium',
                        t.daysLeft <= 3 ? 'bg-danger-50 text-danger-800' : 'bg-warning-50 text-warning-800',
                      )}
                    >
                      {t.daysLeft === 0 ? 'Ends today' : `${t.daysLeft} day${t.daysLeft === 1 ? '' : 's'} left`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Trainees with incomplete documents" icon={FileWarning} count={incompleteDocsTrainees.length}>
            {incompleteDocsTrainees.length === 0 ? (
              <p className="px-4 py-5 text-center text-xs text-neutral-400">All trainees have complete documents.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {incompleteDocsTrainees.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-semibold text-brand-700">
                        {t.initials}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-ink">{t.name}</div>
                        <div className="truncate text-xs text-neutral-500">
                          {t.batchNo} · Missing: {t.missingDocuments?.join(', ') || 'Unspecified'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/trainees/${t.id}`)}
                      className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700"
                    >
                      View <ChevronRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Trainees accommodated per year" icon={BarChart3}>
            <div className="p-4">
              <YearlyTraineesChart data={traineesPerYear} />
            </div>
          </SectionCard>

          <SectionCard title="Announcements" icon={Megaphone}>
            <div className="divide-y divide-neutral-100">
              {announcements.map((a) => (
                <div key={a.id} className="px-4 py-3">
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink">{a.title}</span>
                    <span className="shrink-0 text-xs text-neutral-400">{formatDate(a.postedAt)}</span>
                  </div>
                  <p className="text-xs text-neutral-500">{a.body}</p>
                  <p className="mt-1 text-xs text-neutral-400">Posted by {a.postedBy}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right / side column */}
        <div className="flex flex-col gap-4">
          <SectionCard title="Trainees on leave" icon={CalendarOff} count={onLeaveNow.length}>
            {onLeaveNow.length === 0 ? (
              <p className="px-4 py-5 text-center text-xs text-neutral-400">No trainees currently on leave.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {onLeaveNow.map((lv) => (
                  <div key={lv.id} className="flex items-center gap-2.5 px-4 py-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-600">
                      {lv.initials}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink">{lv.traineeName}</div>
                      <div className="truncate text-xs text-neutral-500">
                        {lv.leaveType} · {formatDate(lv.leaveDate)}–{formatDate(lv.returnDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Ongoing tasks" icon={ListChecks} count={openTasks.length}>
            {openTasks.length === 0 ? (
              <p className="px-4 py-5 text-center text-xs text-neutral-400">No ongoing tasks right now.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {openTasks.map((t) => (
                  <div key={t.id} className="px-4 py-3">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-ink">{t.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        {t.assignee} · due {formatDate(t.dueDate)}
                      </span>
                      <span className={cn('shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-medium', TASK_STATUS_STYLE[t.status])}>
                        {TASK_STATUS_LABEL[t.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Recent batches" icon={UsersRound}>
            <div className="divide-y divide-neutral-100">
              {batches.slice(0, 4).map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/batches/${b.id}`)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-neutral-50"
                >
                  <div>
                    <div className="font-mono text-sm font-medium text-ink">{b.batchNo}</div>
                    <div className="text-xs text-neutral-500">{b.programType}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
