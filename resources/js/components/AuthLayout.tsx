import { ReactNode } from 'react';
import { LogoLockup } from './Logo';

export function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
            <div className="w-full max-w-90 animate-scaleIn rounded-lg border border-neutral-200 bg-white p-7 sm:p-8">
                <div className="mb-6 flex justify-center">
                    <LogoLockup />
                </div>
                {children}
            </div>
        </div>
    );
}
