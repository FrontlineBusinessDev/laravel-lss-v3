import { useState } from 'react'
import { useNavigate, useParams } from '@/lib/router-compat'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { getTraineeBatchStatus } from '@/data/mockData'
import { useBatches } from '@/context/BatchesContext'
import { cn } from '@/lib/utils'
import { PersonalInfoTab } from './PersonalInfoTab'
import { AcademicInfoTab } from './AcademicInfoTab'
import { DocumentsTab } from './DocumentsTab'
import { LearningOutcomesTab } from './LearningOutcomesTab'
import { PaymentDetailsTab } from './PaymentDetailsTab'
import { RatingsTab } from './RatingsTab'
import { CertificateTab } from './CertificateTab'
import { BiometricsTab } from './BiometricsTab'

const TABS = ['Personal information', 'Academic information', 'Documents', 'Learning outcomes', 'Payment details', 'Ratings', 'Certificate', 'Biometrics'] as const
type Tab = (typeof TABS)[number]

export default function TraineeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { trainees } = useBatches()
  const [tab, setTab] = useState<Tab>('Personal information')
  const trainee = trainees.find((t) => t.id === id) ?? trainees[0]
  const displayStatus = getTraineeBatchStatus(trainee)

  return (
    <div>
      <button
        onClick={() => navigate('/trainees')}
        className="mb-3 flex items-center gap-1.5 text-xs text-neutral-500 transition-opacity hover:opacity-60"
      >
        <ArrowLeft size={14} />
        Back to trainees
      </button>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
            {trainee.initials}
          </div>
          <div>
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-lg font-semibold text-ink">{trainee.name}</span>
              <span
                className={
                  displayStatus === 'Active'
                    ? 'inline-flex items-center rounded-pill bg-success-50 px-2.5 py-0.5 text-xs font-medium leading-5 text-success-800'
                    : 'inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-0.5 text-xs font-medium leading-5 text-neutral-600'
                }
              >
                {displayStatus}
              </span>
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Mail size={12} /> {trainee.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={12} /> {trainee.mobileNumber}
              </span>
              <span>
                {trainee.batchNo} · {trainee.school}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5 lss-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'whitespace-nowrap pb-2.5 text-xs font-medium transition-colors',
              tab === t ? 'border-b-2 border-brand-500 text-ink font-semibold' : 'text-neutral-500 hover:text-neutral-700',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Personal information' && <PersonalInfoTab trainee={trainee} />}
      {tab === 'Academic information' && <AcademicInfoTab trainee={trainee} />}
      {tab === 'Documents' && <DocumentsTab trainee={trainee} />}
      {tab === 'Learning outcomes' && <LearningOutcomesTab trainee={trainee} />}
      {tab === 'Payment details' && <PaymentDetailsTab trainee={trainee} />}
      {tab === 'Ratings' && <RatingsTab trainee={trainee} />}
      {tab === 'Certificate' && <CertificateTab trainee={trainee} />}
      {tab === 'Biometrics' && <BiometricsTab trainee={trainee} />}
    </div>
  )
}
