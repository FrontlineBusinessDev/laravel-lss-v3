import { useNavigate } from '@/lib/router-compat';
import { ArrowUpRight, Building2, CalendarRange, GraduationCap, Users } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/Button';
import type { ScheduleEntry } from './scheduleUtils';
import { formatShortDate, getSchoolColor } from './scheduleUtils';
export function ScheduleEntryModal({
  entry,
  onClose
}: {
  entry: ScheduleEntry | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  if (!entry) return null;
  const {
    batch,
    trainees,
    schoolCounts,
    programs,
    start,
    end
  } = entry;
  return <Modal open={!!entry} onClose={onClose} title={batch.batch_code} maxWidth={640} data-cy="schedule-detail-modal">
      <div className="-mt-1 flex flex-wrap items-center gap-2" data-cy="schedule-entry-modal-div-2">
        <StatusBadge status={batch.status} data-cy="schedule-entry-modal-status-badge-3" />
        <span className="rounded-sm bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600" data-cy="schedule-entry-modal-span-4">{batch.setup}</span>
        <span className="text-xs text-neutral-400" data-cy="schedule-entry-modal-span-5">·</span>
        <span className="text-xs text-neutral-500" data-cy="schedule-entry-modal-span-6">{batch.program_type}</span>
      </div>

      {/* Key facts */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4" data-cy="schedule-entry-modal-div-7">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3" data-cy="schedule-entry-modal-div-8">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500" data-cy="schedule-entry-modal-div-industry">
            <Building2 size={12} data-cy="schedule-entry-modal-building2-10" /> Industry
          </div>
          <div className="mt-1 text-sm font-semibold text-ink" data-cy="schedule-entry-modal-div-11">{batch.industry}</div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3" data-cy="schedule-entry-modal-div-12">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500" data-cy="schedule-entry-modal-div-trainees">
            <Users size={12} data-cy="schedule-entry-modal-users-14" /> Trainees
          </div>
          <div className="mt-1 text-sm font-semibold text-ink" data-cy="schedule-entry-modal-div-15">{trainees.length}</div>
        </div>
        <div className="col-span-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 sm:col-span-2" data-cy="schedule-entry-modal-div-16">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500" data-cy="schedule-entry-modal-div-batch-timeline">
            <CalendarRange size={12} data-cy="schedule-entry-modal-calendar-range-18" /> Batch timeline
          </div>
          <div className="mt-1 text-sm font-semibold text-ink" data-cy="schedule-entry-modal-div-19">
            {formatShortDate(start)} &ndash; {formatShortDate(end)}
          </div>
          <div className="mt-0.5 text-[11px] text-neutral-400" data-cy="schedule-entry-modal-div-earliest-start-latest-projected-completion">Earliest start &rarr; latest projected completion</div>
        </div>
      </div>

      {/* School breakdown */}
      <div className="mt-4" data-cy="schedule-entry-modal-div-21">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600" data-cy="schedule-entry-modal-h3-schools-represented">
          <GraduationCap size={13} data-cy="schedule-entry-modal-graduation-cap-23" /> Schools represented
        </h3>
        <div className="flex flex-wrap gap-1.5" data-cy="schedule-entry-modal-div-24">
          {schoolCounts.length === 0 && <span className="text-xs text-neutral-400" data-cy="schedule-entry-modal-span-no-trainees-assigned-yet">No trainees assigned yet.</span>}
          {schoolCounts.map(({
          school,
          count
        }) => {
          const color = getSchoolColor(school);
          return <span key={school} className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium" style={{
            backgroundColor: color.bg,
            color: color.text
          }} data-cy="schedule-entry-modal-span-26">
                <span className="h-1.5 w-1.5 rounded-full" style={{
              backgroundColor: color.solid
            }} data-cy="schedule-entry-modal-span-27" />
                {school}
                <span className="text-[10px] opacity-70" data-cy="schedule-entry-modal-span-28">&times;{count}</span>
              </span>;
        })}
        </div>
      </div>

      {/* Programs */}
      {programs.length > 0 && <div className="mt-4" data-cy="schedule-entry-modal-div-29">
          <h3 className="mb-2 text-xs font-semibold text-neutral-600" data-cy="schedule-entry-modal-h3-academic-programs">Academic programs</h3>
          <div className="flex flex-wrap gap-1.5" data-cy="schedule-entry-modal-div-31">
            {programs.map(p => <span key={p} className="rounded-sm bg-neutral-100 px-2 py-1 text-xs text-neutral-600" data-cy="schedule-entry-modal-span-32">
                {p}
              </span>)}
          </div>
        </div>}

      {/* Trainee list */}
      <div className="mt-4" data-cy="schedule-entry-modal-div-33">
        <h3 className="mb-2 text-xs font-semibold text-neutral-600" data-cy="schedule-entry-modal-h3-trainees">Trainees ({trainees.length})</h3>
        <div className="max-h-52 overflow-y-auto rounded-lg border border-neutral-200 lss-scrollbar" data-cy="schedule-entry-modal-div-35">
          {trainees.length === 0 && <div className="p-3 text-xs text-neutral-400" data-cy="schedule-entry-modal-div-no-trainees-assigned-yet">No trainees assigned yet.</div>}
          {trainees.map((t, i) => {
          const color = getSchoolColor(t.school);
          return <button key={t.id} onClick={() => navigate(`/trainees/${t.id}`)} className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-neutral-50 ${i !== 0 ? 'border-t border-neutral-100' : ''}`} data-cy="schedule-entry-modal-button-navigate">
                <div className="min-w-0 flex-1" data-cy="schedule-entry-modal-div-38">
                  <div className="flex items-center gap-1.5" data-cy="schedule-entry-modal-div-39">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{
                  backgroundColor: color.solid
                }} data-cy="schedule-entry-modal-span-40" />
                    <span className="truncate text-sm font-medium text-ink" data-cy="schedule-entry-modal-span-41">{t.name}</span>
                  </div>
                  <p className="truncate pl-3 text-[11px] text-neutral-500" data-cy="schedule-entry-modal-p-42">
                    {t.school} · {t.academic_program}
                  </p>
                </div>
                <StatusBadge status={t.status} className="shrink-0" data-cy="schedule-entry-modal-status-badge-43" />
              </button>;
        })}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2" data-cy="schedule-entry-modal-div-44">
        <Button variant="secondary" onClick={onClose} data-cy="schedule-entry-modal-button-close">
          Close
        </Button>
        <Button variant="primary" icon={ArrowUpRight} iconPosition="right" onClick={() => navigate(`/batches/${batch.id}`)} data-cy="schedule-entry-modal-button-navigate-2">
          View full batch
        </Button>
      </div>
    </Modal>;
}