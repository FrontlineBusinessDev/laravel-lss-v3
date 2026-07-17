import { Pencil, Trash2 } from 'lucide-react';
import { useGlobalModal } from '@/components/global-modal';
import type { RowMenuAction } from '@/components/RowMenu';
import {
    AddRecordButton,
    SettingsListHeader,
    SettingsRow,
    TextCell,
} from '@/components/settings';
import type { CardActions } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import type { HoursDiscount } from '@/types/modules/settings/academic/hours-discount';
import { columns } from '@/types/modules/settings/academic/hours-discount';
import HoursDiscountModal from './HoursDiscountModal';

const PERMISSION = 'manage settings rates';
const customGRID = 'sm:grid-cols-[1.8fr_1.8fr_2.5rem]';
const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Min. Hours', 'Discount %']}
        data-cy="hours-discounts-settings-list-header-1"
    />
);

// No `status` column on this table, so only Edit + Delete — no archive/restore.
function buildMenu(actions: CardActions): RowMenuAction[] {
    return [
        {
            label: 'Edit',
            icon: Pencil,
            onClick: actions.onEdit,
            disabled: !actions.canEdit,
        },
        {
            label: 'Delete',
            icon: Trash2,
            danger: true,
            onClick: () => void actions.onDelete(),
            disabled: !actions.canDelete,
        },
    ];
}

const renderRow = (row: HoursDiscount, actions: CardActions) => (
    <SettingsRow
        grid={customGRID}
        badge={null}
        menu={buildMenu(actions)}
        data-cy="hours-discounts-settings-row-2"
    >
        <TextCell data-cy="hours-discounts-text-cell-3">
            {row.min_hours} hrs
        </TextCell>
        <TextCell data-cy="hours-discounts-text-cell-4">
            {row.discount_percentage}%
        </TextCell>
    </SettingsRow>
);

export default function HoursDiscountsPage() {
    const modal = useGlobalModal<HoursDiscount | null>('hoursDiscount', null);

    return (
        <>
            <div className="float-right">
                <AddRecordButton
                    label="Add Hours Discount"
                    permission={PERMISSION}
                    onClick={() => {
                        modal.setData(null);
                        modal.setOpen(true);
                    }}
                />
            </div>
            <DataTableCardField<HoursDiscount>
                apiUrl="/settings/rates/hours-discounts"
                apiQueryKey="settings-rates/hours-discounts"
                columns={columns}
                defaultSortBy="min_hours"
                editPermission={PERMISSION}
                deletePermission={PERMISSION}
                listHeader={listHeader}
                renderCard={renderRow}
                onEditRow={(row) => {
                    modal.setData(row);
                    modal.setOpen(true);
                }}
                data-cy="hours-discounts-data-table-field-5"
            />
            <HoursDiscountModal
                open={modal.open}
                onClose={() => modal.setOpen(false)}
                row={modal.data}
            />
        </>
    );
}
