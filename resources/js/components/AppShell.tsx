import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
        <div
            className="flex min-h-screen bg-neutral-50"
            data-cy="app-shell-div-1"
        >
            <div className="no-print contents" data-cy="app-shell-div-2">
                <Sidebar
                    mobileOpen={mobileOpen}
                    onCloseMobile={() => setMobileOpen(false)}
                    data-cy="app-shell-sidebar-3"
                />
            </div>
            <div
                className="flex min-w-0 flex-1 flex-col lg:ml-[236px]"
                data-cy="app-shell-div-4"
            >
                <div className="no-print contents" data-cy="app-shell-div-5">
                    <TopBar
                        onOpenMenu={() => setMobileOpen(true)}
                        data-cy="app-shell-top-bar-6"
                    />
                </div>
                <main
                    className="flex-1 p-4 sm:p-5 lg:p-6"
                    data-cy="app-shell-main-7"
                >
                    <div
                        className="mx-auto max-w-[1320px]"
                        data-cy="app-shell-div-8"
                    >
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
