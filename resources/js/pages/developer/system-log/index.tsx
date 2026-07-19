import { Eye } from 'lucide-react';
import { useState } from 'react';
import { SettingsListHeader, SettingsRow, TextCell } from '@/components/settings';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { ActionBadge, actorName, columns, formatWhen, subjectType, type LogRow } from '@/types/modules/developer/system-log';
import { LogDetailModal } from './LogDetailModal';

// When | Subject | Actor | Action(badge) | menu
const GRID = 'sm:grid-cols-[1.4fr_1.6fr_1.2fr_0.9fr_2.5rem]';
const listHeader = <SettingsListHeader grid={GRID} labels={['When', 'Subject', 'Actor', 'Action']} data-cy="index-settings-list-header-1" />;

/**
 * Developer-only audit trail. Read-only: create/edit are disabled and each row
 * opens a detail modal instead. Reuses the shared DataTableField (server-side
 * search/filter/sort/paginate) and the settings row primitives so it looks like
 * every other table in the app.
 */
export default function index() {
  const [selected, setSelected] = useState<LogRow | null>(null);
  const renderRow = (row: LogRow) => <SettingsRow grid={GRID} badge={<ActionBadge action={row.action} data-cy="index-action-badge-3" />} menu={[{
    label: 'View details',
    icon: Eye,
    onClick: () => setSelected(row)
  }]} data-cy="index-settings-row-2">
            <TextCell data-cy="index-text-cell-4">{formatWhen(row.created_at)}</TextCell>
            <TextCell muted data-cy="index-text-cell-5">
                {subjectType(row.loggable_type)}
                {row.subject_label ? ` · ${row.subject_label}` : ''}
            </TextCell>
            <TextCell muted data-cy="index-text-cell-6">{actorName(row.actor)}</TextCell>
        </SettingsRow>;
  return <>
            <DataTableCardField<LogRow> apiUrl="/system-log" apiQueryKey="developer-system-log" columns={columns} enableCreate={false} enableEdit={false} defaultSortBy="created_at" defaultSortDir="desc" listHeader={listHeader} renderCard={renderRow} data-cy="index-data-table-field-7" />
            {selected && <LogDetailModal log={selected} onClose={() => setSelected(null)} data-cy="index-log-detail-modal-set-selected" />}
        </>;
}