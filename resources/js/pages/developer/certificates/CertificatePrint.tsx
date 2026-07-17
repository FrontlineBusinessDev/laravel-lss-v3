import { Award } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
export interface CertificateDoc {
  key: string;
  recipientName: string;
  subtitle: string; // e.g. "College OJT \u2014 Information Technology" or seminar topic
  citationText: string;
  certificateNo: string;
  issuedDate?: string;
}
interface CertificateSheetProps {
  doc: CertificateDoc;
  /** 'print': hidden on screen, rendered only inside the print media query.
   *  'preview': always visible, used inside the on-screen preview modal. */
  variant?: 'print' | 'preview';
  /** Adds a page-break after this sheet so multiple certificates each print on their own page. */
  breakAfter?: boolean;
}

/**
 * A single certificate document. Shared by the "preview before printing" modal
 * and the hidden print layout so both are guaranteed to look identical, and by
 * the trainee-level Certificate tab so the design stays consistent everywhere
 * a certificate is rendered in the system.
 */
export function CertificateSheet({
  doc,
  variant = 'preview',
  breakAfter
}: CertificateSheetProps) {
  const wrapperClass = variant === 'print' ? `hidden print:flex print-area bg-white text-ink items-center justify-center p-10 ${breakAfter ? 'cert-page-break' : ''}` : 'flex items-center justify-center bg-neutral-50 p-4 sm:p-8 rounded-lg border border-dashed border-neutral-300';
  return <div className={wrapperClass} data-cy="certificate-print-div-1">
      <div className="relative w-full max-w-2xl border-[3px] border-brand-700 bg-white p-6 sm:p-10 shadow-card" data-cy="certificate-print-div-2">
        <div className="absolute inset-2 border border-brand-200" aria-hidden="true" data-cy="certificate-print-div-3" />
        <div className="relative flex flex-col items-center text-center" data-cy="certificate-print-div-4">
          <LogoMark size={44} data-cy="certificate-print-logo-mark-5" />
          <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700" data-cy="certificate-print-div-frontline-business-solutions">
            Frontline Business Solutions
          </div>
          <div className="text-[9px] uppercase tracking-widest text-neutral-400" data-cy="certificate-print-div-learning-solutions-system">Learning Solutions System</div>

          <div className="my-5 h-px w-24 bg-brand-200" data-cy="certificate-print-div-8" />

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500" data-cy="certificate-print-div-certificate-of-completion">
            <Award size={16} className="text-accent-start" data-cy="certificate-print-award-10" /> Certificate of Completion
          </div>

          <div className="mt-5 font-serif text-2xl font-bold text-ink sm:text-3xl" data-cy="certificate-print-div-11">{doc.recipientName}</div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-600" data-cy="certificate-print-div-12">{doc.subtitle}</div>

          <p className="mx-auto mt-5 max-w-lg text-[13px] leading-relaxed text-neutral-600" data-cy="certificate-print-p-13">{doc.citationText}</p>

          <div className="mt-8 grid w-full grid-cols-2 gap-10 text-[11px]" data-cy="certificate-print-div-14">
            <div className="border-t border-ink pt-1.5 text-neutral-600" data-cy="certificate-print-div-program-director">Program Director</div>
            <div className="border-t border-ink pt-1.5 text-neutral-600" data-cy="certificate-print-div-training-coordinator">Training Coordinator</div>
          </div>

          <div className="mt-6 flex w-full items-center justify-between text-[10px] text-neutral-400" data-cy="certificate-print-div-17">
            <span data-cy="certificate-print-span-certificate-no">Certificate No. {doc.certificateNo}</span>
            <span data-cy="certificate-print-span-19">{doc.issuedDate ? `Issued ${doc.issuedDate}` : 'Not yet issued'}</span>
          </div>
        </div>
      </div>
    </div>;
}

/** Renders one certificate per document for the hidden print layout, each on its own page. */
export function CertificateBatchPrint({
  docs
}: {
  docs: CertificateDoc[];
}) {
  return <>
      {docs.map((doc, i) => <CertificateSheet key={doc.key} doc={doc} variant="print" breakAfter={i < docs.length - 1} data-cy="certificate-print-certificate-sheet-20" />)}
    </>;
}