import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight, BadgeCheck, ChevronDown, Quote } from 'lucide-react'
import { useContent } from '../../hooks/useContent'
import { useWhatsApp } from '../../hooks/useWhatsApp'
import { cn, img, paragraphs, safeUrl } from '../../lib/utils'
import { TECH_GROUPS } from '../../lib/types'
import { BrandIcon } from '../icons/BrandIcon'
import { ProjectCard } from '../ProjectCard'
import { ServiceIcon } from '../ServiceIcon'
import { TechIcon } from '../TechIcon'
import { TypedWords } from '../TypedWords'
import { CodeToApp } from './CodeToApp'

export function SectionHeading({ title, text, aside }: { title: string; text?: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{title}</h2>
        {text && <p className="mt-3 text-ink-muted">{text}</p>}
      </div>
      {aside}
    </div>
  )
}

/* ---------------- Hero ---------------- */
export function Hero() {
  const { settings, projects, technologies, clients } = useContent()
  const wa = useWhatsApp()
  const years = new Date().getFullYear() - settings.established

  const stats = [
    { k: 'Building since', v: String(settings.established) },
    { k: 'Apps in this portfolio', v: String(projects.length) },
    { k: 'Technologies we use', v: String(technologies.filter((t) => t.showOnSite).length) },
    clients.length ? { k: 'Organisations worked with', v: String(clients.filter((c) => c.showOnSite).length) } : { k: 'Years of experience', v: `${years}+` },
  ]

  return (
    <section className="relative overflow-hidden">
      <div className="container-x grid items-center gap-12 pb-10 pt-10 md:pb-16 md:pt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:pb-20">
        <div className="hero-rise max-w-2xl">
          {settings.tagline && <p className="text-sm font-semibold tracking-wide text-accent-text">{settings.tagline}</p>}
          <h1 className="mt-4 text-[2.15rem] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.3rem]">{settings.heroTitle}</h1>
          {settings.heroWords.length > 0 && (
            <p className="mt-5 text-lg font-semibold text-ink">
              <span className="text-ink-muted">We build </span>
              <TypedWords className="text-accent-text" words={settings.heroWords} />
            </p>
          )}
          {settings.heroText && <p className="mt-4 max-w-xl text-base text-ink-muted sm:text-lg">{settings.heroText}</p>}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/work" className="btn btn-primary">
              See our apps
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href={wa.link()} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <BrandIcon name="whatsapp" className="size-[18px] text-whatsapp" />
              Message us on WhatsApp
            </a>
          </div>
        </div>
        <div className="relative pb-6 sm:px-4">
          <CodeToApp />
        </div>
      </div>

      <div className="container-x">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.k} className="bg-page px-5 py-5">
              <dt className="text-xs font-medium text-ink-faint">{s.k}</dt>
              <dd className="mt-1 text-2xl font-extrabold text-ink">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ---------------- Services ---------------- */
export function ServicesSection() {
  const { services, projects } = useContent()
  const [all, setAll] = useState(false)
  const counts = useMemo(() => {
    const m = new Map<string, number>()
    projects.forEach((p) => p.serviceIds.forEach((s) => m.set(s, (m.get(s) ?? 0) + 1)))
    return m
  }, [projects])
  if (!services.length) return null

  return (
    <section id="services" className="scroll-mt-20 py-20 md:py-24">
      <div className="container-x">
        <SectionHeading title="App development services" text="Everything you need to take an app from idea to the store: design, development, a backend and admin panel, publishing and updates after launch." />
        <ul className="mt-10 grid sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
          {services.map((s, i) => {
            const count = counts.get(s.id) ?? 0
            return (
              <li key={s.id} className={cn('border-t border-line', i >= 6 && !all && 'max-sm:hidden')}>
                <Link to={`/work?service=${s.slug}`} className="group -mx-3 flex h-full gap-4 rounded-xl px-3 py-6 transition-colors hover:bg-surface/50">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">
                    <ServiceIcon name={s.icon} />
                  </span>
                  <span className="flex flex-col">
                    <span className="font-bold text-ink group-hover:text-accent-text">{s.name}</span>
                    <span className="mt-1 text-sm text-ink-muted">{s.description}</span>
                    {count > 0 && (
                      <span className="mt-2 text-xs font-semibold text-ink-faint">
                        {count} {count === 1 ? 'app' : 'apps'}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        {services.length > 6 && !all && (
          <button type="button" className="btn btn-outline mt-4 w-full sm:hidden" onClick={() => setAll(true)}>
            Show all {services.length} services
          </button>
        )}
      </div>
    </section>
  )
}

/* ---------------- Work ---------------- */
/** How many apps the home page shows before "Show more". */
const WORK_INITIAL_COUNT = 6

export function WorkSection() {
  const { projects, categories, categoryById } = useContent()
  const [tab, setTab] = useState('all')
  const [expanded, setExpanded] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  /** Where the toggle button was on screen before "Show less", so the page can keep it in place. */
  const toggleTop = useRef<number | null>(null)
  const tabs = useMemo(() => categories.filter((category) => projects.some((p) => p.categoryIds.includes(category.id))), [categories, projects])
  const inTab = useMemo(() => (tab === 'all' ? projects : projects.filter((p) => p.categoryIds.includes(tab))), [projects, tab])
  const shown = expanded ? inTab : inTab.slice(0, WORK_INITIAL_COUNT)
  const canToggle = inTab.length > WORK_INITIAL_COUNT

  // After "Show less" the list gets shorter. Scroll by the same amount so the button stays under the
  // pointer, instead of leaving the visitor further down the page.
  useLayoutEffect(() => {
    const before = toggleTop.current
    toggleTop.current = null
    if (expanded || before === null || !toggleRef.current) return
    const moved = toggleRef.current.getBoundingClientRect().top - before
    if (moved) window.scrollBy({ top: moved, behavior: 'instant' })
  }, [expanded])

  if (!projects.length) return null

  const selectTab = (id: string) => {
    setTab(id)
    setExpanded(false)
  }

  const toggle = () => {
    if (expanded) toggleTop.current = toggleRef.current?.getBoundingClientRect().top ?? null
    setExpanded(!expanded)
  }

  return (
    <section id="work" className="scroll-mt-20 py-6 md:py-10">
      <div className="container-x">
        <SectionHeading
          title="Our apps"
          text="Mobile apps we have designed, built and published. Open any app for screenshots, features and store links."
          aside={
            <Link to="/work" className="btn btn-outline self-start sm:self-auto">
              See all apps
            </Link>
          }
        />
        {tabs.length > 1 && (
          <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter by category">
            {[{ id: 'all', name: 'All' }, ...tabs].map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={tab === c.id}
                onClick={() => selectTab(c.id)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  tab === c.id ? 'border-accent bg-accent text-on-accent' : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
        <div id="work-grid" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProjectCard key={p.id} project={p} category={categoryById.get(p.categoryIds[0] ?? '')} />
          ))}
        </div>
        {canToggle && (
          <div className="mt-8 flex justify-center">
            <button ref={toggleRef} type="button" className="btn btn-outline" onClick={toggle} aria-controls="work-grid" aria-expanded={expanded}>
              {expanded ? 'Show less' : 'Show more'}
              <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------------- Technology stack ---------------- */
export function TechStackSection() {
  const { technologies } = useContent()
  const visible = technologies.filter((t) => t.showOnSite)
  const groups = useMemo(() => {
    const names = [...TECH_GROUPS, ...new Set(visible.map((t) => t.group).filter((g) => !(TECH_GROUPS as readonly string[]).includes(g)))]
    return names.map((g) => ({ name: g, items: visible.filter((t) => t.group === g) })).filter((g) => g.items.length)
  }, [visible])
  if (!visible.length) return null

  return (
    <section id="tech" className="scroll-mt-20 py-20 md:py-24">
      <div className="container-x">
        <SectionHeading title="Technologies we use" text="Proven mobile tools, chosen for each app so it runs smoothly, stays secure and is easy to update." />
        <div className="mt-10 divide-y divide-line border-y border-line">
          {groups.map((g) => (
            <div key={g.name} className="grid gap-4 py-6 md:grid-cols-[200px_1fr] md:items-center">
              <h3 className="text-sm font-bold text-ink">{g.name}</h3>
              <ul className="flex flex-wrap gap-2.5">
                {g.items.map((t) => (
                  <li
                    key={t.id}
                    className="group flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                  >
                    <span className="relative size-5">
                      <TechIcon icon={t.icon} name={t.name} className="absolute inset-0 size-5 transition-opacity group-hover:opacity-0" />
                      <TechIcon icon={t.icon} name={t.name} color className="absolute inset-0 size-5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                    {t.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Process ---------------- */
export function ProcessSection() {
  const { settings } = useContent()
  if (!settings.process.length) return null
  return (
    <section id="process" className="scroll-mt-20 py-6 md:py-10">
      <div className="container-x">
        <SectionHeading title="How we build your app" text="A clear process from the first call to the store launch, so you always know what happens next." />
        <ol className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {settings.process.map((s, i) => (
            <li key={i} className="relative flex gap-4">
              <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full border-2 border-accent bg-page text-sm font-extrabold text-accent-text">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="pt-1.5">
                <h3 className="font-bold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-muted">{s.text}</p>
              </div>
              {i < settings.process.length - 1 && <span className="absolute left-[21px] top-12 h-[calc(100%-1rem)] w-px bg-line-strong md:hidden" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- Clients ---------------- */
function ClientLogo({ name, logo }: { name: string; logo: string }) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w[0] ?? ''))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
  return (
    <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-white p-1.5 ring-2 ring-line-strong">
      {logo && !failed ? (
        <img src={img(logo, 160)} alt="" loading="lazy" className="h-full w-full object-contain" onError={() => setFailed(true)} />
      ) : (
        <span className="text-base font-extrabold text-[#a35700]">{initials}</span>
      )}
    </span>
  )
}

export function ClientsSection() {
  const { clients } = useContent()
  const visible = clients.filter((c) => c.showOnSite)
  const testimonials = visible.filter((c) => c.testimonial)
  if (!visible.length) return null

  return (
    <section id="clients" className="scroll-mt-20 py-20 md:py-24">
      <div className="container-x">
        <SectionHeading title="Clients we’ve worked with" text="Colleges, departments, media brands and businesses we have built apps and digital products for." />
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {visible.map((c) => {
            const site = safeUrl(c.website)
            const body = (
              <>
                <ClientLogo name={c.name} logo={c.logo} />
                <span className="text-center text-sm font-semibold text-ink">{c.name}</span>
                {c.industry && <span className="-mt-1 text-xs text-ink-faint">{c.industry}</span>}
              </>
            )
            return (
              <li key={c.id}>
                {site ? (
                  <a href={site} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/60">
                    {body}
                  </a>
                ) : (
                  <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-5">{body}</div>
                )}
              </li>
            )
          })}
        </ul>

        {testimonials.length > 0 && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((c) => (
              <figure key={c.id} className="card flex flex-col p-6">
                <Quote className="size-6 text-accent-text" aria-hidden="true" />
                <blockquote className="mt-3 flex-1 text-ink">{c.testimonial!.quote}</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-bold text-ink">{c.testimonial!.author || c.name}</span>
                  <span className="block text-ink-faint">{[c.testimonial!.role, c.name].filter(Boolean).join(', ')}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------------- CEO ---------------- */
export function CeoSection() {
  const { settings } = useContent()
  const wa = useWhatsApp()
  const ceo = settings.ceo
  const [failed, setFailed] = useState(false)
  if (!ceo.name) return null
  const initials = ceo.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  const portfolio = safeUrl(ceo.portfolioUrl)
  const linkedin = safeUrl(ceo.linkedinUrl)

  return (
    <section id="about" className="scroll-mt-20 py-6 md:py-10">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_70%)]" aria-hidden="true" />
          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[320px_1fr] lg:items-center lg:gap-14 lg:p-14">
            <div className="flex flex-col items-center text-center">
              <span className="relative grid aspect-square w-52 place-items-center rounded-full p-2 ring-4 ring-accent sm:w-60">
                <span className="absolute inset-0 rounded-full shadow-[0_0_60px_-10px_var(--accent)] opacity-60" aria-hidden="true" />
                <span className="relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-page-deep">
                  {ceo.photo && !failed ? (
                    <img src={img(ceo.photo, 500)} alt={ceo.name} loading="lazy" className="h-full w-full object-cover" onError={() => setFailed(true)} />
                  ) : (
                    <span className="text-5xl font-extrabold text-accent-text">{initials}</span>
                  )}
                </span>
              </span>
              <p className="mt-6 text-xl font-extrabold text-ink">{ceo.name}</p>
              <p className="text-sm font-semibold text-accent-text">
                {ceo.role}
                {ceo.role && settings.companyName ? `, ${settings.companyName}` : ''}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Meet our CEO</h2>
              <div className="prose-body mt-5 max-w-[65ch] text-ink-muted">
                {paragraphs(ceo.bio).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {ceo.highlights.length > 0 && (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {ceo.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-sm text-ink">
                      <BadgeCheck className="mt-0.5 size-[18px] shrink-0 text-accent-text" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {portfolio && (
                  <a href={portfolio} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    View {ceo.name.split(' ')[0]}’s portfolio
                  </a>
                )}
                <a href={wa.link(`Hi ${ceo.name.split(' ')[0]}, I'd like to discuss a mobile app.`)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <BrandIcon name="whatsapp" className="size-[18px] text-whatsapp" />
                  Talk to {ceo.name.split(' ')[0]}
                </a>
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    <BrandIcon name="linkedin" className="size-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
