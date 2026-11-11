import { useMemo, useState, type FormEvent } from 'react'
import { Eye, EyeOff, Pencil, Plus, Quote, Trash } from 'lucide-react'
import { reorder, useSave } from '../../hooks/useSave'
import type { Client } from '../../lib/types'
import { byOrder, img, safeUrl, uid } from '../../lib/utils'
import { useSite } from '../../store/siteStore'
import { RoundImageInput } from '../../components/admin/ImageInputs'
import { Badge, ConfirmDialog, Field, Modal, OrderButtons, PageHeader, Switch } from '../../components/admin/ui'

function Logo({ client }: { client: Client }) {
  const [failed, setFailed] = useState(false)
  const initials = client.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  return (
    <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-white p-1 ring-2 ring-line-strong">
      {client.logo && !failed ? (
        <img src={img(client.logo, 120)} alt="" className="h-full w-full object-contain" onError={() => setFailed(true)} />
      ) : (
        <span className="text-sm font-extrabold text-[#a35700]">{initials}</span>
      )}
    </span>
  )
}

export default function ClientsAdmin() {
  const site = useSite()
  const save = useSave()
  const clients = useMemo(() => [...site.clients].sort(byOrder), [site.clients])
  const [editing, setEditing] = useState<Client | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Client | null>(null)
  const projectCount = (id: string) => site.projects.filter((p) => p.clientId === id).length

  const move = (from: number, to: number) => save((d) => ({ ...d, clients: reorder([...d.clients].sort(byOrder), from, to) }))

  const toggle = (c: Client) =>
    save((d) => ({ ...d, clients: d.clients.map((x) => (x.id === c.id ? { ...x, showOnSite: !x.showOnSite } : x)) }), c.showOnSite ? 'Hidden from the website.' : 'Shown on the website.')

  const remove = () => {
    if (!deleting) return
    const ok = save(
      (d) => ({
        ...d,
        clients: d.clients.filter((c) => c.id !== deleting.id).sort(byOrder).map((c, i) => ({ ...c, order: i + 1 })),
        projects: d.projects.map((p) => (p.clientId === deleting.id ? { ...p, clientId: '' } : p)),
      }),
      `Deleted “${deleting.name}”.`,
    )
    if (ok) setDeleting(null)
  }

  return (
    <>
      <PageHeader
        title="Clients"
        description="Clients and organisations you have worked with. They appear in the Clients section, and you can link them to projects."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden="true" />
            Add client
          </button>
        }
      />
      {clients.length === 0 ? (
        <div className="card px-6 py-12 text-center text-sm text-ink-muted">No clients yet. Add the businesses you have built apps for.</div>
      ) : (
        <ul className="space-y-3">
          {clients.map((c, i) => {
            const n = projectCount(c.id)
            return (
              <li key={c.id} className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <OrderButtons index={i} count={clients.length} onMove={move} label={c.name} />
                  <Logo client={c} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{c.name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
                      {c.industry && <span>{c.industry}</span>}
                      {n > 0 && (
                        <span>
                          {n} {n === 1 ? 'app' : 'apps'}
                        </span>
                      )}
                      {c.testimonial && (
                        <Badge tone="accent">
                          <Quote className="size-3" aria-hidden="true" />
                          Testimonial
                        </Badge>
                      )}
                      {!c.showOnSite && <Badge>Hidden</Badge>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-0.5 border-t border-line pt-2 sm:border-0 sm:pt-0">
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon size-9 min-h-9"
                    onClick={() => toggle(c)}
                    aria-label={c.showOnSite ? `Hide ${c.name} from the website` : `Show ${c.name} on the website`}
                    title={c.showOnSite ? 'Shown on the website' : 'Hidden from the website'}
                  >
                    {c.showOnSite ? <Eye className="size-4 text-success" /> : <EyeOff className="size-4" />}
                  </button>
                  <button type="button" className="btn btn-ghost btn-icon size-9 min-h-9" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
                    <Pencil className="size-4" />
                  </button>
                  <button type="button" className="btn btn-ghost btn-icon size-9 min-h-9 text-danger" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}>
                    <Trash className="size-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editing && <ClientDialog client={editing === 'new' ? null : editing} nextOrder={clients.length + 1} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete this client?"
          message={
            <>
              <span className="font-semibold text-ink">{deleting.name}</span> will be deleted
              {projectCount(deleting.id) > 0 ? ` and removed from ${projectCount(deleting.id)} project(s)` : ''}.
            </>
          }
          confirmLabel="Delete client"
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}

function ClientDialog({ client, nextOrder, onClose }: { client: Client | null; nextOrder: number; onClose: () => void }) {
  const save = useSave()
  const [form, setForm] = useState({
    name: client?.name ?? '',
    logo: client?.logo ?? '',
    website: client?.website ?? '',
    industry: client?.industry ?? '',
    showOnSite: client?.showOnSite ?? true,
    quote: client?.testimonial?.quote ?? '',
    author: client?.testimonial?.author ?? '',
    role: client?.testimonial?.role ?? '',
  })
  const [error, setError] = useState('')
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Add the client’s name.')
    if (form.website.trim() && !safeUrl(form.website)) return setError('Enter a full website link, for example https://example.com')
    const item: Client = {
      id: client?.id ?? uid('client'),
      name: form.name.trim(),
      logo: form.logo,
      website: safeUrl(form.website),
      industry: form.industry.trim(),
      showOnSite: form.showOnSite,
      testimonial: form.quote.trim() ? { quote: form.quote.trim(), author: form.author.trim(), role: form.role.trim() } : null,
      order: client?.order ?? nextOrder,
    }
    const ok = save((d) => ({ ...d, clients: client ? d.clients.map((c) => (c.id === client.id ? item : c)) : [...d.clients, item] }), client ? 'Client saved.' : 'Client added.')
    if (ok) onClose()
  }

  return (
    <Modal title={client ? 'Edit client' : 'Add a client'} onClose={onClose}>
      <form onSubmit={submit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1" noValidate>
        <Field label="Client name" required htmlFor="cl-name">
          <input id="cl-name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Logo">
          <RoundImageInput value={form.logo} onChange={(v) => set('logo', v)} label="logo" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Industry" htmlFor="cl-industry">
            <input id="cl-industry" className="input" value={form.industry} onChange={(e) => set('industry', e.target.value)} placeholder="Education, Retail…" />
          </Field>
          <Field label="Website" htmlFor="cl-site">
            <input id="cl-site" className="input" inputMode="url" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" />
          </Field>
        </div>
        <Switch checked={form.showOnSite} onChange={(v) => set('showOnSite', v)} label="Show on the website" description="Hidden clients can still be linked to projects." />
        <fieldset className="space-y-3 rounded-xl border border-line p-4">
          <legend className="px-1 text-sm font-semibold text-ink">Testimonial (optional)</legend>
          <p className="text-xs text-ink-faint">Only add words the client actually said and agreed to show.</p>
          <Field label="What they said" htmlFor="cl-quote">
            <textarea id="cl-quote" className="input min-h-20" value={form.quote} onChange={(e) => set('quote', e.target.value)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Person’s name" htmlFor="cl-author">
              <input id="cl-author" className="input" value={form.author} onChange={(e) => set('author', e.target.value)} />
            </Field>
            <Field label="Their role" htmlFor="cl-role">
              <input id="cl-role" className="input" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Owner" />
            </Field>
          </div>
        </fieldset>
        {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {client ? 'Save changes' : 'Add client'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
