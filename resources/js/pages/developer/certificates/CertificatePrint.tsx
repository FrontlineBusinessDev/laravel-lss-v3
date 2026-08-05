import { Award, Download } from 'lucide-react';
import { useState } from 'react';
import { LogoMark } from '@/components/Logo';
import { Button } from '@/components/Button';
import { usePermission } from '@/hooks/use-permissions';
import { renderCitation } from './certificateUtils';
import { exportTemplateAsPdf, exportTemplateAsPng } from './certificateExport';
import type { CertificateTemplate, TemplateElement } from './types';

export interface CertificateDoc {
  key: string | number;
  recipientName: string;
  subtitle: string; // e.g. "College OJT — Information Technology" or seminar topic
  citationText: string;
  certificateNo: string;
  issuedDate?: string | null;
  /** Course/program title — distinct from `subtitle`, which may mix program + industry. */
  courseTitle?: string;
  /** Name of the person/office issuing the certificate. */
  issuerName?: string;
  /** Public verification page URL (`/certificates/verify/{public_id}`) — its `/qr` suffix serves the QR PNG a `type: 'qr'` element renders. Unset for not-yet-issued certificates. */
  verificationUrl?: string | null;
  /** When set, the certificate renders using this template's positioned layout instead of the plain layout below. */
  template?: CertificateTemplate | null;
  /** Learning outcomes achieved as of issue/reissue time (frozen snapshot). Only rendered on the plain (non-templated) layout. */
  achievedOutcomes?: string[];
}

interface CertificateSheetProps {
  doc: CertificateDoc;
  /** 'print': hidden on screen, rendered only inside the print media query.
   *  'preview': always visible, used inside the on-screen preview modal. */
  variant?: 'print' | 'preview';
  /** Adds a page-break after this sheet so multiple certificates each print on their own page. */
  breakAfter?: boolean;
  /** Tailwind max-width class for the sheet itself — callers with more room (e.g. the public verification page) can size it up beyond the modal-friendly default. */
  maxWidthClass?: string;
}

/** Whole-element token values, and the {{inline_token}} vocabulary insertable into any free-text element via TemplateElementPanel's quick-insert chips. */
export function certificateDocTokens(doc: CertificateDoc) {
  return {
    trainee_name: doc.recipientName,
    course_title: doc.courseTitle || doc.subtitle,
    completion_date: doc.issuedDate || '',
    certificate_id: doc.certificateNo,
    issuer_name: doc.issuerName || '',
  };
}

export function resolveElementText(el: TemplateElement, doc: CertificateDoc): string {
  if (el.token === 'recipientName') return doc.recipientName;
  if (el.token === 'subtitle') return doc.subtitle;
  if (el.token === 'citationText') return doc.citationText;
  if (el.token === 'certificateNo') return `Certificate No. ${doc.certificateNo}`;
  if (el.token === 'issuedDate') return doc.issuedDate ? `Issued ${doc.issuedDate}` : 'Not yet issued';
  if (el.token === 'courseTitle') return doc.courseTitle || doc.subtitle;
  if (el.token === 'issuerName') return doc.issuerName || '';
  if (el.token === 'completionDate') return doc.issuedDate ? `Issued ${doc.issuedDate}` : 'Not yet issued';
  if (el.token === 'certificateId') return `Certificate No. ${doc.certificateNo}`;
  return renderCitation(el.text ?? '', certificateDocTokens(doc));
}

const OUTCOMES_COLUMN_CLASS: Record<number, string> = {
  1: 'columns-1',
  2: 'columns-2',
  3: 'columns-3',
};

function TemplateRenderedSheet({
  doc,
  template,
  variant,
  maxWidthClass,
}: {
  doc: CertificateDoc;
  template: CertificateTemplate;
  variant: 'print' | 'preview';
  maxWidthClass: string;
}) {
  const { hasRole } = usePermission();
  // Trainees never see the raw signature on screen; the print layout (triggered by an
  // authorized admin/issuer action) and PDF/PNG export always embed it regardless of role.
  const hideSignature = variant !== 'print' && hasRole('trainee');
  const aspect = template.orientation === 'portrait' ? '1 / 1.4142' : '1.4142 / 1';
  return (
    <div
      className={`relative w-full ${maxWidthClass} shadow-card`}
      style={{ aspectRatio: aspect, backgroundColor: template.background_color || '#ffffff', border: `3px solid ${template.border_color || '#0b3d66'}` }}
      data-cy="certificate-print-template-div-1"
    >
      {template.layout.map((el) => (
        <div
          key={el.id}
          className="absolute overflow-hidden"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: `${el.width}%`,
            height: el.height ? `${el.height}%` : undefined,
            fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
            fontWeight: el.fontWeight,
            fontFamily: el.fontFamily || undefined,
            textAlign: el.align ?? 'left',
            color: el.color,
          }}
          data-cy="certificate-print-template-element"
        >
          {el.type === 'line' && <div className="h-px w-full" style={{ backgroundColor: el.color || '#1f2937', height: el.strokeWidth ?? 2 }} />}
          {el.type === 'shape' && (
            <div
              className="h-full w-full"
              style={{
                backgroundColor: el.fill && el.fill !== 'transparent' ? el.fill : 'transparent',
                border: `${el.strokeWidth ?? 2}px solid ${el.color || '#0b3d66'}`,
                borderRadius: el.shape === 'circle' ? '9999px' : undefined,
              }}
            />
          )}
          {el.type === 'qr' && (
            doc.verificationUrl ? (
              <img src={`${doc.verificationUrl}/qr`} alt="Certificate verification QR code" className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center border border-dashed border-neutral-300 text-[9px] text-neutral-400">
                QR
              </div>
            )
          )}
          {el.type === 'outcomes' && !!doc.achievedOutcomes?.length && (
            <ul className={`${OUTCOMES_COLUMN_CLASS[el.columns ?? 2]} list-disc gap-x-4 pl-3 leading-snug`}>
              {doc.achievedOutcomes.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          )}
          {el.type === 'image' && el.src && (
            <img src={el.src} alt="" className="h-full w-full object-contain" />
          )}
          {el.type === 'signature' && el.src && !hideSignature && (
            <img src={el.src} alt="Authorized signature" className="h-full w-full object-contain" />
          )}
          {el.type === 'text' && <span>{resolveElementText(el, doc)}</span>}
        </div>
      ))}
    </div>
  );
}

/**
 * A single certificate document. Shared by the "preview before printing" modal
 * and the hidden print layout so both are guaranteed to look identical, and by
 * the trainee-level Certificate tab so the design stays consistent everywhere
 * a certificate is rendered in the system.
 */
export function CertificateSheet({ doc, variant = 'preview', breakAfter, maxWidthClass = 'max-w-2xl' }: CertificateSheetProps) {
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null);
  // w-full matters specifically for the templated branch below: it's nested inside a
  // `flex flex-col items-center` wrapper, whose `items-center` stops children from
  // stretching to the parent's width — without it this div (and the aspect-ratio'd,
  // percentage-positioned template sheet inside it) collapses to near-zero width.
  const wrapperClass =
    variant === 'print'
      ? `hidden w-full print:flex print-area bg-white text-ink items-center justify-center p-10 ${breakAfter ? 'cert-page-break' : ''}`
      : 'flex w-full items-center justify-center bg-neutral-50 p-4 sm:p-8 rounded-lg border border-dashed border-neutral-300';

  if (doc.template) {
    const template = doc.template;
    async function handleExport(format: 'png' | 'pdf') {
      setExporting(format);
      try {
        const filename = `certificate-${doc.certificateNo || doc.key}.${format}`;
        const resolve = (el: TemplateElement) => resolveElementText(el, doc);
        const options = {
          achievedOutcomes: doc.achievedOutcomes ?? [],
          backgroundColor: template.background_color || undefined,
          borderColor: template.border_color || undefined,
          verificationUrl: doc.verificationUrl || undefined,
        };
        if (format === 'png') {
          await exportTemplateAsPng(template.layout, template.orientation, resolve, filename, options);
        } else {
          await exportTemplateAsPdf(template.layout, template.orientation, resolve, filename, options);
        }
      } finally {
        setExporting(null);
      }
    }

    return (
      <div className="flex w-full flex-col items-center gap-3" data-cy="certificate-print-div-1">
        <div className={wrapperClass}>
          <TemplateRenderedSheet doc={doc} template={template} variant={variant} maxWidthClass={maxWidthClass} />
        </div>
        {variant === 'preview' && (
          <div className="no-print flex gap-2">
            <Button variant="secondary" size="sm" icon={Download} disabled={exporting !== null} onClick={() => void handleExport('png')}>
              {exporting === 'png' ? 'Exporting…' : 'Download PNG'}
            </Button>
            <Button variant="secondary" size="sm" icon={Download} disabled={exporting !== null} onClick={() => void handleExport('pdf')}>
              {exporting === 'pdf' ? 'Exporting…' : 'Download PDF'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClass} data-cy="certificate-print-div-1">
      <div className={`relative w-full ${maxWidthClass} border-[3px] border-brand-700 bg-white p-6 sm:p-10 shadow-card`} data-cy="certificate-print-div-2">
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

          {!!doc.achievedOutcomes?.length && (
            <div className="mx-auto mt-4 max-w-lg text-left" data-cy="certificate-print-div-outcomes">
              <div className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400" data-cy="certificate-print-div-outcomes-label">Learning Outcomes Achieved</div>
              <ul className="mt-1 list-disc pl-4 text-[11px] leading-relaxed text-neutral-600" data-cy="certificate-print-ul-outcomes">
                {doc.achievedOutcomes.map((title) => (
                  <li key={title} data-cy="certificate-print-li-outcome">{title}</li>
                ))}
              </ul>
            </div>
          )}

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
    </div>
  );
}

/** Renders one certificate per document for the hidden print layout, each on its own page. */
export function CertificateBatchPrint({ docs }: { docs: CertificateDoc[] }) {
  return (
    <>
      {docs.map((doc, i) => (
        <CertificateSheet key={doc.key} doc={doc} variant="print" breakAfter={i < docs.length - 1} data-cy="certificate-print-certificate-sheet-20" />
      ))}
    </>
  );
}
