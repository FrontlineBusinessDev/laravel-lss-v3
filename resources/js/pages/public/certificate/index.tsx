import { Head } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import { CertificateSheet, type CertificateDoc } from '@/pages/developer/certificates/CertificatePrint';

interface PublicCertificatePageProps {
    valid: boolean;
    doc: CertificateDoc | null;
}

export default function PublicCertificatePage({ valid, doc }: PublicCertificatePageProps) {
    return (
        <div className="min-h-screen bg-neutral-50 p-4 sm:p-8" data-cy="public-certificate-div-shell">
            <Head title={valid ? `Verified certificate — ${doc?.recipientName}` : 'Certificate not found'} />

            <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-neutral-400">
                    <LogoMark size={28} />
                    <span>Certificate Verification</span>
                </div>

                {valid && doc ? (
                    <>
                        <div className="flex items-center gap-2 rounded-pill bg-success-50 px-4 py-2 text-sm font-medium text-success-800">
                            <CheckCircle2 size={18} />
                            This is a valid, system-issued certificate.
                        </div>

                        <div className="w-full rounded-lg border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-600 sm:p-5">
                            <div className="text-lg font-semibold text-ink">{doc.recipientName}</div>
                            {doc.courseTitle && <div>{doc.courseTitle}</div>}
                            <div className="mt-1 text-xs text-neutral-400">
                                Certificate No. {doc.certificateNo}
                                {doc.issuedDate ? ` · Issued ${doc.issuedDate}` : ''}
                            </div>
                        </div>

                        <CertificateSheet doc={doc} variant="preview" maxWidthClass="max-w-4xl" />
                    </>
                ) : (
                    <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
                        <XCircle size={32} className="text-danger-500" />
                        <p className="text-sm font-medium text-ink">This certificate could not be verified.</p>
                        <p className="text-xs text-neutral-500">
                            The link may be invalid or the certificate may no longer exist. If you believe this is an
                            error, contact the issuing institution.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
