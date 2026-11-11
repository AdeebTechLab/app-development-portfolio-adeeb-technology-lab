import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Search, X } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import { useWhatsApp } from '../hooks/useWhatsApp'
import { useSeo } from '../lib/seo'
import { PLATFORM_LABELS, PLATFORMS, STATUS_LABELS, type Platform, type ProjectStatus } from '../lib/types'
import { cn } from '../lib/utils'
import { CallToAction } from '../components/CallToAction'
import { ProjectCard } from '../components/ProjectCard'

export default function Work() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const categorySlug = params.get('category') ?? params.get('service') ?? ''
  const status = (params.get('status') ?? '') as ProjectStatus | ''
  const platform = (params.get('platform') ?? '') as Platform | ''
  const { projects, categories, categoryById, categoryBySlug, serviceById, serviceBySlug, clientById } = useContent()
  const wa = useWhatsApp()
  const active = categoryBySlug.get(categorySlug)
  const legacyService = !params.has('category') ? serviceBySlug.get(params.get('service') ?? '') : undefined
  const activeName = active?.name ?? legacyService?.name

  useSeo({
    title: active ? `${active.name}` : legacyService ? `${legacyService.name} apps` : 'Our apps',
    description: active ? `${active.name} by Adeeb Technology Lab. ${active.description}` : legacyService ? `${legacyService.name} by Adeeb Technology Lab. ${legacyService.description}` : 'Android, iOS and cross-platform apps built by Adeeb Technology Lab.',
    path: '/work',
  })

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'category') next.delete('service')
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const usedCategories = useMemo(() => categories.filter((category) => projects.some((p) => p.categoryIds.includes(category.id))), [categories, projects])
  const usedPlatforms = useMemo(() => PLATFORMS.filter((pl) => projects.some((p) => p.platforms.includes(pl))), [projects])
  const usedStatuses = useMemo(() => (Object.keys(STATUS_LABELS) as ProjectStatus[]).filter((s) => projects.some((p) => p.status === s)), [projects])

  const results = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return projects.filter((p) => {
      if (active && !p.categoryIds.includes(active.id)) return false
      if (legacyService && !p.serviceIds.includes(legacyService.id)) return false
      if (status && p.status !== status) return false
      if (platform && !p.platforms.includes(platform)) return false
      if (!words.length) return true
      const hay = [
        p.title,
        p.summary,
        p.description,
        clientById.get(p.clientId)?.name ?? '',
        p.technologies.join(' '),
        p.platforms.map((pl) => PLATFORM_LABELS[pl]).join(' '),
        p.features.join(' '),
        p.categoryIds.map((id) => categoryById.get(id)?.name ?? '').join(' '),
        p.serviceIds.map((id) => serviceById.get(id)?.name ?? '').join(' '),
      ]
        .join(' ')
        .toLowerCase()
      return words.every((w) => hay.includes(w))
    })
  }, [projects, q, active, legacyService, status, platform, categoryById, serviceById, clientById])

  const filtering = Boolean(q || categorySlug || status || platform)

  return (
    <>
      <section className="container-x pb-6 pt-10 md:pt-14">
        <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">{active?.name ?? legacyService?.name ?? 'Our apps'}</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{active?.description ?? legacyService?.description ?? 'Android, iOS and cross-platform apps we have built for clients and for our own platforms.'}</p>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search projects</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <input type="search" value={q} onChange={(e) => update('q', e.target.value)} placeholder="Search by app name, client, platform or technology" className="input pl-10" />
          </label>
          {usedPlatforms.length > 1 && (
            <label>
              <span className="sr-only">Platform</span>
              <select className="input md:w-48" value={platform} onChange={(e) => update('platform', e.target.value)}>
                <option value="">Any platform</option>
                {usedPlatforms.map((pl) => (
                  <option key={pl} value={pl}>
                    {PLATFORM_LABELS[pl]}
                  </option>
                ))}
              </select>
            </label>
          )}
          {usedStatuses.length > 1 && (
            <label>
              <span className="sr-only">Status</span>
              <select className="input md:w-48" value={status} onChange={(e) => update('status', e.target.value)}>
                <option value="">Any status</option>
                {usedStatuses.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {usedCategories.length > 0 && (
          <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Categories">
            {[{ id: '', slug: '', name: 'All' }, ...usedCategories].map((category) => {
              const on = category.slug ? active?.slug === category.slug : !categorySlug
              const count = category.slug ? projects.filter((p) => p.categoryIds.includes(category.id)).length : projects.length
              return (
                <button
                  key={category.slug || 'all'}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update('category', category.slug)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                    on ? 'border-accent bg-accent text-on-accent' : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  {category.name}
                  <span className={cn('text-xs', on ? 'text-on-accent/70' : 'text-ink-faint')}>{count}</span>
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-6 flex min-h-8 flex-wrap items-center justify-between gap-3 text-sm text-ink-muted" aria-live="polite">
          <p>
            Showing {results.length} of {projects.length} apps
          </p>
          {filtering && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setParams({}, { replace: true })}>
              <X className="size-4" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      </section>

      <section className="container-x">
        {results.length === 0 ? (
          <div className="card flex flex-col items-center gap-4 px-6 py-14 text-center">
            <p className="text-lg font-bold text-ink">{projects.length === 0 ? 'New apps are being added.' : 'No apps match these filters yet.'}</p>
            <p className="max-w-md text-sm text-ink-muted">
              {activeName ? `Need ${activeName.toLowerCase()}? ` : ''}Message us on WhatsApp and we’ll share examples that match what you need.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {filtering && (
                <button type="button" className="btn btn-outline" onClick={() => setParams({}, { replace: true })}>
                  Clear filters
                </button>
              )}
              <a className="btn btn-whatsapp" href={wa.link(`Hi, I'm looking for help with ${active?.name ?? legacyService?.name ?? (q || 'a mobile app')}.`)} target="_blank" rel="noopener noreferrer">
                Ask on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <ProjectCard key={p.id} project={p} category={categoryById.get(p.categoryIds[0] ?? '')} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-20">
        <CallToAction title="Want an app like these?" />
      </div>
    </>
  )
}
