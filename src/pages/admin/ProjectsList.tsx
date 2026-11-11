import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Copy, Eye, Link2, Pencil, Plus, Search, Star, Trash } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { reorder, useSave } from '../../hooks/useSave'
import { STATUS_LABELS, type Project } from '../../lib/types'
import { byOrder, cn, copyText, projectUrl, uid } from '../../lib/utils'
import { useSite } from '../../store/siteStore'
import { Badge, ConfirmDialog, OrderButtons, PageHeader } from '../../components/admin/ui'
import { ProjectVisual } from '../../components/ProjectVisual'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'featured', label: 'Featured' },
] as const

export default function ProjectsList() {
  const site = useSite()
  const save = useSave()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const filter = (params.get('filter') ?? 'all') as (typeof FILTERS)[number]['id']
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [toDelete, setToDelete] = useState<Project | null>(null)

  const ordered = useMemo(() => [...site.projects].sort(byOrder), [site.projects])
  const categoryName = (id: string) => site.categories.find((category) => category.id === id)?.name
  const filtered = !(filter === 'all' && !q.trim() && !categoryId)

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return ordered.filter((p) => {
      if (filter === 'published' && !p.published) return false
      if (filter === 'drafts' && p.published) return false
      if (filter === 'featured' && !p.featured) return false
      if (categoryId && !p.categoryIds.includes(categoryId)) return false
      if (term && !`${p.title} ${p.slug} ${p.summary}`.toLowerCase().includes(term)) return false
      return true
    })
  }, [ordered, filter, q, categoryId])

  const patch = (p: Project, change: Partial<Project>, message: string) =>
    save((d) => ({ ...d, projects: d.projects.map((x) => (x.id === p.id ? { ...x, ...change, updatedAt: Date.now() } : x)) }), message)

  const move = (from: number, to: number) => save((d) => ({ ...d, projects: reorder([...d.projects].sort(byOrder), from, to) }))

  const duplicate = (p: Project) => {
    const slugs = new Set(site.projects.map((x) => x.slug))
    let slug = `${p.slug}-copy`
    for (let n = 2; slugs.has(slug); n++) slug = `${p.slug}-copy-${n}`
    const now = Date.now()
    const copy: Project = { ...p, id: uid('p'), slug, title: `${p.title} (copy)`, published: false, featured: false, order: site.projects.length + 1, createdAt: now, updatedAt: now }
    save((d) => ({ ...d, projects: [...d.projects, copy] }), `Copied as a draft: “${copy.title}”.`)
  }

  const copyLink = async (p: Project) => {
    if (!p.published) {
      toast('Publish this app before sharing its link.', 'info')
      return
    }
    const ok = await copyText(projectUrl(p.slug))
    toast(ok ? 'App link copied. It works for visitors once you publish the site.' : 'Copy failed. Open the app page and copy the address.', ok ? 'success' : 'error')
  }

  const remove = () => {
    if (!toDelete) return
    if (save((d) => ({ ...d, projects: d.projects.filter((x) => x.id !== toDelete.id).sort(byOrder).map((x, i) => ({ ...x, order: i + 1 })) }), `Deleted “${toDelete.title}”.`)) setToDelete(null)
  }

  const actions = (p: Project) => (
    <div className="flex items-center justify-end gap-0.5">
      <button
        type="button"
        className={cn('btn btn-ghost btn-icon size-9 min-h-9', p.featured && 'text-accent-text')}
        onClick={() => patch(p, { featured: !p.featured }, p.featured ? 'Removed from featured.' : 'Marked as featured.')}
        aria-label={p.featured ? `Remove ${p.title} from featured` : `Feature ${p.title}`}
        aria-pressed={p.featured}
        title={p.featured ? 'Featured (shown first)' : 'Mark as featured'}
      >
        <Star className="size-4" fill={p.featured ? 'currentColor' : 'none'} />
      </button>
      <button type="button" className="btn btn-ghost btn-icon size-9 min-h-9" onClick={() => copyLink(p)} aria-label={`Copy link to ${p.title}`} title="Copy share link">
        <Link2 className="size-4" />
      </button>
      <Link to={`/work/${p.slug}?preview=1`} target="_blank" className="btn btn-ghost btn-icon size-9 min-h-9" aria-label={`Preview ${p.title}`} title="Preview">
        <Eye className="size-4" />
      </Link>
      <button type="button" className="btn btn-ghost btn-icon size-9 min-h-9" onClick={() => duplicate(p)} aria-label={`Duplicate ${p.title}`} title="Duplicate">
        <Copy className="size-4" />
      </button>
      <Link to={`/admin/projects/${p.id}`} className="btn btn-ghost btn-icon size-9 min-h-9" aria-label={`Edit ${p.title}`} title="Edit">
        <Pencil className="size-4" />
      </Link>
      <button type="button" className="btn btn-ghost btn-icon size-9 min-h-9 text-danger" onClick={() => setToDelete(p)} aria-label={`Delete ${p.title}`} title="Delete">
        <Trash className="size-4" />
      </button>
    </div>
  )

  const toggle = (p: Project) => (
    <button
      type="button"
      role="switch"
      aria-checked={p.published}
      aria-label={p.published ? `Unpublish ${p.title}` : `Publish ${p.title}`}
      onClick={() => patch(p, { published: !p.published }, p.published ? 'Moved to drafts.' : 'Published.')}
      className="flex items-center gap-2 text-xs font-semibold text-ink-muted"
    >
      <span className={cn('relative h-6 w-10 rounded-full border transition-colors', p.published ? 'border-accent bg-accent' : 'border-line-strong bg-surface-2')}>
        <span className={cn('absolute left-0 top-0.5 size-[18px] rounded-full bg-white shadow transition-transform', p.published ? 'translate-x-[18px]' : 'translate-x-0.5')} />
      </span>
      {p.published ? 'Published' : 'Draft'}
    </button>
  )

  return (
    <>
      <PageHeader
        title="Apps"
        description="Add, edit and remove the apps in your portfolio. Use the arrows to change the order; featured apps are shown first."
        actions={
          <Link to="/admin/projects/new" className="btn btn-primary">
            <Plus className="size-4" aria-hidden="true" />
            Add app
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-line p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setParams(f.id === 'all' ? {} : { filter: f.id }, { replace: true })}
              className={cn('shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold', filter === f.id ? 'bg-accent text-on-accent' : 'text-ink-muted hover:text-ink')}
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative flex-1">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
          <input className="input pl-9" type="search" placeholder="Search projects" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label>
          <span className="sr-only">Category</span>
          <select className="input lg:w-60" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">All categories</option>
            {[...site.categories].sort(byOrder).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {list.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p className="font-bold text-ink">{site.projects.length === 0 ? 'No projects yet' : 'No projects match these filters'}</p>
          <p className="text-sm text-ink-muted">{site.projects.length === 0 ? 'Add your first app to show it in the portfolio.' : 'Try another filter or clear the search.'}</p>
          <Link to="/admin/projects/new" className="btn btn-primary mt-2">
            Add app
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((p) => {
            const index = ordered.findIndex((x) => x.id === p.id)
            return (
              <li key={p.id} className="card flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {!filtered && <OrderButtons index={index} count={ordered.length} onMove={move} label={p.title} />}
                  <Link to={`/admin/projects/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-lg border border-line">
                      <ProjectVisual project={p} width={200} compact />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink hover:text-accent-text">{p.title}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
                        <span className="truncate">{categoryName(p.categoryIds[0] ?? '') ?? 'No category'}</span>
                        {p.status !== 'completed' && <Badge tone="accent">{STATUS_LABELS[p.status]}</Badge>}
                        {p.featured && <Badge tone="info">Featured</Badge>}
                      </span>
                    </span>
                  </Link>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-line pt-3 md:border-0 md:pt-0">
                  {toggle(p)}
                  {actions(p)}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {filtered && list.length > 0 && <p className="mt-3 text-xs text-ink-faint">Clear the filters to change the order.</p>}

      {toDelete && (
        <ConfirmDialog
          title="Delete this app?"
          message={
            <>
              <span className="font-semibold text-ink">{toDelete.title}</span> will be removed. To hide it instead, move it to drafts.
            </>
          }
          confirmLabel="Delete app"
          onConfirm={remove}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  )
}
