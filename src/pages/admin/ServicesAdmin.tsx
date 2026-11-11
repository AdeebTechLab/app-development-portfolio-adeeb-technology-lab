import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash } from 'lucide-react'
import { reorder, useSave } from '../../hooks/useSave'
import type { Service } from '../../lib/types'
import { byOrder } from '../../lib/utils'
import { useSite } from '../../store/siteStore'
import { ConfirmDialog, OrderButtons, PageHeader } from '../../components/admin/ui'
import { ServiceIcon } from '../../components/ServiceIcon'
import { ServiceDialog } from '../../components/admin/ServiceDialog'

export default function ServicesAdmin() {
  const site = useSite()
  const save = useSave()
  const services = useMemo(() => [...site.services].sort(byOrder), [site.services])
  const [editing, setEditing] = useState<Service | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Service | null>(null)
  const count = (id: string) => site.projects.filter((p) => p.serviceIds.includes(id)).length

  const move = (from: number, to: number) => save((d) => ({ ...d, services: reorder([...d.services].sort(byOrder), from, to) }))

  const remove = () => {
    if (!deleting) return
    const ok = save(
      (d) => ({
        ...d,
        services: d.services.filter((s) => s.id !== deleting.id).sort(byOrder).map((s, i) => ({ ...s, order: i + 1 })),
        projects: d.projects.map((p) => ({ ...p, serviceIds: p.serviceIds.filter((x) => x !== deleting.id) })),
      }),
      `Deleted “${deleting.name}”.`,
    )
    if (ok) setDeleting(null)
  }

  return (
    <>
      <PageHeader
        title="Services"
        description="The app development services you offer. They appear in the Services section. App categories are created separately in the app editor."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden="true" />
            Add service
          </button>
        }
      />
      {services.length === 0 ? (
        <div className="card px-6 py-12 text-center text-sm text-ink-muted">No services yet. Add one, such as “Android app development”.</div>
      ) : (
        <ul className="space-y-3">
          {services.map((s, i) => {
            const n = count(s.id)
            return (
              <li key={s.id} className="card flex items-center gap-3 p-3 sm:p-4">
                <OrderButtons index={i} count={services.length} onMove={move} label={s.name} />
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">
                  <ServiceIcon name={s.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{s.name}</p>
                  <p className="truncate text-xs text-ink-faint">
                    {n} {n === 1 ? 'app' : 'apps'}
                    <span className="hidden sm:inline">, {s.description}</span>
                  </p>
                </div>
                <button type="button" className="btn btn-ghost btn-icon size-9 min-h-9" onClick={() => setEditing(s)} aria-label={`Edit ${s.name}`}>
                  <Pencil className="size-4" />
                </button>
                <button type="button" className="btn btn-ghost btn-icon size-9 min-h-9 text-danger" onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`}>
                  <Trash className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {editing && <ServiceDialog service={editing === 'new' ? null : editing} others={services.filter((s) => editing === 'new' || s.id !== editing.id)} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete this service?"
          message={
            count(deleting.id) > 0 ? (
              <>
                <span className="font-semibold text-ink">{deleting.name}</span> will also be removed from {count(deleting.id)} project(s). Their project categories will not be affected.
              </>
            ) : (
              <>
                <span className="font-semibold text-ink">{deleting.name}</span> will be deleted.
              </>
            )
          }
          confirmLabel="Delete service"
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
