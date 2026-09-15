/** Read-only label/value pair used by the trainer's trainee-detail tabs. */
export function ReadOnlyField({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div>
            <div className="text-xs text-neutral-500">{label}</div>
            <div className="text-sm font-medium text-ink">{value || '—'}</div>
        </div>
    );
}
