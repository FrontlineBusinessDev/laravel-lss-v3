import BatchDetailLayout from '@/layouts/batches/BatchDetailLayout';
import type { AppBatches } from '@/types/modules/batches/batches';
interface Props {
  record: AppBatches;
  registrationUrl: string;
}
export default function BatchFinancialPage({
  record,
  registrationUrl
}: Props) {
  return <BatchDetailLayout batch={record} registrationUrl={registrationUrl} data-cy="financial-batch-detail-layout-1">
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500" data-cy="financial-div-financial-records-for-this-batch-will">
                Financial records for this batch will appear here.
            </div>
        </BatchDetailLayout>;
}