import { Star } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import type {
    BehavioralEvaluation,
    BehavioralQuestion,
} from '@/types/modules/ratings/behavioral';

interface BehavioralSheetPrintProps {
    batchNo: string;
    traineeName: string;
    evaluation: BehavioralEvaluation;
    questions: BehavioralQuestion[];
    average: number;
    generatedAt: string;
}

function PrintStars({ value }: { value: number }) {
    return (
        <span className="inline-flex items-center gap-0.5 align-middle">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={12}
                    className={
                        i <= Math.round(value)
                            ? 'fill-ink text-ink'
                            : 'text-neutral-300'
                    }
                />
            ))}
            <span className="ml-1 text-[11px]">{value.toFixed(1)}</span>
        </span>
    );
}

function groupBySection(questions: BehavioralQuestion[]) {
    const map = new Map<string, BehavioralQuestion[]>();
    questions.forEach((q) => {
        if (!map.has(q.section)) map.set(q.section, []);
        map.get(q.section)!.push(q);
    });
    return Array.from(map.entries());
}

function evaluatorName(evaluation: BehavioralEvaluation): string {
    return evaluation.evaluator
        ? `${evaluation.evaluator.first_name} ${evaluation.evaluator.last_name}`.trim()
        : '—';
}

/** Print-only Trainer Evaluation Form: one trainee's completed evaluation, grouped by section. */
export function BehavioralSheetPrint({
    batchNo,
    traineeName,
    evaluation,
    questions,
    average,
    generatedAt,
}: BehavioralSheetPrintProps) {
    const sections = groupBySection(
        [...questions].sort((a, b) => a.order - b.order),
    );
    const ratingQuestions = questions.filter((q) => q.type === 'rating');

    return (
        <div className="print-area hidden bg-white p-8 text-ink print:block">
            <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4">
                <div className="flex items-center gap-3">
                    <LogoMark size={38} />
                    <div>
                        <div className="text-sm font-bold tracking-wide">
                            FRONTLINE BUSINESS SOLUTIONS
                        </div>
                        <div className="text-[10px] text-neutral-500">
                            Learning Solutions System
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-base font-bold">
                        Trainer Evaluation for Trainees
                    </div>
                    <div className="text-[10px] text-neutral-500">
                        Generated {generatedAt}
                    </div>
                </div>
            </header>

            <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                <div>
                    <span className="font-semibold">Batch:</span> {batchNo}
                </div>
                <div>
                    <span className="font-semibold">Trainee:</span>{' '}
                    {traineeName}
                </div>
                <div>
                    <span className="font-semibold">Evaluator:</span>{' '}
                    {evaluatorName(evaluation)}
                </div>
                <div>
                    <span className="font-semibold">Date evaluated:</span>{' '}
                    {evaluation.updated_at?.slice(0, 10)}
                </div>
            </div>

            {sections.map(([section, qs]) => {
                const isRatingSection = qs[0]?.type === 'rating';
                return (
                    <div key={section} className="mb-4">
                        <div className="mb-1.5 text-[12px] font-bold">
                            {section}
                        </div>
                        {isRatingSection ? (
                            <table className="w-full border-collapse text-[11px]">
                                <thead>
                                    <tr className="border border-ink bg-neutral-100">
                                        <th className="border border-ink px-2 py-1.5 text-left">
                                            #
                                        </th>
                                        <th className="border border-ink px-2 py-1.5 text-left">
                                            Statement
                                        </th>
                                        <th className="border border-ink px-2 py-1.5 text-left">
                                            Score
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {qs.map((q, i) => {
                                        const answer = evaluation.answers.find(
                                            (a) => a.question_id === q.id,
                                        );
                                        return (
                                            <tr key={q.id}>
                                                <td className="border border-ink px-2 py-1.5">
                                                    {i + 1}
                                                </td>
                                                <td className="border border-ink px-2 py-1.5">
                                                    {q.question}
                                                </td>
                                                <td className="border border-ink px-2 py-1.5">
                                                    <PrintStars
                                                        value={
                                                            answer?.score ?? 0
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {qs.map((q) => {
                                    const answer = evaluation.answers.find(
                                        (a) => a.question_id === q.id,
                                    );
                                    return (
                                        <div key={q.id} className="text-[11px]">
                                            <div className="font-medium">
                                                {q.question}
                                            </div>
                                            <div className="mt-1 min-h-[32px] rounded border border-ink p-2">
                                                {answer?.text_answer || '—'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            {ratingQuestions.length > 0 && (
                <table className="w-full border-collapse text-[11px]">
                    <tbody>
                        <tr className="bg-neutral-100 font-semibold">
                            <td className="border border-ink px-2 py-1.5">
                                Overall average (rated statements)
                            </td>
                            <td className="border border-ink px-2 py-1.5">
                                <PrintStars value={average} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}

            {evaluation.remarks && (
                <div className="mt-4 text-[11px]">
                    <div className="mb-1 font-bold">
                        Evaluator Comments &amp; Recommendations
                    </div>
                    <div className="min-h-[40px] rounded border border-ink p-2">
                        {evaluation.remarks}
                    </div>
                </div>
            )}

            <div className="mt-14 grid grid-cols-2 gap-10 text-xs">
                <div>
                    <div className="border-t border-ink pt-1.5">
                        Evaluator Signature over Printed Name
                    </div>
                </div>
                <div>
                    <div className="border-t border-ink pt-1.5">
                        Program Coordinator Signature over Printed Name
                    </div>
                </div>
            </div>
        </div>
    );
}
