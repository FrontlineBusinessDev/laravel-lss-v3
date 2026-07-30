import { GraduationCap, Users } from 'lucide-react';
import { Modal } from '@/components/Modal';
import type { CertificateType } from '../types';

interface NewTemplateTypeModalProps {
  open: boolean;
  onClose: () => void;
  onChoose: (type: CertificateType) => void;
}

const OPTIONS: { type: CertificateType; icon: typeof Users; title: string; description: string }[] = [
  {
    type: 'trainee',
    icon: GraduationCap,
    title: 'Trainee certificate',
    description: 'Portrait layout. Includes each trainee\'s learning outcomes.',
  },
  {
    type: 'seminar',
    icon: Users,
    title: 'Seminar certificate',
    description: 'Landscape layout, for seminar attendees.',
  },
];

export function NewTemplateTypeModal({ open, onClose, onChoose }: NewTemplateTypeModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="New certificate template" description="Choose who this template is for." maxWidth={520} data-cy="new-template-type-modal">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-cy="new-template-type-options">
        {OPTIONS.map(({ type, icon: Icon, title, description }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChoose(type)}
            className="flex flex-col items-start gap-2 rounded-lg border border-neutral-200 p-4 text-left transition-colors hover:border-brand-400 hover:bg-brand-50"
            data-cy={`new-template-type-option-${type}`}
          >
            <span className="flex size-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <Icon size={18} />
            </span>
            <span className="text-sm font-semibold text-ink">{title}</span>
            <span className="text-xs text-neutral-500">{description}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
