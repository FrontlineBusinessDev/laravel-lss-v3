import { useNavigate } from '@/lib/router-compat'
import { ArrowUpRight, Building2, CalendarRange, GraduationCap, Users } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/Button'
import type { ScheduleEntry } from './scheduleUtils'
import { formatShortDate, getSchoolColor } from './scheduleUtils'

export function ScheduleEntryModal({ entry, onClose }: { entry: ScheduleEntry | null; onClose: () => void }) {
  const navigate = useNavigate()
  if (!entry) return null

  const { batch, trainees, schoolCounts, programs, start, end } = entry

  return (
    <Modal open={!!entry} onClose={onClose} title={batch.batchNo} maxWidth={640}>
      <div className="-mt-1 flex flex-wrap items-center gap-2">
        <StatusBadge status={batch.status} />
        <span className="rounded-sm bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">{batch.setup}</span>
        <span className="text-xs text-neutral-400">·</span>
        <span className="text-xs text-neutral-500">{batch.programType}</span>
      </div>

      {/* Key facts */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
            <Building2 size={12} /> Industry
          </div>
          <div className="mt-1 text-sm font-semibold text-ink">{batch.industry}</div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
            <Users size={12} /> Trainees
          </div>
          <div className="mt-1 text-sm font-semibold text-ink">{trainees.length}</div>
        </div>
        <div className="col-span-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 sm:col-span-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
            <CalendarRange size={12} /> Batch timeline
          </div>
          <div className="mt-1 text-sm font-semibold text-ink">
            {formatShortDate(start)} &ndash; {formatShortDate(end)}
          </div>
          <div className="mt-0.5 text-[11px] text-neutral-400">Earliest start &rarr; latest projected completion</div>
        </div>
      </div>

      {/* School breakdown */}
      <div className="mt-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
          <GraduationCap size={13} /> Schools represented
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {schoolCounts.length === 0 && <span className="text-xs text-neutral-400">No trainees assigned yet.</span>}
          {schoolCounts.map(({ school, count }) => {
            const color = getSchoolColor(school)
            return (
              <span
                key={school}
                className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color.solid }} />
                {school}
                <span className="text-[10px] opacity-70">&times;{count}</span>
              </span>
            )
          })}
        </div>
      </div>

      {/* Programs */}
      {programs.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold text-neutral-600">Academic programs</h3>
          <div className="flex flex-wrap gap-1.5">
            {programs.map((p) => (
              <span key={p} className="rounded-sm bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Trainee list */}
      <div className="mt-4">
        <h3 className="mb-2 text-xs font-semibold text-neutral-600">Trainees ({trainees.length})</h3>
        <div className="max-h-52 overflow-y-auto rounded-lg border border-neutral-200 lss-scrollbar">
          {trainees.length === 0 && <div className="p-3 text-xs text-neutral-400">No trainees assigned yet.</div>}
          {trainees.map((t, i) => {
            const color = getSchoolColor(t.school)
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/trainees/${t.id}`)}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-neutral-50 ${
                  i !== 0 ? 'border-t border-neutral-100' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color.solid }} />
                    <span className="truncate text-sm font-medium text-ink">{t.name}</span>
                  </div>
                  <p className="truncate pl-3 text-[11px] text-neutral-500">
                    {t.school} · {t.academicProgram}
                  </p>
                </div>
                <StatusBadge status={t.status} className="shrink-0" />
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" icon={ArrowUpRight} iconPosition="right" onClick={() => navigate(`/batches/${batch.id}`)}>
          View full batch
        </Button>
      </div>
    </Modal>
  )
}
