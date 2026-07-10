// resources/js/context/modal-context.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

type ModalKey = string;

type ModalState = {
    isOpen: boolean;
    data: any;
};

type ModalRegistry = Record<ModalKey, ModalState>;

type ModalContextType = {
    registry: ModalRegistry;
    openModal: (key: ModalKey, data?: any) => void;
    closeModal: (key: ModalKey) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [registry, setRegistry] = useState<ModalRegistry>({});

    const openModal = useCallback((key: ModalKey, data?: any) => {
        setRegistry((prev) => ({
            ...prev,
            [key]: { isOpen: true, data: data ?? null },
        }));
    }, []);

    const closeModal = useCallback((key: ModalKey) => {
        setRegistry((prev) => ({
            ...prev,
            [key]: { isOpen: false, data: null },
        }));
    }, []);

    return (
        <ModalContext.Provider value={{ registry, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModalContext = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModalContext must be used within a ModalProvider');
    }
    return context;
};
