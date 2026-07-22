import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { paymentMethodService } from '@/api-service-layer/admin/payment-method';
import { useGlobalModal } from '@/components/global-modal';
import {
    AddRecordButton,
    SettingsListHeader,
    SettingsRow,
    TextCell,
    buildRecordMenu,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { Thumbnail } from '@/components/Thumbnail';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import type { StatusKind } from '@/types/reusable/status-kind';
import type { PaymentMethod } from '@/types/modules/settings/payment-methods';
import { columns } from '@/types/modules/settings/payment-methods';
import PaymentMethodModal from './PaymentMethodModal';

const PERMISSION = 'manage settings payment methods';
const ORDER_QUERY_KEY = ['settings-payment-methods-order'];
const customGRID = 'sm:grid-cols-[3rem_1fr_1.6fr_1.4fr_1.4fr_5rem_1.2fr]';

const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={[
            'Logo',
            'Provider',
            'Type',
            'Account No. / Phone',
            'Order',
            'Status',
        ]}
    />
);

function ReorderControls({
    row,
    siblings,
}: {
    row: PaymentMethod;
    siblings: PaymentMethod[];
}) {
    const queryClient = useQueryClient();
    const sorted = [...siblings].sort(
        (a, b) => a.display_order - b.display_order,
    );
    const index = sorted.findIndex((r) => r.id === row.id);
    const prev = index > 0 ? sorted[index - 1] : null;
    const next = index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null;

    // update() re-validates the full record (matching every other module's
    // save flow), so a reorder resends each row's own writable fields with
    // only display_order swapped — not just the changed field.
    const writable = (method: PaymentMethod, newOrder: number) => ({
        status: method.status,
        provider_name: method.provider_name,
        type: method.type,
        account_name: method.account_name,
        account_number: method.account_number,
        payment_link: method.payment_link,
        instructions: method.instructions,
        display_order: newOrder,
    });

    const swap = async (other: PaymentMethod) => {
        await Promise.all([
            paymentMethodService.update(row.id, writable(row, other.display_order)),
            paymentMethodService.update(other.id, writable(other, row.display_order)),
        ]);
        tableListInvalidateKeys('settings-payment-methods').forEach(
            (queryKey) => queryClient.invalidateQueries({ queryKey }),
        );
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY });
    };

    return (
        <div className="flex items-center gap-0.5">
            <button
                type="button"
                onClick={() => prev && swap(prev)}
                disabled={!prev}
                aria-label="Move up"
                className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-30"
                data-cy={`move-up-${row.id}`}
            >
                <ChevronUp size={14} />
            </button>
            <button
                type="button"
                onClick={() => next && swap(next)}
                disabled={!next}
                aria-label="Move down"
                className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-30"
                data-cy={`move-down-${row.id}`}
            >
                <ChevronDown size={14} />
            </button>
        </div>
    );
}

export default function index() {
    const modal = useGlobalModal<PaymentMethod | null>('paymentMethod', null);
    const queryClient = useQueryClient();

    // Independent of DataTableCardField's own paginated fetch — this keeps a
    // flat, fully-sorted list around purely so the reorder buttons can find a
    // row's immediate neighbor without DataTableCardField exposing one.
    const { data: orderedRows } = useQuery({
        queryKey: ORDER_QUERY_KEY,
        queryFn: () =>
            paymentMethodService.getPaginatedFilterSearch({
                sort_by: 'display_order',
                sort_dir: 'asc',
                per_page: 100,
            }),
    });
    const siblings = orderedRows?.data ?? [];

    const renderRow = (row: PaymentMethod, actions: CardActions) => {
        const isArchived = row.status !== 'active';
        const badge: StatusKind = isArchived ? 'archived' : 'active';

        return (
            <SettingsRow
                grid={customGRID}
                isArchived={isArchived}
                badge={
                    <button
                        type="button"
                        onClick={() =>
                            isArchived
                                ? actions.onRestore()
                                : actions.onArchive()
                        }
                        disabled={!isArchived && !actions.canArchive}
                        className="cursor-pointer disabled:cursor-not-allowed"
                        data-cy={`switch-is-active-${row.id}`}
                    >
                        <StatusBadge status={badge} />
                    </button>
                }
                menu={buildRecordMenu(actions, isArchived)}
            >
                <Thumbnail
                    src={row.logo}
                    alt={`${row.provider_name} logo`}
                    className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                />
                <TextCell>{row.provider_name}</TextCell>
                <TextCell muted>{row.type}</TextCell>
                <TextCell muted>{row.account_number || '—'}</TextCell>
                <ReorderControls row={row} siblings={siblings} />
            </SettingsRow>
        );
    };

    return (
        <SettingsPrimaryLayout
            actionNode={
                <AddRecordButton
                    label="Add Payment Method"
                    permission={PERMISSION}
                    onClick={() => {
                        modal.setData(null);
                        modal.setOpen(true);
                    }}
                />
            }
        >
            <div data-cy="admin-payment-methods-list">
                <DataTableCardField<PaymentMethod>
                    apiUrl="/settings/payment-methods"
                    apiQueryKey="settings-payment-methods"
                    columns={columns}
                    defaultSortBy="display_order"
                    editPermission={PERMISSION}
                    archivePermission={PERMISSION}
                    deletePermission={PERMISSION}
                    listHeader={listHeader}
                    renderCard={(row, actions) => (
                        <div data-cy="admin-payment-method-card">
                            {renderRow(row, actions)}
                        </div>
                    )}
                    onEditRow={(row) => {
                        modal.setData(row);
                        modal.setOpen(true);
                    }}
                />
            </div>
            <PaymentMethodModal
                open={modal.open}
                onClose={() => {
                    modal.setOpen(false);
                    queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY });
                }}
                row={modal.data}
            />
        </SettingsPrimaryLayout>
    );
}
