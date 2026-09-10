import { useQueryClient } from '@tanstack/react-query';
import SettingsImportLayout from '@/layouts/settings/SettingsImportLayout';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import { CsvImportCard } from './CsvImportCard';
import { IMPORT_STEPS } from './importUtils';

export default function index() {
    const queryClient = useQueryClient();

    return (
        <SettingsPrimaryLayout>
            <SettingsImportLayout>
                <div className="mb-4 rounded-md border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-600">
                    Import legacy trainee data step by step, in order — each
                    step depends on the ones before it (academic reference data
                    and partner schools first, then batches, then trainees, then
                    per-trainee records). Download each step's CSV template for
                    the exact expected columns.
                </div>
                <div
                    className="flex flex-col gap-3"
                    data-cy="settings-import-list"
                >
                    {IMPORT_STEPS.map((step) => (
                        <CsvImportCard
                            key={step.key}
                            step={step}
                            // An import can touch data any other page's table is showing (batches,
                            // trainees, payments, etc.) — those pages aren't mounted right now to
                            // invalidate themselves, so clear the whole cache instead of maintaining
                            // a per-step list of affected query keys that will drift out of date.
                            onImported={() => queryClient.invalidateQueries()}
                        />
                    ))}
                </div>
            </SettingsImportLayout>
        </SettingsPrimaryLayout>
    );
}
