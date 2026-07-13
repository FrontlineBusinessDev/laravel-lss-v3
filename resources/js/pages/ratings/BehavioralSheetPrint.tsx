import { Star } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import type { BehavioralQuestion, BehavioralRating } from '@/types';
interface BehavioralSheetPrintProps {
  batchNo: string;
  rating: BehavioralRating;
  questions: BehavioralQuestion[];
  average: number;
  generatedAt: string;
}
function PrintStars({
  value
}: {
  value: number;
}) {
  return <span className="inline-flex items-center gap-0.5 align-middle" data-cy="behavioral-sheet-print-span-1">
      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className={i <= Math.round(value) ? 'fill-ink text-ink' : 'text-neutral-300'} data-cy="behavioral-sheet-print-star-2" />)}
      <span className="ml-1 text-[11px]" data-cy="behavioral-sheet-print-span-3">{value.toFixed(1)}</span>
    </span>;
}
function groupBySection(questions: BehavioralQuestion[]) {
  const map = new Map<string, BehavioralQuestion[]>();
  questions.forEach(q => {
    if (!map.has(q.section)) map.set(q.section, []);
    map.get(q.section)!.push(q);
  });
  return Array.from(map.entries());
}

/** Print-only Trainer Evaluation Form: one trainee's completed evaluation, grouped by section. */
export function BehavioralSheetPrint({
  batchNo,
  rating,
  questions,
  average,
  generatedAt
}: BehavioralSheetPrintProps) {
  const sections = groupBySection([...questions].sort((a, b) => a.order - b.order));
  const ratingQuestions = questions.filter(q => q.type === 'rating');
  return <div className="hidden print:block print-area bg-white text-ink p-8" data-cy="behavioral-sheet-print-div-4">
      <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4" data-cy="behavioral-sheet-print-header-5">
        <div className="flex items-center gap-3" data-cy="behavioral-sheet-print-div-6">
          <LogoMark size={38} data-cy="behavioral-sheet-print-logo-mark-7" />
          <div data-cy="behavioral-sheet-print-div-8">
            <div className="text-sm font-bold tracking-wide" data-cy="behavioral-sheet-print-div-frontline-business-solutions">FRONTLINE BUSINESS SOLUTIONS</div>
            <div className="text-[10px] text-neutral-500" data-cy="behavioral-sheet-print-div-learning-solutions-system">Learning Solutions System</div>
          </div>
        </div>
        <div className="text-right" data-cy="behavioral-sheet-print-div-11">
          <div className="text-base font-bold" data-cy="behavioral-sheet-print-div-trainer-evaluation-for-trainees">Trainer Evaluation for Trainees</div>
          <div className="text-[10px] text-neutral-500" data-cy="behavioral-sheet-print-div-generated">Generated {generatedAt}</div>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs" data-cy="behavioral-sheet-print-div-14">
        <div data-cy="behavioral-sheet-print-div-15"><span className="font-semibold" data-cy="behavioral-sheet-print-span-batch">Batch:</span> {batchNo}</div>
        <div data-cy="behavioral-sheet-print-div-17"><span className="font-semibold" data-cy="behavioral-sheet-print-span-trainee">Trainee:</span> {rating.traineeName}</div>
        <div data-cy="behavioral-sheet-print-div-19"><span className="font-semibold" data-cy="behavioral-sheet-print-span-evaluator">Evaluator:</span> {rating.evaluator}</div>
        <div data-cy="behavioral-sheet-print-div-21"><span className="font-semibold" data-cy="behavioral-sheet-print-span-date-evaluated">Date evaluated:</span> {rating.ratedAt}</div>
      </div>

      {sections.map(([section, qs]) => {
      const isRatingSection = qs[0]?.type === 'rating';
      return <div key={section} className="mb-4" data-cy="behavioral-sheet-print-div-23">
            <div className="mb-1.5 text-[12px] font-bold" data-cy="behavioral-sheet-print-div-24">{section}</div>
            {isRatingSection ? <table className="w-full border-collapse text-[11px]" data-cy="behavioral-sheet-print-table-25">
                <thead data-cy="behavioral-sheet-print-thead-26">
                  <tr className="border border-ink bg-neutral-100" data-cy="behavioral-sheet-print-tr-27">
                    <th className="border border-ink px-2 py-1.5 text-left" data-cy="behavioral-sheet-print-th-28">#</th>
                    <th className="border border-ink px-2 py-1.5 text-left" data-cy="behavioral-sheet-print-th-statement">Statement</th>
                    <th className="border border-ink px-2 py-1.5 text-left" data-cy="behavioral-sheet-print-th-score">Score</th>
                  </tr>
                </thead>
                <tbody data-cy="behavioral-sheet-print-tbody-31">
                  {qs.map((q, i) => {
              const answer = rating.answers.find(a => a.questionId === q.id);
              return <tr key={q.id} data-cy="behavioral-sheet-print-tr-32">
                        <td className="border border-ink px-2 py-1.5" data-cy="behavioral-sheet-print-td-33">{i + 1}</td>
                        <td className="border border-ink px-2 py-1.5" data-cy="behavioral-sheet-print-td-34">{q.question}</td>
                        <td className="border border-ink px-2 py-1.5" data-cy="behavioral-sheet-print-td-35"><PrintStars value={answer?.score ?? 0} data-cy="behavioral-sheet-print-print-stars-36" /></td>
                      </tr>;
            })}
                </tbody>
              </table> : <div className="flex flex-col gap-2" data-cy="behavioral-sheet-print-div-37">
                {qs.map(q => {
            const answer = rating.answers.find(a => a.questionId === q.id);
            return <div key={q.id} className="text-[11px]" data-cy="behavioral-sheet-print-div-38">
                      <div className="font-medium" data-cy="behavioral-sheet-print-div-39">{q.question}</div>
                      <div className="mt-1 min-h-[32px] rounded border border-ink p-2" data-cy="behavioral-sheet-print-div-40">{answer?.text || '\u2014'}</div>
                    </div>;
          })}
              </div>}
          </div>;
    })}

      {ratingQuestions.length > 0 && <table className="w-full border-collapse text-[11px]" data-cy="behavioral-sheet-print-table-41">
          <tbody data-cy="behavioral-sheet-print-tbody-42">
            <tr className="bg-neutral-100 font-semibold" data-cy="behavioral-sheet-print-tr-43">
              <td className="border border-ink px-2 py-1.5" data-cy="behavioral-sheet-print-td-overall-average-rated-statements">Overall average (rated statements)</td>
              <td className="border border-ink px-2 py-1.5" data-cy="behavioral-sheet-print-td-45"><PrintStars value={average} data-cy="behavioral-sheet-print-print-stars-46" /></td>
            </tr>
          </tbody>
        </table>}

      <div className="mt-14 grid grid-cols-2 gap-10 text-xs" data-cy="behavioral-sheet-print-div-47">
        <div data-cy="behavioral-sheet-print-div-48"><div className="border-t border-ink pt-1.5" data-cy="behavioral-sheet-print-div-evaluator-signature-over-printed-name">Evaluator Signature over Printed Name</div></div>
        <div data-cy="behavioral-sheet-print-div-50"><div className="border-t border-ink pt-1.5" data-cy="behavioral-sheet-print-div-program-coordinator-signature-over-printed-name">Program Coordinator Signature over Printed Name</div></div>
      </div>
    </div>;
}