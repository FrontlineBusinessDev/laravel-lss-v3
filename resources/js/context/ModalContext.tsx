import React, { createContext, useContext } from 'react';
import { useModal, UseModalReturn } from '@/hooks/use-modal';

const ModalContext = createContext<UseModalReturn | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const modal = useModal(); // Instantiated once globally
    return (
        <ModalContext.Provider value={modal}>{children}</ModalContext.Provider>
    );
}

export function useGlobalModal() {
    const context = useContext(ModalContext);
    if (!context)
        throw new Error('useGlobalModal must be used within a ModalProvider');
    return context;
}
