import { useState } from 'react';
import { seminarParticipants, currentUser } from '@/data/mockData';
import { useBatches } from '@/context/BatchesContext';
import { cn } from '@/lib/utils';
import { TraineesCertificateTab } from './TraineesCertificateTab';
import { SeminarCertificateTab } from './SeminarCertificateTab';
import { CitationTab } from './CitationTab';
const TABS = ['Trainees', 'Seminar', 'Citation'] as const;
export default function CertificatePage() {
  const {
    trainees
  } = useBatches();
  const [tab, setTab] = useState<typeof TABS[number]>('Trainees');
  const issuedTrainees = trainees.filter(t => t.certificate?.issued).length;
  const issuedSeminar = seminarParticipants.filter(p => p.certificate?.issued).length;
  return <div data-cy="index-div-1">
      <div className="mb-4 flex items-center justify-between no-print" data-cy="index-div-2">
        <div data-cy="index-div-3">
          <h1 className="text-xl font-semibold text-ink" data-cy="index-h1-certificates">Certificates</h1>
          <p className="text-sm text-neutral-500" data-cy="index-p-trainee">
            {issuedTrainees} trainee &amp; {issuedSeminar} seminar certificate{issuedTrainees + issuedSeminar === 1 ? '' : 's'} issued to date
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-5 border-b border-neutral-200 pl-0.5 no-print" data-cy="index-div-6">
        {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={cn('pb-2.5 text-xs font-medium transition-colors', tab === t ? 'border-b-2 border-brand-500 text-ink font-semibold' : 'text-neutral-500 hover:text-neutral-700')} data-cy="index-button-set-tab">
            {t}
          </button>)}
      </div>

      {tab === 'Trainees' && <TraineesCertificateTab data-cy="index-trainees-certificate-tab-8" />}
      {tab === 'Seminar' && <SeminarCertificateTab data-cy="index-seminar-certificate-tab-9" />}
      {tab === 'Citation' && <CitationTab currentUserName={currentUser.name} data-cy="index-citation-tab-10" />}
    </div>;
}