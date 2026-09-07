/** Static stand-in for the card-view loading state, snapshotted by the boneyard CLI. */
export function TableCardsFixture() {
    return (
        <>
            {Array.from({ length: 7 }).map((_, i) => (
                <div
                    key={i}
                    className="flex h-22 flex-col justify-between gap-2 rounded-2xl border border-neutral-200 p-4"
                >
                    <div className="flex items-center justify-between gap-3">
                        <span className="h-3.5 w-32 rounded bg-neutral-200" />
                        <span className="h-5 w-14 rounded-full bg-neutral-200" />
                    </div>
                    <span className="h-3 w-48 rounded bg-neutral-100" />
                </div>
            ))}
        </>
    );
}
