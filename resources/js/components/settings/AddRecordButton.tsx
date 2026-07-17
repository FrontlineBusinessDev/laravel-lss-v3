/**
 * @file components/settings/AddRecordButton.tsx
 * The isolated "create" button for settings pages. Markup + classes are a 1:1
 * copy of the create button that DataTableField renders internally, so pages
 * migrated off DataTableField keep an identical button (same styling/position).
 * Permission-gated exactly like DataTableField's `canCreate`.
 */

import { Plus } from 'lucide-react';
import { usePermission } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';

interface AddRecordButtonProps {
    label: string;
    onClick: () => void;
    /** When set, the button only renders if the user holds this permission. */
    permission?: string;
    className?: string;
}

export function AddRecordButton({
    label,
    onClick,
    permission,
    className = '',
}: AddRecordButtonProps) {
    const { can } = usePermission();

    if (permission && !can(permission)) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'ml-2! inline-flex shrink-0 gap-1.5 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-400/90',
                // '[@media(min-width:300px)]:float-right',
                className,
            )}
            data-cy="add-record-button"
        >
            <Plus
                className="h-4 w-4"
                strokeWidth={2}
                data-cy="add-record-button-plus"
            />
            {label}
        </button>
    );
}

export default AddRecordButton;
