import BatchDetailLayout from '@/layouts/batches/BatchDetailLayout';
import type { AppBatches } from '@/types/modules/batches/batches';
interface Props {
  record: AppBatches;
  registrationUrl: string;
}
export default function BatchActivityLogPage({
  record,
  registrationUrl
}: Props) {
  return <BatchDetailLayout batch={record} registrationUrl={registrationUrl} data-cy="activity-log-batch-detail-layout-1">
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500" data-cy="activity-log-div-activity-log-entries-will-appear-here">
                Activity log entries will appear here.
            </div>
        </BatchDetailLayout>;
}