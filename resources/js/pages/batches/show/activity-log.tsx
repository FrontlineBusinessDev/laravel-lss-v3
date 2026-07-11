import BatchDetailLayout from '@/layouts/batches/BatchDetailLayout';
import type { AppBatches } from '@/types/modules/batches/batches';

interface Props {
    record: AppBatches;
    registrationUrl: string;
}

export default function BatchActivityLogPage({ record, registrationUrl }: Props) {
    return (
        <BatchDetailLayout batch={record} registrationUrl={registrationUrl}>
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
                Activity log entries will appear here.
            </div>
        </BatchDetailLayout>
    );
}
