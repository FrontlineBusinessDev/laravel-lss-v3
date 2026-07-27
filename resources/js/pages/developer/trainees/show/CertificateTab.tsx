import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Printer, RefreshCw } from 'lucide-react';
import { Button } from '@/components/Button';
import TraineesDetailLayout from '@/layouts/trainees/TraineesDetailLayout';
import {
    CertificateBatchPrint,
    CertificateSheet,
    type CertificateDoc,
} from '@/pages/developer/certificates/CertificatePrint';
import { renderCitation } from '@/pages/developer/certificates/certificateUtils';
import { IssueCertificateModal } from '@/pages/developer/certificates/IssueCertificateModal';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';

function buildDoc(trainee: TraineeDetail): CertificateDoc {
    const subtitle = [
        trainee.batch?.academic_program?.name,
        trainee.batch?.academic_industry?.name,
    ]
        .filter(Boolean)
        .join(' — ');

    return {
        key: trainee.id,
        recipientName: trainee.name,
        subtitle,
        citationText: renderCitation(
            'This is to certify that {{name}} has completed {{hours}} hours of training.',
            { name: trainee.name, hours: trainee.required_hours },
        ),
        certificateNo: trainee.certificate?.certificate_no ?? '—',
        issuedDate: trainee.certificate?.issued_at,
        template: trainee.certificate?.template,
    };
}

export default function CertificateTab({ trainee }: { trainee: TraineeDetail }) {
    const [printing, setPrinting] = useState(false);
    const [issueOpen, setIssueOpen] = useState(false);

    const completedHours = Number(trainee.tasks_sum_time_spent ?? 0);
    const requiredHours = Number(trainee.required_hours);
    const canIssue = completedHours >= requiredHours;
    const issued = !!trainee.certificate?.issued_at;

    const doc = buildDoc(trainee);

    const handlePrint = () => {
        setPrinting(true);
        setTimeout(() => {
            window.print();
            setPrinting(false);
        }, 50);
    };

    return (
        <>
            <TraineesDetailLayout trainee={trainee}>
                <div
                    className="rounded-lg border border-neutral-200 bg-white p-5"
                    data-cy="certificate-tab-div-1"
                >
                    <div className="no-print" data-cy="certificate-tab-div-2">
                        <div
                            className="mb-4 flex flex-wrap items-center justify-between gap-3"
                            data-cy="certificate-tab-div-3"
                        >
                            <div data-cy="certificate-tab-div-4">
                                <h3
                                    className="text-sm font-semibold text-ink"
                                    data-cy="certificate-tab-h3-certificate-of-completion"
                                >
                                    Certificate of completion
                                </h3>
                                <p
                                    className="text-xs text-neutral-500"
                                    data-cy="certificate-tab-p-6"
                                >
                                    {issued
                                        ? `Issued on ${trainee.certificate?.issued_at}`
                                        : 'Not yet issued for this trainee'}
                                </p>
                            </div>
                            <div
                                className="flex gap-2"
                                data-cy="certificate-tab-div-7"
                            >
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={Printer}
                                    onClick={handlePrint}
                                    disabled={!issued || printing}
                                    data-cy="certificate-tab-button-print"
                                >
                                    Print
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={RefreshCw}
                                    onClick={() => setIssueOpen(true)}
                                    disabled={!canIssue}
                                    data-cy="certificate-tab-button-generate"
                                >
                                    {issued ? 'Reissue' : 'Issue'}
                                </Button>
                            </div>
                        </div>

                        {!canIssue && (
                            <div
                                className="mb-4 rounded-md bg-warning-50 px-3.5 py-2.5 text-xs text-warning-800"
                                data-cy="certificate-tab-div-certificate-can-only-be-generated-once"
                            >
                                Certificate can only be issued once the
                                trainee completes {trainee.required_hours}{' '}
                                required hours ({completedHours} /{' '}
                                {trainee.required_hours} so far).
                            </div>
                        )}

                        <div
                            className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6"
                            data-cy="certificate-tab-div-16"
                        >
                            <CertificateSheet
                                doc={doc}
                                data-cy="certificate-tab-certificate-sheet-17"
                            />
                        </div>
                    </div>

                    {issued && (
                        <CertificateBatchPrint
                            docs={[doc]}
                            data-cy="certificate-tab-certificate-batch-print-18"
                        />
                    )}
                </div>
            </TraineesDetailLayout>

            <IssueCertificateModal
                open={issueOpen}
                recipientName={trainee.name}
                appliesTo="trainee"
                issueUrl={`/certificates/trainees/${trainee.id}/issue`}
                onClose={() => setIssueOpen(false)}
                onIssued={() => router.reload({ only: ['trainee'] })}
            />
        </>
    );
}
