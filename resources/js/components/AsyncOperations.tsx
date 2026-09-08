import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { jobRunsService } from '@/api-service-layer/developer/job-runs';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ProgressToast } from './ProgressToast';

export interface TrackedOp {
    id: string;
    label: string;
    status: 'running' | 'offline' | 'completed' | 'failed' | 'cancelled';
    processed: number;
    total: number;
    error?: string;
}

/** What a tracked operation's own async logic receives from the provider. */
export interface OpHelpers {
    report: (
        patch: Partial<
            Pick<TrackedOp, 'processed' | 'total' | 'status' | 'error'>
        >,
    ) => void;
    isCancelled: () => boolean;
    /** Registers what clicking "Retry" should do while status is `offline`. */
    onRetry: (fn: () => void) => void;
}

export type OpRunner = (
    helpers: OpHelpers,
) => Promise<{ status?: TrackedOp['status']; error?: string } | void>;

interface AsyncOperationsContextValue {
    /**
     * Runs any async operation (server-polled or purely client-driven) as a
     * tracked progress toast that survives Inertia navigation. `run` decides
     * everything about how progress is produced/cancelled/retried — see
     * `pollJobRun` below for the server-job flavor this app currently uses.
     */
    track: (
        id: string,
        opts: {
            label: string;
            total?: number;
            run: OpRunner;
            /** Fires once, when the op reaches a terminal status — e.g. to invalidate a query so the page reflects the finished job. */
            onSettled?: (status: TrackedOp['status']) => void;
        },
    ) => void;
    /** Same as `track()`, but also persists {id,label,total} so a full page refresh resumes polling this job. Use for server-tracked jobs only — a purely client-driven task can't resume after a JS reload. */
    trackServerJob: (
        jobId: string,
        opts: {
            label: string;
            total?: number;
            onSettled?: (status: TrackedOp['status']) => void;
        },
    ) => void;
}

const AsyncOperationsContext =
    createContext<AsyncOperationsContextValue | null>(null);

const AUTO_REMOVE_MS = 3200;
const POLL_MS = 2000;

interface PersistedJob {
    id: string;
    label: string;
    total: number;
}

function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/** The `run` behind every server-tracked job: poll `/job-runs/{id}` until it reaches a terminal status, surfacing a network drop as `offline` (not `failed`) so the job — which keeps running server-side regardless — can simply be re-polled via Retry instead of restarted. */
async function pollJobRun(jobId: string, helpers: OpHelpers) {
    for (;;) {
        if (helpers.isCancelled()) {
            try {
                await jobRunsService.cancel(jobId);
            } catch {
                // best-effort — the job also checks its own cancelled flag server-side
            }

            return { status: 'cancelled' as const };
        }

        try {
            const s = await jobRunsService.status(jobId);
            helpers.report({
                processed: s.processed,
                total: s.total,
                status: 'running',
            });

            if (s.status === 'completed') {
                return { status: 'completed' as const };
            }

            if (s.status === 'failed') {
                return {
                    status: 'failed' as const,
                    error: s.error ?? 'Something went wrong.',
                };
            }

            if (s.status === 'cancelled') {
                return { status: 'cancelled' as const };
            }
        } catch {
            helpers.report({ status: 'offline' });
            await new Promise<void>((resolve) => helpers.onRetry(resolve));
            continue;
        }

        await sleep(POLL_MS);
    }
}

export function AsyncOperationsProvider({ children }: { children: ReactNode }) {
    const [ops, setOps] = useState<TrackedOp[]>([]);
    const [persistedJobs, setPersistedJobs] = useLocalStorage<PersistedJob[]>(
        'async-job-ops',
        [],
    );
    const cancelledRef = useRef<Map<string, boolean>>(new Map());
    const retryRef = useRef<Map<string, () => void>>(new Map());
    const startedRef = useRef<Set<string>>(new Set());

    function patch(id: string, fields: Partial<TrackedOp>) {
        setOps((prev) =>
            prev.map((o) => (o.id === id ? { ...o, ...fields } : o)),
        );
    }

    function scheduleRemoval(id: string) {
        setTimeout(() => {
            setOps((prev) => prev.filter((o) => o.id !== id));
            cancelledRef.current.delete(id);
            retryRef.current.delete(id);
        }, AUTO_REMOVE_MS);
    }

    function track(
        id: string,
        opts: {
            label: string;
            total?: number;
            run: OpRunner;
            onSettled?: (status: TrackedOp['status']) => void;
        },
    ) {
        startedRef.current.add(id);
        cancelledRef.current.set(id, false);
        setOps((prev) => [
            ...prev.filter((o) => o.id !== id),
            {
                id,
                label: opts.label,
                status: 'running',
                processed: 0,
                total: opts.total ?? 0,
            },
        ]);

        const helpers: OpHelpers = {
            report: (p) => patch(id, p),
            isCancelled: () => cancelledRef.current.get(id) === true,
            onRetry: (fn) => retryRef.current.set(id, fn),
        };

        opts.run(helpers)
            .then((final) => {
                const status = final?.status ?? 'completed';
                setOps((prev) =>
                    prev.map((o) =>
                        o.id === id
                            ? {
                                  ...o,
                                  status,
                                  error: final?.error,
                                  processed:
                                      status === 'completed'
                                          ? o.total || o.processed
                                          : o.processed,
                              }
                            : o,
                    ),
                );
                setPersistedJobs((prev) => prev.filter((j) => j.id !== id));
                scheduleRemoval(id);
                opts.onSettled?.(status);
            })
            .catch((err: unknown) => {
                patch(id, {
                    status: 'failed',
                    error:
                        err instanceof Error
                            ? err.message
                            : 'Something went wrong.',
                });
                setPersistedJobs((prev) => prev.filter((j) => j.id !== id));
                scheduleRemoval(id);
                opts.onSettled?.('failed');
            });
    }

    function trackServerJob(
        jobId: string,
        opts: {
            label: string;
            total?: number;
            onSettled?: (status: TrackedOp['status']) => void;
        },
    ) {
        setPersistedJobs((prev) => [
            ...prev.filter((j) => j.id !== jobId),
            { id: jobId, label: opts.label, total: opts.total ?? 0 },
        ]);
        track(jobId, {
            label: opts.label,
            total: opts.total,
            run: (helpers) => pollJobRun(jobId, helpers),
            onSettled: opts.onSettled,
        });
    }

    // Resume any job still in flight after a full page refresh.
    useEffect(() => {
        for (const job of persistedJobs) {
            if (!startedRef.current.has(job.id)) {
                track(job.id, {
                    label: job.label,
                    total: job.total,
                    run: (helpers) => pollJobRun(job.id, helpers),
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function cancel(id: string) {
        cancelledRef.current.set(id, true);
        // Wake up an offline op's paused retry-wait immediately so it doesn't
        // sit idle until the user happens to click Retry.
        retryRef.current.get(id)?.();
    }

    function retry(id: string) {
        retryRef.current.get(id)?.();
    }

    function dismiss(id: string) {
        setOps((prev) => prev.filter((o) => o.id !== id));
        setPersistedJobs((prev) => prev.filter((j) => j.id !== id));
        cancelledRef.current.delete(id);
        retryRef.current.delete(id);
    }

    return (
        <AsyncOperationsContext.Provider value={{ track, trackServerJob }}>
            {children}
            {createPortal(
                <div className="pointer-events-none fixed right-4 bottom-4 z-100 flex flex-col items-end gap-2">
                    {ops.map((op) => (
                        <ProgressToast
                            key={op.id}
                            op={op}
                            onCancel={() => cancel(op.id)}
                            onRetry={() => retry(op.id)}
                            onDismiss={() => dismiss(op.id)}
                        />
                    ))}
                </div>,
                document.body,
            )}
        </AsyncOperationsContext.Provider>
    );
}

export function useAsyncOperations() {
    const ctx = useContext(AsyncOperationsContext);

    if (!ctx) {
        throw new Error(
            'useAsyncOperations must be used within an AsyncOperationsProvider',
        );
    }

    return ctx;
}
