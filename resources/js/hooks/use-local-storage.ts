import { useState } from 'react';

/** Persisted `useState`, backed by `localStorage`. Falls back to `defaultValue` when unavailable (SSR, private mode, quota). */
export function useLocalStorage<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const stored = window.localStorage.getItem(key);
            return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    const set = (next: T | ((prev: T) => T)) => {
        setValue((prev) => {
            const resolved =
                typeof next === 'function'
                    ? (next as (prev: T) => T)(prev)
                    : next;
            try {
                window.localStorage.setItem(key, JSON.stringify(resolved));
            } catch {
                // localStorage unavailable — state still updates in-memory
            }
            return resolved;
        });
    };

    return [value, set] as const;
}
