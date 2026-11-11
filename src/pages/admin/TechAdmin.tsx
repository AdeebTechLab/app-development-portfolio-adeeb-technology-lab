import { useMemo, useState, type FormEvent } from 'react'
import { Eye, EyeOff, Pencil, Plus, Trash } from 'lucide-react'
import { reorder, useSave } from '../../hooks/useSave'
import { TECH_GROUPS, type Technology } from '../../lib/types'
import { byOrder, uid } from '../../lib/utils'
import { useSite } from '../../store/siteStore'
import { ConfirmDialog, Field, Modal, OrderButtons, PageHeader, Switch } from '../../components/admin/ui'
import { TECH_ICONS, TechIcon } from '../../components/TechIcon'

export default function TechAdmin() {
  const site = useSite()
  const save = useSave()
  const techs = useMemo(() => [...site.technologies].sort(byOrder), [site.technologies])
  const groups = useMemo(() => {
    const names = [...TECH_GROUPS, ...new Set(techs.map((t) => t.group).filter((g) => !(TECH_GROUPS as readonly string[]).includes(g)))]
    return names.map((g) => ({ name: g, items: techs.filter((t) => t.group === g) }))
  }, [techs])
  const [editing, setEditing] = useState<Technology | { group: string } | null>(null)
  const [deleting, setDeleting] = useState<Technology | null>(null)

  // reorder within a group, keeping the overall order list consistent
  const move = (group: string, from: number, to: number) =>
    save((d) => {
      const all = [...d.technologies].sort(byOrder)
      const inGroup = all.filter((t) => t.group === group)
      const moved = reorder(inGroup, from, to)
      const queue = [...moved]
      const merged = all.map((t) => (t.group === group ? queue.shift()! : t))
      return { ...d, technologies: merged.map((t, i) => ({ ...t, order: i + 1 })) }
    })

  const toggle = (t: Technology) => save((d) => ({ ...d, technologies: d.technologies.map((x) => (x.id === t.id ? { ...x, showOnSite: !x.showOnSite } : x)) }))

  const remove = () => {
    if (!deleting) return
    if (save((d) => ({ ...d, technologies: d.technologies.filter((t) => t.id !== deleting.id) }), `Deleted “${deleting.name}”.`)) setDeleting(null)
  }

  return (
    <>
      <PageHeader
        title="Technology stack"
        description="The tools and technologies shown in the “Technologies we use” section. Projects that list the same names show their logos."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setEditing({ group: TECH_GROUPS[0] })}>
            <Plus className="size-4" aria-hidden="true" />
            Add technology
          </button>
        }
      />
      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.name} className="card p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-bold text-ink">{g.name}</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing({ group: g.name })}>
                <Plus className="size-4" aria-hidden="true" />
                Add
              </button>
            </div>
            {g.items.length === 0 ? (
              <p className="text-sm text-ink-faint">Nothing in this group yet. Empty groups are hidden on the website.</p>
            ) : (
              <ul className="divide-y divide-line">
                {g.items.map((t, i) => (
                  <li key={t.id} className="flex items-center gap-3 py-2.5">
                    <OrderButtons index={i} count={g.items.length} onMove={(from, to) => move(g.name, from, to)} label={t.name} />
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-page-deep">
                      <TechIcon icon={t.icon} name={t.name} color className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-ink">
                      {t.name}
                      {!t.showOnSite && <span className="ml-2 text-xs font-normal text-ink-faint">Hidden</span>}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon size-9 min-h-9"
                      onClick={() => toggle(t)}
                      aria-label={t.showOnSite ? `Hide ${t.name}` : `Show ${t.name}`}
                      title={t.showOnSite ? 'Shown on the website' : 'Hidden from the website'}
                    >
                      {t.showOnSite ? <Eye className="size-4 text-success" /> : <EyeOff className="size-4" />}
                    </button>
                    <button type="button" className="btn btn-ghost btn-icon size-9 min-h-9" onClick={() => setEditing(t)} aria-label={`Edit ${t.name}`}>
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" className="btn btn-ghost btn-icon size-9 min-h-9 text-danger" onClick={() => setDeleting(t)} aria-label={`Delete ${t.name}`}>
                      <Trash className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {editing && <TechDialog tech={'id' in editing ? editing : null} group={'id' in editing ? editing.group : editing.group} groups={groups.map((g) => g.name)} nextOrder={techs.length + 1} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog title="Delete this technology?" message={<><span className="font-semibold text-ink">{deleting.name}</span> will be removed from the technology stack.</>} confirmLabel="Delete" onConfirm={remove} onCancel={() => setDeleting(null)} />
      )}
    </>
  )
}

function TechDialog({ tech, group, groups, nextOrder, onClose }: { tech: Technology | null; group: string; groups: string[]; nextOrder: number; onClose: () => void }) {
  const save = useSave()
  const [name, setName] = useState(tech?.name ?? '')
  const [grp, setGrp] = useState(group)
  const [newGroup, setNewGroup] = useState('')
  const [icon, setIcon] = useState(tech?.icon ?? '')
  const [show, setShow] = useState(tech?.showOnSite ?? true)
  const [error, setError] = useState('')
  const iconKeys = useMemo(() => Object.keys(TECH_ICONS).sort((a, b) => TECH_ICONS[a]!.title.localeCompare(TECH_ICONS[b]!.title)), [])

  const onName = (v: string) => {
    setName(v)
    if (!tech && !icon) {
      const match = iconKeys.find((k) => TECH_ICONS[k]!.title.toLowerCase() === v.trim().toLowerCase())
      if (match) setIcon(match)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Add a name.')
    const finalGroup = grp === '__new' ? newGroup.trim() : grp
    if (!finalGroup) return setError('Name the new group.')
    const item: Technology = { id: tech?.id ?? uid('tech'), name: name.trim(), group: finalGroup, icon, showOnSite: show, order: tech?.order ?? nextOrder }
    const ok = save((d) => ({ ...d, technologies: tech ? d.technologies.map((t) => (t.id === tech.id ? item : t)) : [...d.technologies, item] }), tech ? 'Saved.' : 'Technology added.')
    if (ok) onClose()
  }

  return (
    <Modal title={tech ? 'Edit technology' : 'Add a technology'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Name" required htmlFor="t-name">
          <input id="t-name" className="input" value={name} onChange={(e) => onName(e.target.value)} placeholder="React" />
        </Field>
        <Field label="Group" required htmlFor="t-group">
          <select id="t-group" className="input" value={grp} onChange={(e) => setGrp(e.target.value)}>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
            <option value="__new">New group…</option>
          </select>
        </Field>
        {grp === '__new' && (
          <Field label="New group name" required htmlFor="t-newgroup">
            <input id="t-newgroup" className="input" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="Mobile" />
          </Field>
        )}
        <Field label="Logo" htmlFor="t-icon" hint="Choose “No logo” to show the initials instead.">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-page-deep">
              <TechIcon icon={icon} name={name || '?'} color className="size-6" />
            </span>
            <select id="t-icon" className="input" value={icon} onChange={(e) => setIcon(e.target.value)}>
              <option value="">No logo</option>
              {iconKeys.map((k) => (
                <option key={k} value={k}>
                  {TECH_ICONS[k]!.title}
                </option>
              ))}
            </select>
          </div>
        </Field>
        <Switch checked={show} onChange={setShow} label="Show on the website" />
        {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {tech ? 'Save changes' : 'Add technology'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
