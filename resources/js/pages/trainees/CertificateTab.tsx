import { useState } from 'react'
import { Printer, RefreshCw, Info } from 'lucide-react'
import type { Trainee } from '@/types'
import { Button } from '@/components/Button'
import { Dropdown } from '@/components/Dropdown'
import { useToast } from '@/components/Toast'
import { certificateCitations } from '@/data/mockData'
import { CertificateSheet, CertificateBatchPrint } from '@/pages/certificates/CertificatePrint'
import { renderCitation, tokensForTrainee, selectableCitations } from '@/pages/certificates/certificateUtils'

export function CertificateTab({ trainee }: { trainee: Trainee }) {
  const { showToast } = useToast()
  const [certificate, setCertificate] = useState(
    trainee.certificate ?? { issued: false, certificateNo: `CERT-${new Date().getFullYear()}-0000` },
  )
  const [citationId, setCitationId] = useState(
    certificate.citationId ?? certificateCitations.find((c) => c.appliesTo !== 'Seminar' && c.status === 'active')?.id ?? '',
  )
  const [regenerating, setRegenerating] = useState(false)
  const [printing, setPrinting] = useState(false)

  const canIssue = trainee.completedHrs >= trainee.requiredHrs
  const options = selectableCitations(certificateCitations, 'Trainee', citationId)
  const selectedCitation = options.find((c) => c.id === citationId) ?? options[0]

  const citationText = selectedCitation
    ? renderCitation(selectedCitation.bodyText, tokensForTrainee(trainee))
    : `This is to certify that ${trainee.name} has completed ${trainee.requiredHrs} hours of training in ${trainee.industry} under the ${trainee.programType} program.`

  const handleGenerate = () => {
    setRegenerating(true)
    setTimeout(() => {
      const wasIssued = certificate.issued
      setCertificate((c) => ({ ...c, issued: true, issuedDate: new Date().toISOString().slice(0, 10), citationId: selectedCitation?.id }))
      setRegenerating(false)
      showToast(`Certificate ${wasIssued ? 'regenerated' : 'generated'} for ${trainee.name}.`, 'success')
    }, 500)
  }

  const handlePrint = () => {
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setPrinting(false)
    }, 50)
  }

  const doc = {
    key: trainee.id,
    recipientName: trainee.name,
    subtitle: `${trainee.programType} — ${trainee.industry}`,
    citationText,
    certificateNo: certificate.certificateNo,
    issuedDate: certificate.issuedDate,
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="no-print">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink">Certificate of completion</h3>
            <p className="text-xs text-neutral-500">
              {certificate.issued ? `Issued on ${certificate.issuedDate}` : 'Not yet generated for this trainee'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint} disabled={!certificate.issued || printing}>
              Print
            </Button>
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={handleGenerate} disabled={!canIssue || regenerating}>
              {certificate.issued ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
        </div>

        {!canIssue && (
          <div className="mb-4 rounded-md bg-warning-50 px-3.5 py-2.5 text-xs text-warning-800">
            Certificate can only be generated once the trainee completes {trainee.requiredHrs} required hours
            ({trainee.completedHrs} / {trainee.requiredHrs} so far).
          </div>
        )}

        <div className="mb-4 flex flex-col gap-1.5 sm:max-w-xs">
          <label className="text-xs font-medium text-neutral-600">Citation</label>
          <Dropdown
            options={options.map((c) => c.title)}
            value={selectedCitation?.title}
            onChange={(title) => {
              const match = options.find((c) => c.title === title)
              if (match) setCitationId(match.id)
            }}
          />
          <p className="flex items-start gap-1 text-[11px] text-neutral-400">
            <Info size={12} className="mt-0.5 shrink-0" />
            Managed in Certificates &rarr; Citation. Selecting a citation here applies it the next time this certificate is generated.
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6">
          <CertificateSheet doc={doc} />
        </div>
      </div>

      {certificate.issued && <CertificateBatchPrint docs={[doc]} />}
    </div>
  )
}
