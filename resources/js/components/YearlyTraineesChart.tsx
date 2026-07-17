interface Props {
  data: {
    year: string;
    count: number;
  }[];
}
export function YearlyTraineesChart({
  data
}: Props) {
  const max = Math.max(...data.map(d => d.count), 1);
  return <div className="flex items-end gap-2 px-1" data-cy="yearly-trainees-chart-div-1">
      {data.map(d => <div key={d.year} className="flex flex-1 flex-col items-center gap-1.5" data-cy="yearly-trainees-chart-div-2">
          <span className="text-[10px] font-semibold text-ink" data-cy="yearly-trainees-chart-span-3">{d.count}</span>
          <div className="flex h-28 w-full items-end" data-cy="yearly-trainees-chart-div-4">
            <div className="w-full rounded-t-sm bg-brand-500/85 transition-all" style={{
          height: `${Math.max(d.count / max * 100, 4)}%`
        }} data-cy="yearly-trainees-chart-div-5" />
          </div>
          <span className="text-[10px] font-medium text-neutral-500" data-cy="yearly-trainees-chart-span-6">{d.year}</span>
        </div>)}
    </div>;
}