import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { useToast } from '@/components/Toast';
import { certificateCitations } from '@/data/mockData';
import TraineesDetailLayout from '@/layouts/trainees/TraineesDetailLayout';
import {
    CertificateBatchPrint,
    CertificateSheet,
} from '@/pages/developer/certificates/CertificatePrint';
import type { Trainee } from '@/types';
import { Info, Printer, RefreshCw } from 'lucide-react';
import { useState } from 'react';

/** Local (mock-data-shaped) citation helpers for this trainee-detail sub-tab — kept independent of the real /certificates module's citation utils, which operate on the new API row shapes. */
function selectableMockCitations(citationId: string) {
    return certificateCitations.filter(
        (c) =>
            (c.status === 'active' || c.id === citationId) &&
            (c.appliesTo === 'Trainee' || c.appliesTo === 'Both'),
    );
}
function renderMockCitation(bodyText: string, trainee: Trainee): string {
    const tokens: Record<string, string | number> = {
        name: trainee.name ?? '',
        school: trainee.school,
        program: trainee.programType,
        industry: trainee.industry,
        hours: trainee.requiredHrs,
    };
    return bodyText.replace(/{{\s*(\w+)\s*}}/g, (_match, key: string) =>
        key in tokens ? String(tokens[key]) : '—',
    );
}

export default function CertificateTab({ trainee }: { trainee: Trainee }) {
    const { showToast } = useToast();
    const [certificate, setCertificate] = useState(
        trainee.certificate ?? {
            issued: false,
            certificateNo: `CERT-${new Date().getFullYear()}-0000`,
        },
    );
    const [citationId, setCitationId] = useState(
        certificate.citationId ??
            certificateCitations.find(
                (c) => c.appliesTo !== 'Seminar' && c.status === 'active',
            )?.id ??
            '',
    );
    const [regenerating, setRegenerating] = useState(false);
    const [printing, setPrinting] = useState(false);
    const canIssue = trainee.completedHrs >= trainee.requiredHrs;
    const options = selectableMockCitations(citationId);
    const selectedCitation =
        options.find((c) => c.id === citationId) ?? options[0];
    const citationText = selectedCitation
        ? renderMockCitation(selectedCitation.bodyText, trainee)
        : `This is to certify that ${trainee.name} has completed ${trainee.requiredHrs} hours of training in ${trainee.industry} under the ${trainee.programType} program.`;
    const handleGenerate = () => {
        setRegenerating(true);
        setTimeout(() => {
            const wasIssued = certificate.issued;
            setCertificate((c) => ({
                ...c,
                issued: true,
                issuedDate: new Date().toISOString().slice(0, 10),
                citationId: selectedCitation?.id,
            }));
            setRegenerating(false);
            showToast(
                `Certificate ${wasIssued ? 'regenerated' : 'generated'} for ${trainee.name}.`,
                'success',
            );
        }, 500);
    };
    const handlePrint = () => {
        setPrinting(true);
        setTimeout(() => {
            window.print();
            setPrinting(false);
        }, 50);
    };
    const doc = {
        key: trainee.id,
        recipientName: trainee.name,
        subtitle: `${trainee.programType} — ${trainee.industry}`,
        citationText,
        certificateNo: certificate.certificateNo,
        issuedDate: certificate.issuedDate,
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
                                    {certificate.issued
                                        ? `Issued on ${certificate.issuedDate}`
                                        : 'Not yet generated for this trainee'}
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
                                    disabled={!certificate.issued || printing}
                                    data-cy="certificate-tab-button-print"
                                >
                                    Print
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={RefreshCw}
                                    onClick={handleGenerate}
                                    disabled={!canIssue || regenerating}
                                    data-cy="certificate-tab-button-generate"
                                >
                                    {certificate.issued
                                        ? 'Regenerate'
                                        : 'Generate'}
                                </Button>
                            </div>
                        </div>

                        {!canIssue && (
                            <div
                                className="mb-4 rounded-md bg-warning-50 px-3.5 py-2.5 text-xs text-warning-800"
                                data-cy="certificate-tab-div-certificate-can-only-be-generated-once"
                            >
                                Certificate can only be generated once the
                                trainee completes {trainee.requiredHrs} required
                                hours ({trainee.completedHrs} /{' '}
                                {trainee.requiredHrs} so far).
                            </div>
                        )}

                        <div
                            className="mb-4 flex flex-col gap-1.5 sm:max-w-xs"
                            data-cy="certificate-tab-div-11"
                        >
                            <label
                                className="text-xs font-medium text-neutral-600"
                                data-cy="certificate-tab-label-citation"
                            >
                                Citation
                            </label>
                            <Dropdown
                                options={options.map((c) => c.title)}
                                value={selectedCitation?.title}
                                onChange={(title) => {
                                    const match = options.find(
                                        (c) => c.title === title,
                                    );
                                    if (match) setCitationId(match.id);
                                }}
                                data-cy="certificate-tab-dropdown-13"
                            />
                            <p
                                className="flex items-start gap-1 text-[11px] text-neutral-400"
                                data-cy="certificate-tab-p-managed-in-certificates-citation-selecting"
                            >
                                <Info
                                    size={12}
                                    className="mt-0.5 shrink-0"
                                    data-cy="certificate-tab-info-15"
                                />
                                Managed in Certificates &rarr; Citation.
                                Selecting a citation here applies it the next
                                time this certificate is generated.
                            </p>
                        </div>

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

                    {certificate.issued && (
                        <CertificateBatchPrint
                            docs={[doc]}
                            data-cy="certificate-tab-certificate-batch-print-18"
                        />
                    )}
                </div>
            </TraineesDetailLayout>
        </>
    );
}
