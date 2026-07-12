import { Eye } from 'lucide-react';
import { useState } from 'react';
import { SettingsListHeader, SettingsRow, TextCell } from '@/components/settings';
import DataTableField from '@/components/table';
import {
    ActionBadge,
    actorName,
    columns,
    formatWhen,
    subjectType,
    type LogRow,
} from '@/types/modules/developer/system-log';
import { LogDetailModal } from './LogDetailModal';

// When | Subject | Actor | Action(badge) | menu
const GRID = 'sm:grid-cols-[1.4fr_1.6fr_1.2fr_0.9fr_2.5rem]';

const listHeader = (
    <SettingsListHeader
        grid={GRID}
        labels={['When', 'Subject', 'Actor', 'Action']}
    />
);

/**
 * Developer-only audit trail. Read-only: create/edit are disabled and each row
 * opens a detail modal instead. Reuses the shared DataTableField (server-side
 * search/filter/sort/paginate) and the settings row primitives so it looks like
 * every other table in the app.
 */
export default function index() {
    const [selected, setSelected] = useState<LogRow | null>(null);

    const renderRow = (row: LogRow) => (
        <SettingsRow
            grid={GRID}
            badge={<ActionBadge action={row.action} />}
            menu={[
                {
                    label: 'View details',
                    icon: Eye,
                    onClick: () => setSelected(row),
                },
            ]}
        >
            <TextCell>{formatWhen(row.created_at)}</TextCell>
            <TextCell muted>
                {subjectType(row.loggable_type)}
                {row.subject_label ? ` · ${row.subject_label}` : ''}
            </TextCell>
            <TextCell muted>{actorName(row.actor)}</TextCell>
        </SettingsRow>
    );

    return (
        <>
            <DataTableField<LogRow>
                apiUrl="/system-log"
                apiQueryKey="developer-system-log"
                columns={columns}
                enableCreate={false}
                enableEdit={false}
                defaultSortBy="created_at"
                defaultSortDir="desc"
                listHeader={listHeader}
                renderCard={renderRow}
            />
            {selected && (
                <LogDetailModal
                    log={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </>
    );
}
