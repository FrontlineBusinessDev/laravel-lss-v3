import { useState } from 'react';
import { useNavigate, useParams } from '@/lib/router-compat';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { getTraineeBatchStatus } from '@/data/mockData';
import { useBatches } from '@/context/BatchesContext';
import { cn } from '@/lib/utils';
import AcademicInfoTab from './AcademicInfoTab';
import DocumentsTab from './DocumentsTab';
import LearningOutcomesTab from './LearningOutcomesTab';
import PaymentDetailsTab from './PaymentDetailsTab';
import RatingsTab from './RatingsTab';
import CertificateTab from './CertificateTab';
import BiometricsTab from './BiometricsTab';
import PersonalInfoTab from './PersonalInfoTab';

const TABS = [
    'Personal information',
    'Academic information',
    'Documents',
    'Learning outcomes',
    'Payment details',
    'Ratings',
    'Certificate',
    'Biometrics',
] as const;
type Tab = (typeof TABS)[number];

export default function TraineeDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { trainees } = useBatches();
    const [tab, setTab] = useState<Tab>('Personal information');
    const trainee = trainees.find((t) => t.id === id) ?? trainees[0];
    const displayStatus = getTraineeBatchStatus(trainee);
    return (
        <div data-cy="detail-div-1">
            <button
                onClick={() => navigate('/trainees')}
                className="mb-3 flex items-center gap-1.5 text-xs text-neutral-500 transition-opacity hover:opacity-60"
                data-cy="detail-button-navigate"
            >
                <ArrowLeft size={14} data-cy="detail-arrow-left-3" />
                Back to trainees
            </button>

            <div
                className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                data-cy="detail-div-4"
            >
                <div className="flex items-center gap-3" data-cy="detail-div-5">
                    <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700"
                        data-cy="detail-div-6"
                    >
                        {trainee.initials}
                    </div>
                    <div data-cy="detail-div-7">
                        <div
                            className="mb-0.5 flex items-center gap-2"
                            data-cy="detail-div-8"
                        >
                            <span
                                className="text-lg font-semibold text-ink"
                                data-cy="detail-span-9"
                            >
                                {trainee.name}
                            </span>
                            <span
                                className={
                                    displayStatus === 'Active'
                                        ? 'inline-flex items-center rounded-pill bg-success-50 px-2.5 py-0.5 text-xs leading-5 font-medium text-success-800'
                                        : 'inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-0.5 text-xs leading-5 font-medium text-neutral-600'
                                }
                                data-cy="detail-span-10"
                            >
                                {displayStatus}
                            </span>
                        </div>
                        <p
                            className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500"
                            data-cy="detail-p-11"
                        >
                            <span
                                className="flex items-center gap-1"
                                data-cy="detail-span-12"
                            >
                                <Mail size={12} data-cy="detail-mail-13" />{' '}
                                {trainee.email}
                            </span>
                            <span
                                className="flex items-center gap-1"
                                data-cy="detail-span-14"
                            >
                                <Phone size={12} data-cy="detail-phone-15" />{' '}
                                {trainee.mobileNumber}
                            </span>
                            <span data-cy="detail-span-16">
                                {trainee.batchNo} · {trainee.school}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="lss-scrollbar mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5"
                data-cy="detail-div-17"
            >
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            'pb-2.5 text-xs font-medium whitespace-nowrap transition-colors',
                            tab === t
                                ? 'border-b-2 border-brand-500 font-semibold text-ink'
                                : 'text-neutral-500 hover:text-neutral-700',
                        )}
                        data-cy="detail-button-set-tab"
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Personal information' && (
                <PersonalInfoTab
                    trainee={trainee}
                    data-cy="detail-personal-info-tab-19"
                />
            )}
            {tab === 'Academic information' && (
                <AcademicInfoTab
                    trainee={trainee}
                    data-cy="detail-academic-info-tab-20"
                />
            )}
            {tab === 'Documents' && (
                <DocumentsTab
                    trainee={trainee}
                    data-cy="detail-documents-tab-21"
                />
            )}
            {tab === 'Learning outcomes' && (
                <LearningOutcomesTab
                    trainee={trainee}
                    data-cy="detail-learning-outcomes-tab-22"
                />
            )}
            {tab === 'Payment details' && (
                <PaymentDetailsTab
                    trainee={trainee}
                    data-cy="detail-payment-details-tab-23"
                />
            )}
            {tab === 'Ratings' && (
                <RatingsTab trainee={trainee} data-cy="detail-ratings-tab-24" />
            )}
            {tab === 'Certificate' && (
                <CertificateTab
                    trainee={trainee}
                    data-cy="detail-certificate-tab-25"
                />
            )}
            {tab === 'Biometrics' && (
                <BiometricsTab
                    trainee={trainee}
                    data-cy="detail-biometrics-tab-26"
                />
            )}
        </div>
    );
}
