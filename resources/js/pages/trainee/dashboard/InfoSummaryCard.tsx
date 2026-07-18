import { DonutChart } from '@/components/DonutChart';
import { StatCard } from '@/components/StatCard';
import { UsersRound, Star } from 'lucide-react';
import type { DashboardSummary } from '@/types/modules/dashboard/trainee-dashboard';

export function InfoSummaryCard({ summary }: { summary: DashboardSummary }) {
    const rendered = summary.completed_hours;
    const required = Math.max(summary.required_hours, 0);
    const remaining = Math.max(required - rendered, 0);

    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-ink">
                Training progress
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.2fr_1fr]">
                <DonutChart
                    segments={[
                        { label: 'Rendered', value: rendered, color: '#378add' },
                        { label: 'Remaining', value: remaining, color: '#EEF1F4' },
                    ]}
                    centerLabel={`of ${required} hrs required`}
                    centerValue={`${rendered}h`}
                />
                <div className="grid grid-cols-1 gap-3">
                    <StatCard
                        label="Batch"
                        value={summary.batch_code ?? '—'}
                        icon={UsersRound}
                    />
                    <StatCard
                        label="Overall task rating"
                        value={
                            summary.average_rating !== null
                                ? `${summary.average_rating}/100`
                                : '—'
                        }
                        icon={Star}
                        tone="accent"
                    />
                </div>
            </div>
        </div>
    );
}
