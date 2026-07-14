/**
 * @file components/global-modal/index.ts
 * Public surface for the dynamic key-value modal-state system.
 */

export { GlobalModalProvider, GlobalModalContext } from './GlobalModalProvider';
export { useGlobalModal, type GlobalModalHandle } from './use-global-modal';
export { createGlobalModalStore, type GlobalModalStore, type ModalEntry } from './store';
