import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
        <div
            className="flex min-h-screen bg-neutral-50"
            data-cy="app-layout-div-2"
        >
            <div className="no-print contents" data-cy="app-layout-div-3">
                <Sidebar
                    mobileOpen={mobileOpen}
                    onCloseMobile={() => setMobileOpen(false)}
                    data-cy="app-layout-sidebar-4"
                />
            </div>
            <div
                className="flex min-w-0 flex-1 flex-col lg:ml-59"
                data-cy="app-layout-div-5"
            >
                <div
                    className="no-print contents"
                    data-cy="app-layout-div-6"
                >
                    <TopBar
                        onOpenMenu={() => setMobileOpen(true)}
                        data-cy="app-layout-top-bar-7"
                    />
                </div>
                <main
                    className="flex-1 p-4 sm:p-5 lg:p-6"
                    data-cy="app-layout-main-8"
                >
                    <div
                        className="mx-auto max-w-330"
                        data-cy="app-layout-div-9"
                    >
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
