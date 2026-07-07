import { Award } from 'lucide-react'
import { LogoMark } from '@/components/Logo'

export interface CertificateDoc {
  key: string
  recipientName: string
  subtitle: string // e.g. "College OJT \u2014 Information Technology" or seminar topic
  citationText: string
  certificateNo: string
  issuedDate?: string
}

interface CertificateSheetProps {
  doc: CertificateDoc
  /** 'print': hidden on screen, rendered only inside the print media query.
   *  'preview': always visible, used inside the on-screen preview modal. */
  variant?: 'print' | 'preview'
  /** Adds a page-break after this sheet so multiple certificates each print on their own page. */
  breakAfter?: boolean
}

/**
 * A single certificate document. Shared by the "preview before printing" modal
 * and the hidden print layout so both are guaranteed to look identical, and by
 * the trainee-level Certificate tab so the design stays consistent everywhere
 * a certificate is rendered in the system.
 */
export function CertificateSheet({ doc, variant = 'preview', breakAfter }: CertificateSheetProps) {
  const wrapperClass =
    variant === 'print'
      ? `hidden print:flex print-area bg-white text-ink items-center justify-center p-10 ${breakAfter ? 'cert-page-break' : ''}`
      : 'flex items-center justify-center bg-neutral-50 p-4 sm:p-8 rounded-lg border border-dashed border-neutral-300'

  return (
    <div className={wrapperClass}>
      <div className="relative w-full max-w-2xl border-[3px] border-brand-700 bg-white p-6 sm:p-10 shadow-card">
        <div className="absolute inset-2 border border-brand-200" aria-hidden="true" />
        <div className="relative flex flex-col items-center text-center">
          <LogoMark size={44} />
          <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">
            Frontline Business Solutions
          </div>
          <div className="text-[9px] uppercase tracking-widest text-neutral-400">Learning Solutions System</div>

          <div className="my-5 h-px w-24 bg-brand-200" />

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            <Award size={16} className="text-accent-start" /> Certificate of Completion
          </div>

          <div className="mt-5 font-serif text-2xl font-bold text-ink sm:text-3xl">{doc.recipientName}</div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-600">{doc.subtitle}</div>

          <p className="mx-auto mt-5 max-w-lg text-[13px] leading-relaxed text-neutral-600">{doc.citationText}</p>

          <div className="mt-8 grid w-full grid-cols-2 gap-10 text-[11px]">
            <div className="border-t border-ink pt-1.5 text-neutral-600">Program Director</div>
            <div className="border-t border-ink pt-1.5 text-neutral-600">Training Coordinator</div>
          </div>

          <div className="mt-6 flex w-full items-center justify-between text-[10px] text-neutral-400">
            <span>Certificate No. {doc.certificateNo}</span>
            <span>{doc.issuedDate ? `Issued ${doc.issuedDate}` : 'Not yet issued'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Renders one certificate per document for the hidden print layout, each on its own page. */
export function CertificateBatchPrint({ docs }: { docs: CertificateDoc[] }) {
  return (
    <>
      {docs.map((doc, i) => (
        <CertificateSheet key={doc.key} doc={doc} variant="print" breakAfter={i < docs.length - 1} />
      ))}
    </>
  )
}
