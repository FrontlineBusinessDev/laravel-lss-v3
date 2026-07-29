import { useState } from 'react';
import CertificatesPrimaryLayout from '@/layouts/certificates/CertificatesPrimaryLayout';
import { cn } from '@/lib/utils';
import { CertificateTemplateList } from '../citations/CertificateTemplateList';
import type { CertificateType } from '../types';

const TYPE_TABS: { value: CertificateType; label: string }[] = [
    { value: 'trainee', label: 'Trainee' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'citation', label: 'Citation' },
];

/**
 * The Inertia route for GET /certificates/templates (BaseController::index())
 * passes no props beyond `user`, so this page owns the certificate-type
 * choice itself instead of expecting it from the route — and delegates the
 * actual list/editor to the shared, correctly-typed CertificateTemplateList
 * component (also used embedded on the Citations page).
 */
export default function index() {
    const [type, setType] = useState<CertificateType>('trainee');

    return (
        <CertificatesPrimaryLayout data-cy="certificate-templates-index-layout">
            <div className="mb-4 flex gap-1.5" data-cy="certificate-templates-index-type-tabs">
                {TYPE_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setType(tab.value)}
                        className={cn(
                            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                            type === tab.value
                                ? 'bg-brand-500 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div data-cy="certificate-templates-index-div">
                <CertificateTemplateList certificateType={type} />
            </div>
        </CertificatesPrimaryLayout>
    );
}
