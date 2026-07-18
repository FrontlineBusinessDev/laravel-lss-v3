import { useEffect, useState } from 'react';
import { Check, Save } from 'lucide-react';
import { Button } from '@/components/Button';
import { useToast } from '@/hooks/use-toast';
import BatchDetailLayout from '@/layouts/batches/BatchDetailLayout';
import { batchViewService } from '@/api-service-layer/admin/batch-view';
import { ApiError } from '@/api-service-layer/client';
import type { LookupOption } from '@/api-service-layer/http';
import { router } from '@inertiajs/react';
import type { AppBatches } from '@/types/modules/batches/batches';

interface Props {
    record: AppBatches;
    registrationUrl: string;
}

export default function BatchTrainersPage({ record, registrationUrl }: Props) {
    const { toast } = useToast();
    const [options, setOptions] = useState<LookupOption[]>([]);
    const [selected, setSelected] = useState<number[]>(
        (record.trainers ?? []).map((t) => t.id),
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        batchViewService.trainerOptions().then(setOptions).catch(() => setOptions([]));
    }, []);

    const toggle = (id: number) =>
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
        );

    const save = async () => {
        setSaving(true);
        try {
            await batchViewService.assignTrainers(record.id, selected);
            toast({ title: 'Trainers updated', variant: 'success' });
            router.reload();
        } catch (err) {
            toast({
                title: 'Failed to update trainers',
                description: err instanceof ApiError ? err.message : undefined,
                variant: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <BatchDetailLayout batch={record} registrationUrl={registrationUrl}>
            <div className="rounded-lg border border-neutral-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-ink">
                            Assigned trainers
                        </h3>
                        <p className="mt-1 text-xs text-neutral-500">
                            Trainers assigned here can see this batch, its
                            trainees, tasks, ratings, leave, and can post
                            batch-scoped announcements.
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        icon={Save}
                        disabled={saving}
                        onClick={() => void save()}
                    >
                        {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                </div>

                {options.length === 0 ? (
                    <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                        No trainer accounts exist yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {options.map((opt) => {
                            const checked = selected.includes(Number(opt.value));
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => toggle(Number(opt.value))}
                                    className={`flex items-center gap-2 rounded-md border p-2.5 text-left text-sm transition-colors ${
                                        checked
                                            ? 'border-brand-400 bg-brand-50 text-brand-800'
                                            : 'border-neutral-200 text-ink hover:bg-neutral-50'
                                    }`}
                                >
                                    <span
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                                            checked
                                                ? 'border-brand-500 bg-brand-500'
                                                : 'border-neutral-300 bg-white'
                                        }`}
                                    >
                                        {checked && (
                                            <Check
                                                size={11}
                                                className="text-white"
                                                strokeWidth={3}
                                            />
                                        )}
                                    </span>
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </BatchDetailLayout>
    );
}
