import { ArrowLeftRight, UserX, Archive, ArchiveRestore, Eye } from 'lucide-react'
import { RowMenu } from '@/components/RowMenu'
import type { Trainee } from '@/types'

interface TraineeRowMenuProps {
  trainee: Trainee
  onView: () => void
  onTransfer: () => void
  onTerminate: () => void
  onArchive: () => void
  onRestore: () => void
}

export function TraineeRowMenu({ trainee, onView, onTransfer, onTerminate, onArchive, onRestore }: TraineeRowMenuProps) {
  const isTerminated = trainee.status === 'terminated'
  const isArchived = !!trainee.archived

  return (
    <RowMenu
      actions={[
        { label: 'View details', icon: Eye, onClick: onView },
        { label: 'Transfer trainee', icon: ArrowLeftRight, onClick: onTransfer, disabled: isArchived },
        isArchived
          ? { label: 'Restore trainee', icon: ArchiveRestore, onClick: onRestore }
          : { label: 'Archive trainee', icon: Archive, onClick: onArchive },
        { label: 'Terminate trainee', icon: UserX, onClick: onTerminate, danger: true, disabled: isTerminated || isArchived },
      ]}
    />
  )
}
