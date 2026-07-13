import { LogoMark } from '@/components/Logo';
import type { TaskRating } from '@/types';
interface RatingSheetPrintProps {
  batchNo: string;
  taskName: string;
  ratings: TaskRating[];
  average: number;
  generatedAt: string;
}
function PrintScore({
  value
}: {
  value: number;
}) {
  return <span className="align-middle font-semibold" data-cy="rating-sheet-print-span-1">
      {value ? Math.round(value) : '—'}
      <span className="ml-0.5 font-normal text-neutral-500" data-cy="rating-sheet-print-span-100">/100</span>
    </span>;
}

/** Print-only Task Rating sheet: completed trainee ratings for a task/project, with the average. */
export function RatingSheetPrint({
  batchNo,
  taskName,
  ratings,
  average,
  generatedAt
}: RatingSheetPrintProps) {
  return <div className="hidden print:block print-area bg-white text-ink p-8" data-cy="rating-sheet-print-div-3">
      <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4" data-cy="rating-sheet-print-header-4">
        <div className="flex items-center gap-3" data-cy="rating-sheet-print-div-5">
          <LogoMark size={38} data-cy="rating-sheet-print-logo-mark-6" />
          <div data-cy="rating-sheet-print-div-7">
            <div className="text-sm font-bold tracking-wide" data-cy="rating-sheet-print-div-frontline-business-solutions">FRONTLINE BUSINESS SOLUTIONS</div>
            <div className="text-[10px] text-neutral-500" data-cy="rating-sheet-print-div-learning-solutions-system">Learning Solutions System</div>
          </div>
        </div>
        <div className="text-right" data-cy="rating-sheet-print-div-10">
          <div className="text-base font-bold" data-cy="rating-sheet-print-div-task-rating-sheet">Task Rating Sheet</div>
          <div className="text-[10px] text-neutral-500" data-cy="rating-sheet-print-div-generated">Generated {generatedAt}</div>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs" data-cy="rating-sheet-print-div-13">
        <div data-cy="rating-sheet-print-div-14"><span className="font-semibold" data-cy="rating-sheet-print-span-batch">Batch:</span> {batchNo}</div>
        <div data-cy="rating-sheet-print-div-16"><span className="font-semibold" data-cy="rating-sheet-print-span-task-project">Task / Project:</span> {taskName}</div>
      </div>

      <table className="w-full border-collapse text-[11px]" data-cy="rating-sheet-print-table-18">
        <thead data-cy="rating-sheet-print-thead-19">
          <tr className="border border-ink bg-neutral-100" data-cy="rating-sheet-print-tr-20">
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="rating-sheet-print-th-trainee">Trainee</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="rating-sheet-print-th-rating">Rating</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="rating-sheet-print-th-comments">Comments</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="rating-sheet-print-th-evaluator">Evaluator</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="rating-sheet-print-th-date">Date</th>
          </tr>
        </thead>
        <tbody data-cy="rating-sheet-print-tbody-26">
          {ratings.map(r => <tr key={r.id} data-cy="rating-sheet-print-tr-27">
              <td className="border border-ink px-2 py-1.5 font-medium" data-cy="rating-sheet-print-td-28">{r.traineeName}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="rating-sheet-print-td-29"><PrintScore value={r.rating} data-cy="rating-sheet-print-print-score-30" /></td>
              <td className="border border-ink px-2 py-1.5" data-cy="rating-sheet-print-td-31">{r.comments || '\u2014'}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="rating-sheet-print-td-32">{r.evaluator}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="rating-sheet-print-td-33">{r.ratedAt}</td>
            </tr>)}
        </tbody>
        <tfoot data-cy="rating-sheet-print-tfoot-34">
          <tr className="bg-neutral-100 font-semibold" data-cy="rating-sheet-print-tr-35">
            <td className="border border-ink px-2 py-1.5" colSpan={1} data-cy="rating-sheet-print-td-average">Average</td>
            <td className="border border-ink px-2 py-1.5" colSpan={4} data-cy="rating-sheet-print-td-37"><PrintScore value={average} data-cy="rating-sheet-print-print-score-38" /></td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-14 grid grid-cols-2 gap-10 text-xs" data-cy="rating-sheet-print-div-39">
        <div data-cy="rating-sheet-print-div-40"><div className="border-t border-ink pt-1.5" data-cy="rating-sheet-print-div-evaluator-signature-over-printed-name">Evaluator Signature over Printed Name</div></div>
        <div data-cy="rating-sheet-print-div-42"><div className="border-t border-ink pt-1.5" data-cy="rating-sheet-print-div-program-coordinator-signature-over-printed-name">Program Coordinator Signature over Printed Name</div></div>
      </div>
    </div>;
}