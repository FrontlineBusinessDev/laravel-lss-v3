import { useMemo, useState } from 'react'
import { Plus, Search, KeyRound, Ban, CheckCircle2, Archive, ArchiveRestore, Trash2, Pencil, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { RowMenu } from '@/components/RowMenu'
import { Dropdown } from '@/components/Dropdown'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { AddUserModal, type UserFormValues } from './AddUserModal'
import { useToast } from '@/components/Toast'
import { appUsers as initialUsers, currentUser } from '@/data/mockData'
import type { AppUser } from '@/types'
import { cn } from '@/lib/utils'

const SUB_TABS = ['Users', 'Roles'] as const
type SubTab = (typeof SUB_TABS)[number]
type PendingAction = { type: 'suspend' | 'reactivate' | 'archive' | 'restore' | 'delete' | 'reset'; user: AppUser } | null

export function UsersTab() {
  const { showToast } = useToast()
  const [users, setUsers] = useState<AppUser[]>(initialUsers)
  const [sub, setSub] = useState<SubTab>('Users')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All roles')
  const [statusFilter, setStatusFilter] = useState('All statuses')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AppUser | null>(null)
  const [pending, setPending] = useState<PendingAction>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchesRole = roleFilter === 'All roles' || u.role === roleFilter
      const matchesStatus = statusFilter === 'All statuses' || u.status === statusFilter.toLowerCase()
      return matchesQuery && matchesRole && matchesStatus
    })
  }, [users, query, roleFilter, statusFilter])

  const adminCount = users.filter((u) => u.role === 'Administrator' && u.status !== 'archived').length

  function isLastActiveAdmin(u: AppUser) {
    return u.role === 'Administrator' && u.status !== 'archived' && adminCount <= 1
  }

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }
  function openEdit(u: AppUser) {
    setEditing(u)
    setModalOpen(true)
  }

  function handleSave(values: UserFormValues) {
    if (editing) {
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? { ...u, ...values } : u)))
      showToast(`${values.name}\u2019s details were updated.`, 'success')
    } else {
      const newUser: AppUser = {
        id: `u${Date.now()}`,
        name: values.name,
        email: values.email,
        mobileNumber: values.mobileNumber || undefined,
        role: values.role,
        status: 'pending',
      }
      setUsers((prev) => [newUser, ...prev])
      showToast(`Invitation sent to ${values.email}.`, 'success')
    }
    setModalOpen(false)
    setEditing(null)
  }

  function runConfirmed() {
    if (!pending) return
    const { type, user } = pending
    switch (type) {
      case 'reset':
        showToast(`Password reset link sent to ${user.email}.`, 'success')
        break
      case 'suspend':
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'suspended' } : u)))
        showToast(`${user.name} has been suspended.`, 'error')
        break
      case 'reactivate':
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'active' } : u)))
        showToast(`${user.name} has been reactivated.`, 'success')
        break
      case 'archive':
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'archived' } : u)))
        showToast(`${user.name} was archived.`, 'success')
        break
      case 'restore':
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'active' } : u)))
        showToast(`${user.name} was restored.`, 'success')
        break
      case 'delete':
        setUsers((prev) => prev.filter((u) => u.id !== user.id))
        showToast(`${user.name}\u2019s account was deleted.`, 'error')
        break
    }
    setPending(null)
  }

  const dialogCopy: Record<NonNullable<PendingAction>['type'], { title: string; tone: 'danger' | 'default'; confirmLabel: string; description: (u: AppUser) => string }> = {
    reset: {
      title: 'Reset password',
      tone: 'default',
      confirmLabel: 'Send reset link',
      description: (u) => `Send a password reset link to ${u.email}? They\u2019ll be able to set a new password from that link.`,
    },
    suspend: {
      title: 'Suspend user',
      tone: 'danger',
      confirmLabel: 'Suspend user',
      description: (u) => `${u.name} will immediately lose access to the system. You can reactivate this account anytime.`,
    },
    reactivate: {
      title: 'Reactivate user',
      tone: 'default',
      confirmLabel: 'Reactivate',
      description: (u) => `${u.name} will regain access to sign in to the system.`,
    },
    archive: {
      title: 'Archive user',
      tone: 'default',
      confirmLabel: 'Archive',
      description: (u) => `${u.name} will be moved to archived records. You can restore this account later.`,
    },
    restore: {
      title: 'Restore user',
      tone: 'default',
      confirmLabel: 'Restore',
      description: (u) => `${u.name} will be restored to active records.`,
    },
    delete: {
      title: 'Delete user',
      tone: 'danger',
      confirmLabel: 'Delete permanently',
      description: (u) =>
        isLastActiveAdmin(u)
          ? `${u.name} is the only remaining Administrator. Assign another Administrator before deleting this account.`
          : `This permanently deletes ${u.name}\u2019s account and cannot be undone.`,
    },
  }

  return (
    <div>

            <div className="mb-3.5 flex flex-wrap gap-1.5">
              {SUB_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSub(t)}
                  className={cn(
                    'rounded-pill px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.97]',
                    sub === t ? 'bg-brand-500 text-white' : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <div className="relative w-full sm:max-w-[240px]">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm shadow-card transition-colors hover:border-neutral-300 hover:shadow-none focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="w-full sm:w-44">
            <Dropdown
              options={['All roles', 'Administrator', 'Program coordinator', 'Trainer', 'Finance', 'Trainee']}
              value={roleFilter}
              onChange={setRoleFilter}
            />
          </div>
          <div className="w-full sm:w-40">
            <Dropdown
              options={['All statuses', 'Active', 'Pending', 'Suspended', 'Archived']}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
        <Button variant="primary" size="sm" icon={Plus} className="w-full sm:w-auto" onClick={openAdd}>
          Add user
        </Button>
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block">
        <div className="overflow-x-auto lss-scrollbar">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSelf = u.id === currentUser.id
                const isTrainee = u.role === 'Trainee'
                return (
                  <tr key={u.id} className={cn('border-t border-neutral-100 transition-colors hover:bg-neutral-50', u.status === 'archived' && 'text-neutral-400')}>
                    <td className={cn('px-4 py-2.5 font-medium', u.status === 'archived' ? 'text-neutral-400' : 'text-ink')}>
                      <div className="flex items-center gap-1.5">
                        {u.name}
                        {isSelf && <span className="rounded-pill bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">You</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{u.email}</td>
                    <td className="px-4 py-2.5 text-neutral-600">
                      <span className="inline-flex items-center gap-1">
                        {u.role === 'Administrator' && <ShieldCheck size={12} className="text-brand-500" />}
                        {u.role}
                      </span>
                      {isTrainee && <span className="ml-1.5 text-[10px] text-neutral-400">(auto-created)</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <RowMenu
                        actions={[
                          { label: 'Edit user', icon: Pencil, disabled: isTrainee, onClick: () => openEdit(u) },
                          { label: 'Reset password', icon: KeyRound, onClick: () => setPending({ type: 'reset', user: u }) },
                          u.status === 'suspended'
                            ? { label: 'Reactivate', icon: CheckCircle2, onClick: () => setPending({ type: 'reactivate', user: u }) }
                            : {
                                label: 'Suspend',
                                icon: Ban,
                                disabled: isSelf || u.status === 'archived',
                                onClick: () => setPending({ type: 'suspend', user: u }),
                              },
                          u.status === 'archived'
                            ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setPending({ type: 'restore', user: u }) }
                            : { label: 'Archive', icon: Archive, disabled: isSelf, onClick: () => setPending({ type: 'archive', user: u }) },
                          {
                            label: 'Delete',
                            icon: Trash2,
                            danger: true,
                            disabled: isSelf,
                            onClick: () => setPending({ type: 'delete', user: u }),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">
                    No users match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 sm:hidden">
        {filtered.map((u) => {
          const isSelf = u.id === currentUser.id
          const isTrainee = u.role === 'Trainee'
          return (
            <div key={u.id} className={cn('rounded-lg border border-neutral-200 bg-white p-3.5', u.status === 'archived' && 'opacity-60')}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-ink">{u.name}</span>
                    {isSelf && <span className="shrink-0 rounded-pill bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">You</span>}
                  </div>
                  <p className="truncate text-xs text-neutral-500">{u.email}</p>
                </div>
                <RowMenu
                  actions={[
                    { label: 'Edit user', icon: Pencil, disabled: isTrainee, onClick: () => openEdit(u) },
                    { label: 'Reset password', icon: KeyRound, onClick: () => setPending({ type: 'reset', user: u }) },
                    u.status === 'suspended'
                      ? { label: 'Reactivate', icon: CheckCircle2, onClick: () => setPending({ type: 'reactivate', user: u }) }
                      : { label: 'Suspend', icon: Ban, disabled: isSelf || u.status === 'archived', onClick: () => setPending({ type: 'suspend', user: u }) },
                    u.status === 'archived'
                      ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setPending({ type: 'restore', user: u }) }
                      : { label: 'Archive', icon: Archive, disabled: isSelf, onClick: () => setPending({ type: 'archive', user: u }) },
                    { label: 'Delete', icon: Trash2, danger: true, disabled: isSelf, onClick: () => setPending({ type: 'delete', user: u }) },
                  ]}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                <span className="inline-flex items-center gap-1">
                  {u.role === 'Administrator' && <ShieldCheck size={12} className="text-brand-500" />}
                  {u.role}
                  {isTrainee && <span className="ml-1 text-[10px] text-neutral-400">(auto-created)</span>}
                </span>
                <StatusBadge status={u.status} />
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
            No users match your search or filters.
          </div>
        )}
      </div>

      <AddUserModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />

      {pending && (
        <ConfirmDialog
          open={!!pending}
          onClose={() => setPending(null)}
          onConfirm={runConfirmed}
          title={dialogCopy[pending.type].title}
          description={dialogCopy[pending.type].description(pending.user)}
          confirmLabel={dialogCopy[pending.type].confirmLabel}
          tone={dialogCopy[pending.type].tone}
          confirmDisabled={pending.type === 'delete' && isLastActiveAdmin(pending.user)}
        />
      )}
    </div>
  )
}
