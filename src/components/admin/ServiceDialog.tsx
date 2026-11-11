import { useState, type FormEvent } from 'react'
import { useSave } from '../../hooks/useSave'
import type { Service } from '../../lib/types'
import { isValidSlug, slugify, uid } from '../../lib/utils'
import { Field, Modal } from './ui'
import { SERVICE_ICONS, ServiceIcon } from '../ServiceIcon'

export function ServiceDialog({
  service,
  others,
  onClose,
  onSaved,
  itemLabel = 'service',
}: {
  service: Service | null
  others: Service[]
  onClose: () => void
  onSaved?: (service: Service) => void
  itemLabel?: 'service' | 'category'
}) {
  const save = useSave()
  const [name, setName] = useState(service?.name ?? '')
  const [slug, setSlug] = useState(service?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(service))
  const [description, setDescription] = useState(service?.description ?? '')
  const [icon, setIcon] = useState(service?.icon ?? 'globe')
  const [error, setError] = useState('')
  const titleLabel = itemLabel === 'category' ? 'category' : 'service'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const finalSlug = slugify(slug || name)
    if (!name.trim()) return setError('Add a name.')
    if (!isValidSlug(finalSlug)) return setError('The link name can only use lowercase letters, numbers and hyphens.')
    if (others.some((s) => s.slug === finalSlug)) return setError(`Another ${titleLabel} already uses that link name.`)
    const item: Service = {
      id: service?.id ?? uid('svc'),
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      icon,
      order: service?.order ?? others.length + 1,
    }
    const ok = save(
      (d) => ({ ...d, services: service ? d.services.map((s) => (s.id === service.id ? item : s)) : [...d.services, item] }),
      service ? `${titleLabel === 'category' ? 'Category' : 'Service'} saved.` : `${titleLabel === 'category' ? 'Category' : 'Service'} added.`,
    )
    if (ok) {
      onSaved?.(item)
      onClose()
    }
  }

  return (
    <Modal title={service ? `Edit ${titleLabel}` : `Add ${titleLabel}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Name" required htmlFor="s-name">
          <input
            id="s-name"
            className="input"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (!slugTouched) setSlug(slugify(e.target.value))
            }}
            placeholder="Android App Development"
          />
        </Field>
        <Field label="Link name" required htmlFor="s-slug" hint={`Used in links like /work?service=${slug || 'name'}`}>
          <input
            id="s-slug"
            className="input"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
            }}
          />
        </Field>
        <Field label="Short description" htmlFor="s-desc" counter={{ value: description.length, max: 140 }}>
          <textarea id="s-desc" className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Icon" required htmlFor="s-icon">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">
              <ServiceIcon name={icon} />
            </span>
            <select id="s-icon" className="input" value={icon} onChange={(e) => setIcon(e.target.value)}>
              {Object.entries(SERVICE_ICONS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </Field>
        {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {service ? 'Save changes' : `Add ${titleLabel}`}
          </button>
        </div>
      </form>
    </Modal>
  )
}
