import { useMemo } from 'react'
import { Link } from 'react-router'
import { Briefcase, Cpu, Eye, EyeOff, FilePen, Globe, Layers, Plus, Star } from 'lucide-react'
import { formatBytes, formatDateTime } from '../../lib/utils'
import { STORAGE_LIMIT, differsFromPublished, storageUsed, useHasLocalChanges, useSite } from '../../store/siteStore'
import { PageHeader } from '../../components/admin/ui'
import { ProjectVisual } from '../../components/ProjectVisual'
import { cn } from '../../lib/utils'

export function StorageMeter() {
  const site = useSite()
  const used = storageUsed(site)
  const pct = Math.min(100, Math.round((used / STORAGE_LIMIT) * 100))
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold text-ink">Browser storage</span>
        <span className="text-ink-faint">
          {formatBytes(used)} of about {formatBytes(STORAGE_LIMIT)}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Browser storage used">
        <div className={cn('h-full rounded-full', pct > 85 ? 'bg-danger' : pct > 60 ? 'bg-accent' : 'bg-success')} style={{ width: `${Math.max(2, pct)}%` }} />
      </div>
      {pct > 60 && <p className="mt-2 text-xs text-ink-muted">Uploaded images use the most space. Use image links for large images.</p>}
    </div>
  )
}

export default function Dashboard() {
  const site = useSite()
  const hasLocal = useHasLocalChanges()
  const unpublished = hasLocal && differsFromPublished(site)

  const stats = useMemo(
    () => [
      { label: 'Published apps', value: site.projects.filter((p) => p.published).length, icon: Globe, to: '/admin/projects?filter=published' },
      { label: 'Drafts', value: site.projects.filter((p) => !p.published).length, icon: FilePen, to: '/admin/projects?filter=drafts' },
      { label: 'Featured', value: site.projects.filter((p) => p.featured).length, icon: Star, to: '/admin/projects?filter=featured' },
      { label: 'Services', value: site.services.length, icon: Layers, to: '/admin/services' },
      { label: 'Clients', value: site.clients.length, icon: Briefcase, to: '/admin/clients' },
      { label: 'Technologies', value: site.technologies.length, icon: Cpu, to: '/admin/technologies' },
    ],
    [site],
  )
  const recent = useMemo(() => [...site.projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5), [site.projects])
  const category = (id: string) => site.categories.find((item) => item.id === id)?.name

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Manage everything in your app portfolio: apps, services, clients, technologies and site content."
        actions={
          <Link to="/admin/projects/new" className="btn btn-primary">
            <Plus className="size-4" aria-hidden="true" />
            Add app
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to} className="card flex flex-col gap-3 p-5 transition-colors hover:border-accent/60">
            <Icon className="size-5 text-accent-text" aria-hidden="true" />
            <span className="text-3xl font-extrabold text-ink">{value}</span>
            <span className="text-sm text-ink-muted">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Recently updated apps</h2>
            <Link to="/admin/projects" className="text-sm font-semibold text-accent-text hover:underline">
              All apps
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No apps yet. Add your first one.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/projects/${p.id}`} className="flex items-center gap-4 py-3 hover:text-accent-text">
                    <span className="aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-lg border border-line">
                      <ProjectVisual project={p} width={160} compact />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{p.title}</span>
                      <span className="block truncate text-xs text-ink-faint">
                        {category(p.categoryIds[0] ?? '') ?? 'No category'}
                        {p.updatedAt ? `, updated ${formatDateTime(p.updatedAt)}` : ''}
                      </span>
                    </span>
                    {p.published ? <Eye className="size-4 shrink-0 text-success" aria-label="Published" /> : <EyeOff className="size-4 shrink-0 text-ink-faint" aria-label="Draft" />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className={cn('card p-5 sm:p-6', unpublished && 'border-accent/60')}>
            <h2 className="text-lg font-bold text-ink">Publishing</h2>
            <p className="mt-2 text-sm text-ink-muted">
              {unpublished
                ? 'You have changes saved in this browser that visitors can’t see yet.'
                : 'Everything you see here is what visitors see on the portfolio.'}
            </p>
            <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-ink-muted">
              <li>Make your changes here. They save automatically.</li>
              <li>Download the publish file.</li>
              <li>Replace src/data/site-data.json in the project and redeploy.</li>
            </ol>
            <Link to="/admin/publish" className={cn('btn mt-5 w-full', unpublished ? 'btn-primary' : 'btn-outline')}>
              {unpublished ? 'Publish changes' : 'Publish & backup'}
            </Link>
          </section>
          <section className="card p-5 sm:p-6">
            <StorageMeter />
          </section>
        </div>
      </div>
    </>
  )
}
