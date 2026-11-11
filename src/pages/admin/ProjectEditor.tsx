import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Eye, Plus, Trash } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useSave } from '../../hooks/useSave'
import { PLATFORM_LABELS, PLATFORMS, STATUS_LABELS, type Platform, type Project, type ProjectCategory, type ProjectStatus } from '../../lib/types'
import { byOrder, canonicalJson, cn, isValidSlug, projectUrl, routePath, safeUrl, slugify, uid } from '../../lib/utils'
import { useSite } from '../../store/siteStore'
import { CategoryDialog } from '../../components/admin/CategoryDialog'
import { CoverImageInput, GalleryInput, RoundImageInput } from '../../components/admin/ImageInputs'
import { TagInput } from '../../components/admin/TagInput'
import { ConfirmDialog, Field, Panel, Switch } from '../../components/admin/ui'
import { PlatformIcon } from '../../components/PlatformIcon'
import { ProjectCard } from '../../components/ProjectCard'
import NotFound from '../NotFound'

type Draft = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'order'>

const EMPTY: Draft = {
  slug: '',
  title: '',
  summary: '',
  description: '',
  coverImage: null,
  logo: '',
  gallery: [],
  categoryIds: [],
  serviceIds: [],
  clientId: '',
  technologies: [],
  features: [],
  problem: '',
  solution: '',
  platforms: ['android'],
  playStoreUrl: '',
  appStoreUrl: '',
  liveUrl: '',
  sourceUrl: '',
  extraLinks: [],
  completedAt: '',
  status: 'completed',
  published: false,
  featured: false,
}

function toDraft(p: Project): Draft {
  const copy: Partial<Project> = { ...p }
  delete copy.id
  delete copy.createdAt
  delete copy.updatedAt
  delete copy.order
  return copy as Draft
}

type Errors = Partial<Record<'title' | 'slug' | 'summary' | 'category' | 'platforms' | 'playStoreUrl' | 'appStoreUrl' | 'liveUrl' | 'sourceUrl' | 'extraLinks', string>>

export default function ProjectEditor() {
  const { id } = useParams()
  const site = useSite()
  const project = id ? site.projects.find((p) => p.id === id) : null
  if (id && !project) return <NotFound title="Project not found" text="It may have been deleted. Go back to the projects list." />
  return <Editor key={id ?? 'new'} project={project ?? null} />
}

function Editor({ project }: { project: Project | null }) {
  const site = useSite()
  const save = useSave()
  const toast = useToast()
  const navigate = useNavigate()
  const services = useMemo(() => [...site.services].sort(byOrder), [site.services])
  const categories = useMemo(() => [...site.categories].sort(byOrder), [site.categories])
  const clients = useMemo(() => [...site.clients].sort(byOrder), [site.clients])

  const initial = useMemo(() => (project ? toDraft(project) : { ...EMPTY }), [project])
  const [form, setForm] = useState<Draft>(initial)
  const [featuresText, setFeaturesText] = useState(initial.features.join('\n'))
  const [slugTouched, setSlugTouched] = useState(Boolean(project))
  const [errors, setErrors] = useState<Errors>({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<ProjectCategory | null>(null)
  const saved = useRef(canonicalJson(initial))

  const current: Draft = useMemo(
    () => ({ ...form, features: featuresText.split('\n').map((l) => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean) }),
    [form, featuresText],
  )
  const dirty = canonicalJson(current) !== saved.current

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setForm((f) => ({ ...f, [key]: value }))
  const mainCategory = form.categoryIds[0] ?? ''
  const setMain = (categoryId: string) => setForm((f) => ({ ...f, categoryIds: categoryId ? [categoryId, ...f.categoryIds.filter((x) => x !== categoryId && x !== f.categoryIds[0])] : f.categoryIds.slice(1) }))
  const toggleExtraCategory = (categoryId: string) =>
    setForm((f) => {
      const [main, ...rest] = f.categoryIds
      if (!main) return f
      const extras = rest.includes(categoryId) ? rest.filter((x) => x !== categoryId) : [...rest, categoryId]
      return { ...f, categoryIds: [main, ...extras] }
    })
  const togglePlatform = (platform: Platform) =>
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(platform) ? f.platforms.filter((x) => x !== platform) : PLATFORMS.filter((x) => x === platform || f.platforms.includes(x)),
    }))
  const toggleService = (serviceId: string) =>
    setForm((f) => ({
      ...f,
      serviceIds: f.serviceIds.includes(serviceId) ? f.serviceIds.filter((x) => x !== serviceId) : [...f.serviceIds, serviceId],
    }))
  const categoryProjectCount = (categoryId: string) => site.projects.filter((p) => p.categoryIds.includes(categoryId)).length
  const removeCategory = () => {
    if (!deletingCategory) return
    const ok = save(
      (d) => ({
        ...d,
        categories: d.categories.filter((category) => category.id !== deletingCategory.id).sort(byOrder).map((category, index) => ({ ...category, order: index + 1 })),
        projects: d.projects.map((p) => ({ ...p, categoryIds: p.categoryIds.filter((categoryId) => categoryId !== deletingCategory.id) })),
      }),
      `Deleted “${deletingCategory.name}”.`,
    )
    if (ok) {
      setForm((f) => ({ ...f, categoryIds: f.categoryIds.filter((categoryId) => categoryId !== deletingCategory.id) }))
      setDeletingCategory(null)
    }
  }

  const validate = (d: Draft): Errors => {
    const e: Errors = {}
    if (!d.title.trim()) e.title = 'Add a project title.'
    if (!d.slug) e.slug = 'Add a page link.'
    else if (!isValidSlug(d.slug)) e.slug = 'Use lowercase letters, numbers and hyphens only, for example “school-app”.'
    else if (site.projects.some((p) => p.slug === d.slug && p.id !== project?.id)) e.slug = 'Another project already uses this link. Choose a different one.'
    if (!d.summary.trim()) e.summary = 'Add a short summary. It appears on project cards.'
    else if (d.summary.length > 300) e.summary = 'Keep the summary under 300 characters.'
    if (!d.categoryIds[0]) e.category = 'Choose the main category.'
    if (!d.platforms.length) e.platforms = 'Choose at least one platform.'
    if (d.playStoreUrl.trim() && !safeUrl(d.playStoreUrl)) e.playStoreUrl = 'Enter the full Google Play link, for example https://play.google.com/store/apps/details?id=…'
    if (d.appStoreUrl.trim() && !safeUrl(d.appStoreUrl)) e.appStoreUrl = 'Enter the full App Store link, for example https://apps.apple.com/app/…'
    if (d.liveUrl.trim() && !safeUrl(d.liveUrl)) e.liveUrl = 'Enter a full link, for example https://example.com'
    if (d.sourceUrl.trim() && !safeUrl(d.sourceUrl)) e.sourceUrl = 'Enter a full link, for example https://github.com/…'
    if (d.extraLinks.some((l) => (l.url.trim() || l.label.trim()) && !safeUrl(l.url))) e.extraLinks = 'Each extra link needs a full web address.'
    return e
  }

  const clean = (d: Draft): Draft => ({
    ...d,
    title: d.title.trim(),
    summary: d.summary.trim(),
    description: d.description.trim(),
    problem: d.problem.trim(),
    solution: d.solution.trim(),
    playStoreUrl: safeUrl(d.playStoreUrl),
    appStoreUrl: safeUrl(d.appStoreUrl),
    liveUrl: safeUrl(d.liveUrl),
    sourceUrl: safeUrl(d.sourceUrl),
    extraLinks: d.extraLinks.filter((l) => l.url.trim()).map((l) => ({ label: l.label.trim() || 'Link', url: safeUrl(l.url) })),
  })

  const submit = (overrides: Partial<Draft> = {}, message = 'Changes saved.'): Project | null => {
    const data = clean({ ...current, ...overrides })
    const e = validate(data)
    setErrors(e)
    if (Object.keys(e).length) {
      toast('Some fields need attention before saving.', 'error')
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus()
      return null
    }
    const now = Date.now()
    const result: Project = project
      ? { ...project, ...data, updatedAt: now }
      : { ...data, id: uid('p'), order: 0, createdAt: now, updatedAt: now }
    const ok = save(
      (d) => ({
        ...d,
        projects: project
          ? d.projects.map((p) => (p.id === project.id ? result : p))
          : [result, ...[...d.projects].sort(byOrder)].map((p, i) => ({ ...p, order: i + 1 })),
      }),
      message,
    )
    if (!ok) return null
    saved.current = canonicalJson(toDraft(result))
    setForm(toDraft(result))
    setFeaturesText(result.features.join('\n'))
    if (!project) navigate(`/admin/projects/${result.id}`, { replace: true })
    return result
  }

  const preview = () => {
    const p = dirty || !project ? submit({}, 'Saved. Opening preview.') : project
    if (!p) return
    const href = __HASH_ROUTER__ ? `${window.location.href.split('#')[0]}#/work/${p.slug}?preview=1` : `${window.location.origin}${routePath(`/work/${p.slug}`)}?preview=1`
    window.open(href, '_blank')
  }

  const remove = () => {
    if (!project) return
    saved.current = canonicalJson(current)
    if (save((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== project.id).sort(byOrder).map((p, i) => ({ ...p, order: i + 1 })) }), `Deleted “${project.title}”.`)) {
      navigate('/admin/projects', { replace: true })
    }
  }

  const previewProject: Project = {
    ...current,
    id: project?.id ?? 'preview',
    order: 0,
    createdAt: 0,
    updatedAt: 0,
    title: current.title || 'App name',
    summary: current.summary || 'Your short summary appears here.',
  }
  const techNames = site.technologies.map((t) => t.name)

  const actionButtons = (
    <>
      {form.published ? (
        <>
          <button type="button" className="btn btn-primary w-full" onClick={() => submit()}>
            Save changes
          </button>
          <button type="button" className="btn btn-outline w-full" onClick={() => submit({ published: false }, 'Moved to drafts.')}>
            Move to drafts
          </button>
        </>
      ) : (
        <>
          <button type="button" className="btn btn-primary w-full" onClick={() => submit({ published: true }, 'Published. Visitors will see it after you publish the site.')}>
            Publish
          </button>
          <button type="button" className="btn btn-outline w-full" onClick={() => submit({ published: false }, 'Draft saved.')}>
            Save draft
          </button>
        </>
      )}
      <button type="button" className="btn btn-ghost w-full max-sm:border max-sm:border-line" onClick={preview} title="Preview">
        <Eye className="size-4" aria-hidden="true" />
        <span className="max-sm:sr-only">{dirty || !project ? 'Save and preview' : 'Preview'}</span>
      </button>
    </>
  )

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/admin/projects" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Apps
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">{project ? `Edit: ${project.title}` : 'Add an app'}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Fields marked <span className="text-accent-text">*</span> are required. Everything else is optional.
          </p>
        </div>
        {dirty && <span className="self-start rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-text sm:self-center">Unsaved changes</span>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <Panel title="Basics">
            <Field label="App name" required htmlFor="f-title" error={errors.title}>
              <input
                id="f-title"
                className="input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) }))}
                placeholder="Clinic booking app"
              />
            </Field>
            <Field label="Page link" required htmlFor="f-slug" error={errors.slug} hint={project ? 'Changing this breaks links you have already shared.' : 'Filled in from the title. You can change it.'}>
              <div className="flex overflow-hidden rounded-[0.7rem] border border-line-strong focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]">
                <span className="hidden items-center bg-surface-2 px-3 text-sm text-ink-faint sm:flex">/work/</span>
                <input
                  id="f-slug"
                  className="min-h-11 w-full min-w-0 bg-page-deep px-3 text-[0.95rem] text-ink outline-none"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))
                  }}
                  onBlur={() => set('slug', slugify(form.slug))}
                />
              </div>
            </Field>
            <Field label="Short summary" required htmlFor="f-summary" error={errors.summary} counter={{ value: form.summary.length, max: 300 }} hint="One or two sentences, shown on project cards and when the link is shared.">
              <textarea id="f-summary" className="input min-h-20" rows={2} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Main category" required htmlFor="f-category" error={errors.category}>
                <div className="space-y-2">
                  <select id="f-category" className="input" value={mainCategory} onChange={(e) => setMain(e.target.value)}>
                    <option value="">Choose a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setAddingCategory(true)}>
                      <Plus className="size-4" aria-hidden="true" />
                      Add category
                    </button>
                    {mainCategory && (
                      <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => setDeletingCategory(categories.find((category) => category.id === mainCategory) ?? null)}>
                        <Trash className="size-4" aria-hidden="true" />
                        Delete category
                      </button>
                    )}
                  </div>
                  {categories.length === 0 && (
                    <p className="field-hint">
                      Create a category here to organize projects in the Work section.
                    </p>
                  )}
                </div>
              </Field>
              <Field label="Client" htmlFor="f-client" hint={<>Manage the list under <Link to="/admin/clients" className="font-semibold text-accent-text">Clients</Link>.</>}>
                <select id="f-client" className="input" value={form.clientId} onChange={(e) => set('clientId', e.target.value)}>
                  <option value="">No client (our own app)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status" required htmlFor="f-status">
                <select id="f-status" className="input" value={form.status} onChange={(e) => set('status', e.target.value as ProjectStatus)}>
                  {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={form.status === 'ongoing' ? 'Start date' : 'Launch date'} htmlFor="f-date">
                <input id="f-date" type="month" className="input" value={form.completedAt.slice(0, 7)} onChange={(e) => set('completedAt', e.target.value)} />
              </Field>
            </div>
            <fieldset>
              <legend className="field-label">
                Platforms <span className="text-accent-text">*</span>
              </legend>
              <div id="f-platforms" tabIndex={-1} className="grid gap-2 sm:grid-cols-3">
                {PLATFORMS.map((platform) => {
                  const checked = form.platforms.includes(platform)
                  return (
                    <label
                      key={platform}
                      className={cn(
                        'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm transition-colors',
                        checked ? 'border-accent bg-accent-soft text-ink' : 'border-line text-ink-muted hover:border-line-strong',
                      )}
                    >
                      <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={checked} onChange={() => togglePlatform(platform)} />
                      <PlatformIcon platform={platform} className="size-4" />
                      {PLATFORM_LABELS[platform]}
                    </label>
                  )
                })}
              </div>
              {errors.platforms && <p className="mt-1.5 text-sm text-danger">{errors.platforms}</p>}
            </fieldset>
            {categories.length > 1 && mainCategory && (
              <fieldset>
                <legend className="field-label">
                  Other categories <span className="font-normal text-ink-faint">(optional)</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {categories
                    .filter((category) => category.id !== mainCategory)
                    .map((category) => {
                      const checked = form.categoryIds.slice(1).includes(category.id)
                      return (
                        <label
                          key={category.id}
                          className={cn(
                            'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm transition-colors',
                            checked ? 'border-accent bg-accent-soft text-ink' : 'border-line text-ink-muted hover:border-line-strong',
                          )}
                        >
                          <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={checked} onChange={() => toggleExtraCategory(category.id)} />
                          {category.name}
                        </label>
                      )
                    })}
                </div>
              </fieldset>
            )}
            {services.length > 0 && (
              <fieldset>
                <legend className="field-label">
                  Services provided <span className="font-normal text-ink-faint">(optional)</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {services.map((service) => {
                    const checked = form.serviceIds.includes(service.id)
                    return (
                      <label
                        key={service.id}
                        className={cn(
                          'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm transition-colors',
                          checked ? 'border-accent bg-accent-soft text-ink' : 'border-line text-ink-muted hover:border-line-strong',
                        )}
                      >
                        <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={checked} onChange={() => toggleService(service.id)} />
                        {service.name}
                      </label>
                    )
                  })}
                </div>
                <p className="field-hint">Services are managed separately and do not create app categories.</p>
              </fieldset>
            )}
          </Panel>

          <Panel title="Images" description="Add the app icon and phone screenshots. A wide banner is optional: without one, cards show your screenshots in phone frames, or the app icon.">
            <Field label="Cover banner" hint="A wide promo image, like a Play Store feature graphic (1024 × 500). Leave empty to show the screenshots instead.">
              <CoverImageInput value={form.coverImage} onChange={(v) => set('coverImage', v)} />
            </Field>
            <Field label="App icon" hint="Square, at least 512 × 512, like the icon on Google Play.">
              <RoundImageInput value={form.logo} onChange={(v) => set('logo', v)} label="app icon" square />
            </Field>
            <Field label="Screenshots" hint="Portrait phone screenshots work best (for example 1080 × 2340). They are shown in phone frames, and visitors can open them full size. Use the arrows to change the order.">
              <GalleryInput
                value={form.gallery}
                onChange={(v) => set('gallery', v)}
                onAppend={(images) => setForm((f) => ({ ...f, gallery: [...f.gallery, ...images] }))}
              />
            </Field>
          </Panel>

          <Panel title="App story" description="Explain the app the way you would to a new client.">
            <Field label="Description" htmlFor="f-description" hint="Leave an empty line between paragraphs.">
              <textarea id="f-description" className="input min-h-40" value={form.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="The challenge" htmlFor="f-problem" hint="What the client needed.">
                <textarea id="f-problem" className="input" value={form.problem} onChange={(e) => set('problem', e.target.value)} />
              </Field>
              <Field label="What we built" htmlFor="f-solution" hint="How the app helps its users.">
                <textarea id="f-solution" className="input" value={form.solution} onChange={(e) => set('solution', e.target.value)} />
              </Field>
            </div>
            <Field label="Key features" htmlFor="f-features" hint="One feature per line.">
              <textarea id="f-features" className="input min-h-32" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={'Login with phone number\nPush notifications\nAdmin panel for content'} />
            </Field>
            <Field label="Technologies" htmlFor="f-tech" hint="Press Enter or comma after each one. Names from your technology stack show their logo.">
              <TagInput id="f-tech" value={form.technologies} onChange={(v) => set('technologies', v)} placeholder="Flutter, Firebase, Kotlin…" suggestions={techNames} />
            </Field>
          </Panel>

          <Panel title="Store and links" description="Store links show as Google Play and App Store buttons on the app page.">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Google Play link" htmlFor="f-playStoreUrl" error={errors.playStoreUrl}>
                <input id="f-playStoreUrl" className="input" inputMode="url" value={form.playStoreUrl} onChange={(e) => set('playStoreUrl', e.target.value)} placeholder="https://play.google.com/store/apps/details?id=…" />
              </Field>
              <Field label="App Store link" htmlFor="f-appStoreUrl" error={errors.appStoreUrl}>
                <input id="f-appStoreUrl" className="input" inputMode="url" value={form.appStoreUrl} onChange={(e) => set('appStoreUrl', e.target.value)} placeholder="https://apps.apple.com/app/…" />
              </Field>
              <Field label="Website or web version" htmlFor="f-liveUrl" error={errors.liveUrl}>
                <input id="f-liveUrl" className="input" inputMode="url" value={form.liveUrl} onChange={(e) => set('liveUrl', e.target.value)} placeholder="https://" />
              </Field>
              <Field label="Source code link" htmlFor="f-sourceUrl" error={errors.sourceUrl} hint="Only if the client agreed to share the code.">
                <input id="f-sourceUrl" className="input" inputMode="url" value={form.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} placeholder="https://github.com/…" />
              </Field>
            </div>
            <fieldset>
              <legend className="field-label">
                Other links <span className="font-normal text-ink-faint">(optional, for example an APK download, Microsoft Store or Chrome extension)</span>
              </legend>
              <div className="space-y-2">
                {form.extraLinks.map((l, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
                    <input className="input" aria-label={`Label for link ${i + 1}`} placeholder="Download APK" value={l.label} onChange={(e) => set('extraLinks', form.extraLinks.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} />
                    <input className="input" aria-label={`Address for link ${i + 1}`} placeholder="https://" inputMode="url" value={l.url} onChange={(e) => set('extraLinks', form.extraLinks.map((x, k) => (k === i ? { ...x, url: e.target.value } : x)))} />
                    <button type="button" className="btn btn-ghost btn-icon text-danger" onClick={() => set('extraLinks', form.extraLinks.filter((_, k) => k !== i))} aria-label={`Remove link ${i + 1}`}>
                      <Trash className="size-4" />
                    </button>
                  </div>
                ))}
                {errors.extraLinks && <p className="text-sm text-danger">{errors.extraLinks}</p>}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => set('extraLinks', [...form.extraLinks, { label: '', url: '' }])}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add a link
                </button>
              </div>
            </fieldset>
          </Panel>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Panel title="Publishing">
            <div className="rounded-xl border border-line bg-page-deep px-4 py-3 text-sm text-ink">
              {form.published ? (
                <p>
                  <span className="font-semibold text-success">Published.</span> Shown in the portfolio.
                </p>
              ) : (
                <p>
                  <span className="font-semibold">Draft.</span> Hidden from visitors.
                </p>
              )}
            </div>
            <Switch checked={form.featured} onChange={(v) => set('featured', v)} label="Featured" description="Shown first and on the homepage." />
            {project?.published && <p className="break-all text-xs text-ink-faint">Page: {projectUrl(form.slug || project.slug)}</p>}
            <div className="hidden flex-col gap-2 xl:flex">{actionButtons}</div>
          </Panel>
          <div className="hidden xl:block">
            <p className="mb-2 text-xs font-semibold text-ink-faint">Card preview</p>
            <ProjectCard project={previewProject} category={categories.find((category) => category.id === mainCategory)} preview />
          </div>
          {project && (
            <button type="button" className="btn btn-ghost w-full text-danger" onClick={() => setConfirmDelete(true)}>
              <Trash className="size-4" aria-hidden="true" />
              Delete this app
            </button>
          )}
        </aside>
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 mt-6 border-t border-line bg-page/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 xl:hidden">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:grid-cols-3 [&_.btn]:px-3 [&_.btn]:text-sm">{actionButtons}</div>
      </div>

      {confirmDelete && project && (
        <ConfirmDialog
          title="Delete this app?"
          message={
            <>
              <span className="font-semibold text-ink">{project.title}</span> will be removed.
            </>
          }
          confirmLabel="Delete app"
          onConfirm={remove}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
      {addingCategory && (
        <CategoryDialog
          categories={categories}
          onClose={() => setAddingCategory(false)}
          onSaved={(category) => {
            setMain(category.id)
            setErrors((currentErrors) => ({ ...currentErrors, category: undefined }))
          }}
        />
      )}
      {deletingCategory && (
        <ConfirmDialog
          title="Delete this category?"
          message={
            categoryProjectCount(deletingCategory.id) > 0 ? (
              <>
                <span className="font-semibold text-ink">{deletingCategory.name}</span> will be deleted and removed from {categoryProjectCount(deletingCategory.id)} project(s).
              </>
            ) : (
              <>
                <span className="font-semibold text-ink">{deletingCategory.name}</span> will be deleted.
              </>
            )
          }
          confirmLabel="Delete category"
          onConfirm={removeCategory}
          onCancel={() => setDeletingCategory(null)}
        />
      )}
    </>
  )
}
