import { useEffect, useState } from 'react';

interface DashboardWidgetState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}

/**
 * Fetch+loading/error boilerplate shared by every trainer dashboard widget
 * (see components/dashboard/DashboardWidgetCard). `fetchFn` is re-run
 * whenever `deps` changes.
 */
export function useDashboardWidget<T>(
    fetchFn: () => Promise<T>,
    deps: unknown[] = [],
): DashboardWidgetState<T> {
    const [state, setState] = useState<DashboardWidgetState<T>>({
        data: null,
        isLoading: true,
        error: null,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        let cancelled = false;
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        fetchFn()
            .then((data) => {
                if (!cancelled) setState({ data, isLoading: false, error: null });
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    const message =
                        err instanceof Error
                            ? err.message
                            : 'Failed to load this widget.';
                    setState({ data: null, isLoading: false, error: message });
                }
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return state;
}
