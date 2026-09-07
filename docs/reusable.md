# Reusable Code

Before writing code

Can existing component be reused?

Can hook be reused?

Can service be reused?

Can utility be reused?

Can schema be reused?

Can type be reused?

Only create new implementations when reuse isn't possible.

## Confirming a destructive action

Never use `window.confirm()` / `window.alert()`. Use `ConfirmDialog` (`resources/js/components/ConfirmDialog.tsx`):

```tsx
import { ConfirmDialog } from '@/components/ConfirmDialog';

const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

<ConfirmDialog
  open={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  onConfirm={() => deleteTarget && void confirmDelete(deleteTarget)}
  title="Delete this record?"
  description="This cannot be undone."
  confirmLabel="Delete"
  tone="danger"
/>
```

Props: `open`, `onClose`, `onConfirm`, `title`, `description`, `confirmLabel?` (default "Confirm"), `cancelLabel?` (default "Cancel"), `tone?: 'danger' | 'default'`, `confirmDisabled?`, `children?`.