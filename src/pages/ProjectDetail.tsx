import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowUpRight, Check, ChevronRight, Code, Eye, Pencil } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import { useWhatsApp } from '../hooks/useWhatsApp'
import { useSeo } from '../lib/seo'
import { PLATFORM_LABELS, STATUS_LABELS, type ImageItem, type Project } from '../lib/types'
import { cn, formatMonth, linkLabel, paragraphs, projectInquiryMessage, projectUrl, safeUrl, shareImage } from '../lib/utils'
import { CallToAction } from '../components/CallToAction'
import { BrandIcon } from '../components/icons/BrandIcon'
import { useSetWhatsAppMessage } from '../components/layout/WhatsAppContext'
import { Lightbox } from '../components/Lightbox'
import { AppIcon, PhoneFrame } from '../components/PhoneFrame'
import { PlatformIcon } from '../components/PlatformIcon'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectVisual } from '../components/ProjectVisual'
import { ShareButtons } from '../components/ShareButtons'
import { StoreButton } from '../components/StoreButtons'
import { TechIcon } from '../components/TechIcon'
import NotFound from './NotFound'

export default function ProjectDetail() {
  const { slug = '' } = useParams()
  const [params] = useSearchParams()
  const preview = params.get('preview') === '1'
  const { site } = useContent()
  const project = site.projects.find((p) => p.slug === slug && (p.published || preview))
  if (!project) return <NotFound title="This project isn’t available" text="It may have been moved or renamed. Browse our other work instead." />
  return <ProjectView key={project.id} project={project} />
}

function ProjectView({ project }: { project: Project }) {
  const { settings, projects, categoryById, serviceById, clientById, techByName } = useContent()
  const wa = useWhatsApp()
  const [lightbox, setLightbox] = useState<number | null>(null)
  const services = project.serviceIds.map((id) => serviceById.get(id)).filter((s) => !!s)
  const category = categoryById.get(project.categoryIds[0] ?? '')
  const client = clientById.get(project.clientId)
  const inquiry = projectInquiryMessage(settings.companyName, project)

  useSetWhatsAppMessage(inquiry)
  useSeo({
    title: project.title,
    description: project.summary,
    image: shareImage(project.coverImage?.url, project.logo),
    path: `/work/${project.slug}`,
    noindex: !project.published,
    type: 'article',
  })

  const images: ImageItem[] = useMemo(() => {
    const seen = new Set<string>()
    return [...(project.coverImage ? [project.coverImage] : []), ...project.gallery].filter((i) => (seen.has(i.url) ? false : (seen.add(i.url), true)))
  }, [project])

  const related = useMemo(() => {
    const score = (p: Project) => (p.categoryIds[0] === project.categoryIds[0] ? 3 : 0) + p.categoryIds.filter((id) => project.categoryIds.includes(id)).length
    return projects
      .filter((p) => p.id !== project.id)
      .map((p) => ({ p, s: score(p) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => x.p)
  }, [projects, project])

  type Fact = { label: string; value: ReactNode }
  const factList: Array<Fact | null> = [
    client ? { label: 'Client', value: safeUrl(client.website) ? <a href={safeUrl(client.website)} target="_blank" rel="noopener noreferrer" className="hover:text-accent-text">{client.name}</a> : client.name } : null,
    category ? { label: 'Category', value: <Link to={`/work?category=${category.slug}`} className="hover:text-accent-text">{category.name}</Link> } : null,
    { label: 'Status', value: STATUS_LABELS[project.status] },
    project.platforms.length
      ? {
          label: 'Platforms',
          value: (
            <span className="inline-flex flex-wrap justify-end gap-x-3 gap-y-1">
              {project.platforms.map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5">
                  <PlatformIcon platform={p} className="size-3.5 text-accent-text" />
                  {PLATFORM_LABELS[p]}
                </span>
              ))}
            </span>
          ),
        }
      : null,
    project.completedAt ? { label: project.status === 'ongoing' ? 'Started' : 'Launched', value: formatMonth(project.completedAt) } : null,
  ]
  const facts = factList.filter((x): x is Fact => !!x)
  const story = paragraphs(project.description)
  const live = safeUrl(project.liveUrl)
  const play = safeUrl(project.playStoreUrl)
  const appStore = safeUrl(project.appStoreUrl)
  const coverOffset = project.coverImage ? 1 : 0
  const source = safeUrl(project.sourceUrl)
  const testimonial = client?.testimonial

  return (
    <>
      {!project.published && (
        <div className="border-b border-accent/40 bg-accent-soft">
          <div className="container-x flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <Eye className="size-4 text-accent-text" aria-hidden="true" />
              Preview: this app is a draft, so it isn’t listed in the portfolio.
            </p>
            <Link to={`/admin/projects/${project.id}`} className="btn btn-outline btn-sm self-start">
              <Pencil className="size-4" aria-hidden="true" />
              Edit app
            </Link>
          </div>
        </div>
      )}

      <article>
        <header className="container-x pt-8 md:pt-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-faint">
            <Link to="/work" className="hover:text-ink">
              Our apps
            </Link>
            {category && (
              <>
                <ChevronRight className="size-4" aria-hidden="true" />
                <Link to={`/work?service=${category.slug}`} className="hover:text-ink">
                  {category.name}
                </Link>
              </>
            )}
          </nav>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-end">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <AppIcon src={project.logo} name={project.title} className="w-20 ring-2 ring-accent/60 sm:w-24" />
              <div className="min-w-0">
                {project.status !== 'completed' && <span className="chip chip-accent mb-3">{STATUS_LABELS[project.status]}</span>}
                <h1 className="text-[2rem] font-extrabold leading-tight text-ink sm:text-5xl">{project.title}</h1>
                {project.summary && <p className="mt-4 max-w-2xl text-lg text-ink-muted">{project.summary}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
              {play && <StoreButton store="play" href={play} />}
              {appStore && <StoreButton store="apple" href={appStore} />}
              {live && (
                <a href={live} target="_blank" rel="noopener noreferrer" className={cn('btn', play || appStore ? 'btn-outline' : 'btn-primary')}>
                  {linkLabel(live)}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              )}
              <a href={wa.link(inquiry)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                <BrandIcon name="whatsapp" className="size-[18px] text-whatsapp" />
                Get a similar app
              </a>
            </div>
          </div>
        </header>

        <section className="container-x mt-10" aria-label="App images">
          {(project.coverImage || project.gallery.length === 0) && (
            <button
              type="button"
              className="block w-full overflow-hidden rounded-3xl border border-line bg-surface disabled:cursor-default"
              onClick={() => project.coverImage && setLightbox(0)}
              disabled={!project.coverImage}
              aria-label={project.coverImage ? 'Open image viewer' : undefined}
            >
              <div className={cn('w-full', project.coverImage ? 'aspect-[2/1] max-h-[560px]' : 'aspect-[16/9] sm:aspect-[3/1]')}>
                <ProjectVisual project={{ ...project, gallery: [] }} width={1600} priority />
              </div>
            </button>
          )}
          {project.gallery.length > 0 && (
            <div className={cn(project.coverImage && 'mt-10')}>
              <h2 className="text-2xl font-extrabold text-ink">Screenshots</h2>
              <ul className="no-scrollbar -mx-4 mt-5 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-6 sm:mx-0 sm:scroll-px-0 sm:gap-6 sm:px-0">
                {project.gallery.map((im, i) => (
                  <li key={im.url + i} className="shrink-0 snap-start">
                    <button
                      type="button"
                      onClick={() => setLightbox(i + coverOffset)}
                      className="group block w-40 rounded-[1.7rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:w-52"
                      aria-label={`Open screenshot ${i + 1}${im.alt ? `: ${im.alt}` : ''}`}
                    >
                      <PhoneFrame src={im.url} width={420} priority={i < 2} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:border-accent/70" />
                    </button>
                    {im.alt && <p className="mt-2 w-40 text-center text-xs text-ink-faint sm:w-52">{im.alt}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <div className="container-x mt-12 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
          <div className="min-w-0 space-y-12">
            {story.length > 0 && (
              <section>
                <h2 className="text-2xl font-extrabold text-ink">Overview</h2>
                <div className="prose-body mt-4 max-w-[68ch] text-ink-muted">
                  {story.map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
                </div>
              </section>
            )}
            {(project.problem || project.solution) && (
              <section className="grid gap-4 md:grid-cols-2">
                {project.problem && (
                  <div className="card p-6">
                    <h2 className="text-sm font-bold text-ink-faint">The challenge</h2>
                    <p className="mt-2 text-ink">{project.problem}</p>
                  </div>
                )}
                {project.solution && (
                  <div className="card border-accent/40 p-6">
                    <h2 className="text-sm font-bold text-accent-text">What we built</h2>
                    <p className="mt-2 text-ink">{project.solution}</p>
                  </div>
                )}
              </section>
            )}
            {project.features.length > 0 && (
              <section>
                <h2 className="text-2xl font-extrabold text-ink">Key features</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {project.features.map((f) => (
                    <li key={f} className="flex gap-3 rounded-xl border border-line p-4 text-ink">
                      <Check className="mt-0.5 size-5 shrink-0 text-accent-text" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {testimonial && (
              <figure className="card p-7">
                <blockquote className="text-lg font-medium text-ink">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-4 text-sm text-ink-muted">
                  <span className="font-bold text-ink">{testimonial.author || client!.name}</span>
                  {[testimonial.role, client!.name].filter(Boolean).length > 0 && <span>, {[testimonial.role, client!.name].filter(Boolean).join(', ')}</span>}
                </figcaption>
              </figure>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h2 className="text-base font-bold text-ink">App details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {facts.map((f) => (
                  <div key={f.label} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                    <dt className="text-ink-faint">{f.label}</dt>
                    <dd className="text-right font-semibold text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
              {services.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xs font-bold text-ink-faint">Services provided</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {services.map((s) => (
                      <li key={s.id}>
                        <span className="chip chip-accent">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {project.technologies.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xs font-bold text-ink-faint">Technologies</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {project.technologies.map((t) => {
                      const tech = techByName.get(t.toLowerCase())
                      return (
                        <li key={t} className="chip">
                          {tech?.icon && <TechIcon icon={tech.icon} name={tech.name} className="size-3.5" />}
                          {t}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              {(source || project.extraLinks.length > 0) && (
                <div className="mt-5">
                  <h3 className="text-xs font-bold text-ink-faint">Links</h3>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {project.extraLinks.map((l) => {
                      const href = safeUrl(l.url)
                      return href ? (
                        <li key={l.url}>
                          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-accent-text hover:underline">
                            <ArrowUpRight className="size-4" aria-hidden="true" /> {l.label || linkLabel(href, 'Open link')}
                          </a>
                        </li>
                      ) : null
                    })}
                    {source && (
                      <li>
                        <a href={source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-accent-text hover:underline">
                          <Code className="size-4" aria-hidden="true" /> Source code
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="text-base font-bold text-ink">Want an app like this?</h2>
              <p className="mt-2 text-sm text-ink-muted">Send us this app on WhatsApp and tell us what you’d change for your business.</p>
              <a href={wa.link(inquiry)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-4 w-full">
                <BrandIcon name="whatsapp" className="size-[18px]" />
                Get a similar app
              </a>
              <div className="mt-5 border-t border-line pt-5">
                <h3 className="mb-3 text-xs font-bold text-ink-faint">Share this app</h3>
                <ShareButtons url={projectUrl(project.slug)} title={`${project.title} by ${settings.companyName}`} />
              </div>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="container-x mt-20" aria-labelledby="related-heading">
          <div className="flex items-end justify-between gap-4">
            <h2 id="related-heading" className="text-2xl font-extrabold text-ink sm:text-3xl">
              Related apps
            </h2>
            <Link to="/work" className="text-sm font-semibold text-accent-text hover:underline">
              All apps
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} category={categoryById.get(p.categoryIds[0] ?? '')} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-20">
        <CallToAction title="Want an app like this?" message={inquiry} />
      </div>

      {lightbox !== null && <Lightbox images={images} index={lightbox} onClose={() => setLightbox(null)} onChange={setLightbox} />}
    </>
  )
}
