/**
 * Static stand-in for the table-view loading state, snapshotted by the
 * boneyard CLI (`npx boneyard-js build`) in place of real (async) row data —
 * matches the common DefaultRecordCard/custom-row shape (leading label,
 * secondary line, a status pill, trailing icon actions) closely enough for a
 * representative layout.
 */
export function TableRowsFixture() {
    return (
        <>
            {Array.from({ length: 7 }).map((_, i) => (
                <div
                    key={i}
                    className="flex h-16 items-center justify-between gap-3 border-b border-neutral-100 px-4"
                >
                    <div className="flex min-w-0 flex-col gap-1.5">
                        <span className="h-3.5 w-40 rounded bg-neutral-200" />
                        <span className="h-3 w-24 rounded bg-neutral-100" />
                    </div>
                    <span className="h-5 w-16 rounded-full bg-neutral-200" />
                    <div className="flex gap-2">
                        <span className="h-6 w-6 rounded-md bg-neutral-100" />
                        <span className="h-6 w-6 rounded-md bg-neutral-100" />
                    </div>
                </div>
            ))}
        </>
    );
}
