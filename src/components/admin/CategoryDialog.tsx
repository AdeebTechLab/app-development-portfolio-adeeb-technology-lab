import { useState, type FormEvent } from 'react'
import { useSave } from '../../hooks/useSave'
import type { ProjectCategory } from '../../lib/types'
import { isValidSlug, slugify, uid } from '../../lib/utils'
import { Field, Modal } from './ui'
import { SERVICE_ICONS, ServiceIcon } from '../ServiceIcon'

export function CategoryDialog({
  categories,
  onClose,
  onSaved,
}: {
  categories: ProjectCategory[]
  onClose: () => void
  onSaved: (category: ProjectCategory) => void
}) {
  const save = useSave()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('globe')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const finalSlug = slugify(slug || name)
    if (!name.trim()) return setError('Add a name.')
    if (!isValidSlug(finalSlug)) return setError('The link name can only use lowercase letters, numbers and hyphens.')
    if (categories.some((category) => category.slug === finalSlug)) return setError('Another category already uses that link name.')
    const category: ProjectCategory = {
      id: uid('cat'),
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      icon,
      order: categories.length + 1,
    }
    const ok = save((d) => ({ ...d, categories: [...d.categories, category] }), 'Category added.')
    if (ok) {
      onSaved(category)
      onClose()
    }
  }

  return (
    <Modal title="Add category" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Name" required htmlFor="cat-name">
          <input
            id="cat-name"
            className="input"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (!slugTouched) setSlug(slugify(e.target.value))
            }}
            placeholder="Education apps"
          />
        </Field>
        <Field label="Link name" required htmlFor="cat-slug" hint={`Used in links like /work?category=${slug || 'name'}`}>
          <input
            id="cat-slug"
            className="input"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
            }}
          />
        </Field>
        <Field label="Short description" htmlFor="cat-desc" counter={{ value: description.length, max: 140 }}>
          <textarea id="cat-desc" className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Icon" required htmlFor="cat-icon">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">
              <ServiceIcon name={icon} />
            </span>
            <select id="cat-icon" className="input" value={icon} onChange={(e) => setIcon(e.target.value)}>
              {Object.entries(SERVICE_ICONS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
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
            Add category
          </button>
        </div>
      </form>
    </Modal>
  )
}
