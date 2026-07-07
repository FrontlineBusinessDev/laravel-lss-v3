// resources/js/hooks/use-modal.ts
import { useCallback, useMemo, useState } from 'react';

type ModalKey = string;

/** Internal state: which modal is open, and whatever payload it was opened with. */
type ModalState<T> = {
    key: ModalKey | null;
    data: T | null;
};

export function useModal<T = unknown>() {
    const [state, setState] = useState<ModalState<T>>({
        key: null,
        data: null,
    });

    // `data` is optional — some modals (confirm dialogs, "create new") don't need one.
    const open = useCallback((key: ModalKey, data?: T) => {
        setState({ key, data: data ?? null });
    }, []);

    const close = useCallback(() => {
        setState({ key: null, data: null });
    }, []);

    const toggle = useCallback((key: ModalKey, data?: T) => {
        setState((prev) =>
            prev.key === key
                ? { key: null, data: null }
                : { key, data: data ?? null },
        );
    }, []);

    /**
     * Bound check for a specific key — this is what components actually consume.
     * Returns a stable-shaped object so destructuring in render is safe.
     */
    const isOpen = useCallback(
        (key: ModalKey) => state.key === key,
        [state.key],
    );

    // Memoized so `activeModal` doesn't create a new object identity every
    // render unless `state` itself actually changed.
    const activeModal = useMemo(
        () => ({ key: state.key, data: state.data }),
        [state.key, state.data],
    );

    return { open, close, toggle, isOpen, activeModal };
}

export type UseModalReturn<T = unknown> = ReturnType<typeof useModal<T>>;

/**
 * usage Usage — single hook instance, multiple modal keys
 *  type ModalPayloads = {
    edit: Ticket;
    delete: Ticket;
    createClient: undefined;
};

// A small union-key convenience wrapper, if you want key-specific payload types
// enforced at the call site instead of a single generic T for all modals:
function useTypedModal<M extends Record<string, unknown>>() {
    return useModal<M[keyof M]>();
}
 */
