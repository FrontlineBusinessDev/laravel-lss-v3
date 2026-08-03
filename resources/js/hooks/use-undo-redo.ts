/**
 * @file hooks/use-undo-redo.ts
 * Generic push-based undo/redo history for a single piece of state. Callers
 * push new snapshots via `set()` (each becomes an undo step); `undo`/`redo`
 * walk the resulting stacks. Optionally binds Ctrl/Cmd+Z (undo) and
 * Ctrl/Cmd+Shift+Z or Ctrl+Y (redo) globally, ignoring keystrokes while a
 * text field has focus so native input undo still works there.
 */
import { useCallback, useEffect, useReducer } from 'react';

interface UseUndoRedoOptions {
    /** Bind keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl+Y). Default false. */
    shortcuts?: boolean;
    /** Only listen for shortcuts while true (e.g. the owning modal is open). */
    enabled?: boolean;
}

interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

type HistoryAction<T> =
    | { type: 'set'; value: T | ((prev: T) => T) }
    | { type: 'undo' }
    | { type: 'redo' }
    | { type: 'reset'; value: T };

function historyReducer<T>(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> {
    if (action.type === 'set') {
        const next = typeof action.value === 'function' ? (action.value as (prev: T) => T)(state.present) : action.value;

        return { past: [...state.past, state.present], present: next, future: [] };
    }

    if (action.type === 'undo') {
        if (state.past.length === 0) {
return state;
}

        const previous = state.past[state.past.length - 1];

        return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] };
    }

    if (action.type === 'redo') {
        if (state.future.length === 0) {
return state;
}

        const [next, ...rest] = state.future;

        return { past: [...state.past, state.present], present: next, future: rest };
    }

    return { past: [], present: action.value, future: [] };
}

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
return false;
}

    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function useUndoRedo<T>(initial: T, options: UseUndoRedoOptions = {}) {
    const { shortcuts = false, enabled = true } = options;
    const [history, dispatch] = useReducer(historyReducer<T>, { past: [], present: initial, future: [] });

    const set = useCallback((value: T | ((prev: T) => T)) => dispatch({ type: 'set', value }), []);
    const undo = useCallback(() => dispatch({ type: 'undo' }), []);
    const redo = useCallback(() => dispatch({ type: 'redo' }), []);
    const reset = useCallback((value: T) => dispatch({ type: 'reset', value }), []);

    useEffect(() => {
        if (!shortcuts || !enabled) {
return;
}

        function onKeyDown(e: KeyboardEvent) {
            if (!(e.ctrlKey || e.metaKey) || isEditableTarget(e.target)) {
return;
}

            const key = e.key.toLowerCase();

            if (key === 'z' && e.shiftKey) {
                e.preventDefault();
                redo();
            } else if (key === 'z') {
                e.preventDefault();
                undo();
            } else if (key === 'y') {
                e.preventDefault();
                redo();
            }
        }
        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [shortcuts, enabled, undo, redo]);

    return {
        state: history.present,
        set,
        undo,
        redo,
        reset,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
    };
}
