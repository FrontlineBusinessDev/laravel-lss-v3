import { useEffect, useState } from 'react'
import { Building2, Video } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { SelectField } from '@/components/FormField'
import { useBatches } from '@/context/BatchesContext'
import { useToast } from '@/components/Toast'
import { PROGRAM_TYPES } from '@/lib/constants'
import type { Batch } from '@/types'
import { cn } from '@/lib/utils'

const INDUSTRIES = ['Accounting', 'Information Technology']

export function EditBatchModal({ open, onClose, batch }: { open: boolean; onClose: () => void; batch: Batch }) {
  const { updateBatch } = useBatches()
  const { showToast } = useToast()

  const [setup, setSetup] = useState<'F2F' | 'Online'>(batch.setup)
  const [programType, setProgramType] = useState(batch.programType)
  const [industry, setIndustry] = useState(batch.industry)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setSetup(batch.setup)
      setProgramType(batch.programType)
      setIndustry(batch.industry)
      setError('')
    }
  }, [open, batch])

  function handleSave() {
    if (!programType || !industry) {
      setError('Please select a program type and industry to continue.')
      return
    }
    updateBatch(batch.id, { setup, programType, industry })
    showToast(`Batch ${batch.batchNo} updated successfully.`, 'success')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit batch" description={`Editing ${batch.batchNo}. Batch number cannot be changed.`}>
      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">Batch number</label>
        <div className="flex h-9 items-center rounded-md bg-neutral-50 px-2.5 font-mono text-sm text-neutral-500">
          {batch.batchNo}
        </div>
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">Setup</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSetup('F2F')}
            className={cn(
              'flex-1 rounded-md border px-3 py-2.5 text-center text-xs font-medium transition-all duration-150 active:scale-[0.97]',
              setup === 'F2F' ? 'border-[1.5px] border-brand-500 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
            )}
          >
            <Building2 size={15} className="mx-auto mb-1" />
            Face-to-face
          </button>
          <button
            type="button"
            onClick={() => setSetup('Online')}
            className={cn(
              'flex-1 rounded-md border px-3 py-2.5 text-center text-xs font-medium transition-all duration-150 active:scale-[0.97]',
              setup === 'Online' ? 'border-[1.5px] border-brand-500 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
            )}
          >
            <Video size={15} className="mx-auto mb-1" />
            Online
          </button>
        </div>
      </div>

      <SelectField
        label="Program type"
        options={PROGRAM_TYPES}
        value={programType}
        onChange={(e) => setProgramType(e.target.value)}
      />
      <div className="mb-1">
        <SelectField label="Industry" options={INDUSTRIES} value={industry} onChange={(e) => setIndustry(e.target.value)} />
      </div>

      {error && <p className="mb-2 text-xs font-medium text-danger-600">{error}</p>}

      <div className="mt-5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSave}>
          Save changes
        </Button>
      </div>
    </Modal>
  )
}
