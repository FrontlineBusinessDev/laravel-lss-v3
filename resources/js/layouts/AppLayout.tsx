import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { ToastProvider } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <ToastProvider>
            <div className="flex min-h-screen bg-neutral-50">
                <div className="no-print contents">
                    <Sidebar
                        mobileOpen={mobileOpen}
                        onCloseMobile={() => setMobileOpen(false)}
                    />
                </div>
                <div className="flex min-w-0 flex-1 flex-col lg:ml-59">
                    <div className="no-print contents">
                        <TopBar onOpenMenu={() => setMobileOpen(true)} />
                    </div>
                    <main className="flex-1 p-4 sm:p-5 lg:p-6">
                        <div className="mx-auto max-w-330">{children}</div>
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}
