import { LogoMark } from '@/components/Logo'
import type { TaskRating } from '@/types'

interface RatingSheetPrintProps {
  batchNo: string
  taskName: string
  ratings: TaskRating[]
  average: number
  generatedAt: string
}

function PrintScore({ value }: { value: number }) {
  return (
    <span className="align-middle font-semibold">
      {value ? Math.round(value) : '—'}
      <span className="ml-0.5 font-normal text-neutral-500">/100</span>
    </span>
  )
}

/** Print-only Task Rating sheet: completed trainee ratings for a task/project, with the average. */
export function RatingSheetPrint({ batchNo, taskName, ratings, average, generatedAt }: RatingSheetPrintProps) {
  return (
    <div className="hidden print:block print-area bg-white text-ink p-8">
      <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4">
        <div className="flex items-center gap-3">
          <LogoMark size={38} />
          <div>
            <div className="text-sm font-bold tracking-wide">FRONTLINE BUSINESS SOLUTIONS</div>
            <div className="text-[10px] text-neutral-500">Learning Solutions System</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold">Task Rating Sheet</div>
          <div className="text-[10px] text-neutral-500">Generated {generatedAt}</div>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
        <div><span className="font-semibold">Batch:</span> {batchNo}</div>
        <div><span className="font-semibold">Task / Project:</span> {taskName}</div>
      </div>

      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="border border-ink bg-neutral-100">
            <th className="border border-ink px-2 py-1.5 text-left">Trainee</th>
            <th className="border border-ink px-2 py-1.5 text-left">Rating</th>
            <th className="border border-ink px-2 py-1.5 text-left">Comments</th>
            <th className="border border-ink px-2 py-1.5 text-left">Evaluator</th>
            <th className="border border-ink px-2 py-1.5 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {ratings.map((r) => (
            <tr key={r.id}>
              <td className="border border-ink px-2 py-1.5 font-medium">{r.traineeName}</td>
              <td className="border border-ink px-2 py-1.5"><PrintScore value={r.rating} /></td>
              <td className="border border-ink px-2 py-1.5">{r.comments || '\u2014'}</td>
              <td className="border border-ink px-2 py-1.5">{r.evaluator}</td>
              <td className="border border-ink px-2 py-1.5">{r.ratedAt}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-neutral-100 font-semibold">
            <td className="border border-ink px-2 py-1.5" colSpan={1}>Average</td>
            <td className="border border-ink px-2 py-1.5" colSpan={4}><PrintScore value={average} /></td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-14 grid grid-cols-2 gap-10 text-xs">
        <div><div className="border-t border-ink pt-1.5">Evaluator Signature over Printed Name</div></div>
        <div><div className="border-t border-ink pt-1.5">Program Coordinator Signature over Printed Name</div></div>
      </div>
    </div>
  )
}
