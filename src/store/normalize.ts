// Turns any stored or imported data into complete, valid SiteData, filling in anything missing.
import type {
  CeoInfo,
  Client,
  Platform,
  ImageItem,
  LinkItem,
  Office,
  ProcessStep,
  ProjectCategory,
  Project,
  Service,
  SiteData,
  SiteSettings,
  SocialLink,
  Technology,
} from '../lib/types'
import { PLATFORMS } from '../lib/types'

type Obj = Record<string, unknown>
const obj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {})
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d)
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d)
const bool = (v: unknown, d = false) => (typeof v === 'boolean' ? v : d)
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const strList = (v: unknown) => arr(v).filter((x): x is string => typeof x === 'string' && x.trim() !== '')

function image(v: unknown): ImageItem | null {
  const o = obj(v)
  const url = str(o.url)
  return url ? { url, alt: str(o.alt) } : null
}

function link(v: unknown): LinkItem | null {
  const o = obj(v)
  const url = str(o.url)
  return url ? { url, label: str(o.label, 'Link') || 'Link' } : null
}

function id(o: Obj, prefix: string, i: number) {
  return str(o.id) || `${prefix}-${i + 1}`
}

export function normalizeService(v: unknown, i = 0): Service {
  const o = obj(v)
  const name = str(o.name, 'Untitled service') || 'Untitled service'
  return { id: id(o, 'svc', i), slug: str(o.slug) || `service-${i + 1}`, name, description: str(o.description), icon: str(o.icon, 'smartphone'), order: num(o.order, i + 1) }
}

export function normalizeCategory(v: unknown, i = 0): ProjectCategory {
  const o = obj(v)
  const name = str(o.name, 'Untitled category') || 'Untitled category'
  return {
    id: id(o, 'category', i),
    slug: str(o.slug) || `category-${i + 1}`,
    name,
    description: str(o.description),
    icon: str(o.icon, 'smartphone'),
    order: num(o.order, i + 1),
  }
}

export function normalizeTechnology(v: unknown, i = 0): Technology {
  const o = obj(v)
  return {
    id: id(o, 'tech', i),
    name: str(o.name, 'Technology') || 'Technology',
    icon: str(o.icon),
    group: str(o.group, 'Mobile frameworks') || 'Mobile frameworks',
    order: num(o.order, i + 1),
    showOnSite: bool(o.showOnSite, true),
  }
}

export function normalizeClient(v: unknown, i = 0): Client {
  const o = obj(v)
  const t = obj(o.testimonial)
  const quote = str(t.quote).trim()
  return {
    id: id(o, 'client', i),
    name: str(o.name, 'Client') || 'Client',
    logo: str(o.logo),
    website: str(o.website),
    industry: str(o.industry),
    testimonial: quote ? { quote, author: str(t.author), role: str(t.role) } : null,
    showOnSite: bool(o.showOnSite, true),
    order: num(o.order, i + 1),
  }
}

export function normalizeProject(v: unknown, i = 0): Project {
  const o = obj(v)
  const status = o.status === 'ongoing' || o.status === 'demo' ? o.status : 'completed'
  return {
    id: id(o, 'project', i),
    slug: str(o.slug) || `project-${i + 1}`,
    title: str(o.title, 'Untitled project') || 'Untitled project',
    summary: str(o.summary),
    description: str(o.description),
    coverImage: image(o.coverImage),
    logo: str(o.logo),
    gallery: arr(o.gallery).map(image).filter((x): x is ImageItem => !!x),
    categoryIds: strList(o.categoryIds ?? o.serviceIds),
    serviceIds: strList(o.serviceIds),
    clientId: str(o.clientId),
    technologies: strList(o.technologies),
    features: strList(o.features),
    problem: str(o.problem),
    solution: str(o.solution),
    platforms: strList(o.platforms).filter((x): x is Platform => (PLATFORMS as string[]).includes(x)),
    playStoreUrl: str(o.playStoreUrl),
    appStoreUrl: str(o.appStoreUrl),
    liveUrl: str(o.liveUrl),
    sourceUrl: str(o.sourceUrl),
    extraLinks: arr(o.extraLinks).map(link).filter((x): x is LinkItem => !!x),
    completedAt: str(o.completedAt),
    status,
    published: bool(o.published, false),
    featured: bool(o.featured, false),
    order: num(o.order, i + 1),
    createdAt: num(o.createdAt),
    updatedAt: num(o.updatedAt),
  }
}

function normalizeCeo(v: unknown, d: CeoInfo): CeoInfo {
  const o = obj(v)
  return {
    name: str(o.name, d.name),
    role: str(o.role, d.role),
    photo: str(o.photo, d.photo),
    bio: str(o.bio, d.bio),
    highlights: Array.isArray(o.highlights) ? strList(o.highlights) : d.highlights,
    portfolioUrl: str(o.portfolioUrl, d.portfolioUrl),
    linkedinUrl: str(o.linkedinUrl, d.linkedinUrl),
  }
}

export function normalizeSettings(v: unknown, d: SiteSettings): SiteSettings {
  const o = obj(v)
  const offices = Array.isArray(o.offices)
    ? arr(o.offices).map((x): Office => {
        const of = obj(x)
        return { city: str(of.city), address: str(of.address), phone: str(of.phone) }
      })
    : d.offices
  const socials = Array.isArray(o.socials)
    ? arr(o.socials)
        .map((x): SocialLink => {
          const so = obj(x)
          return { name: str(so.name), icon: str(so.icon), url: str(so.url) }
        })
        .filter((s) => s.url)
    : d.socials
  const process = Array.isArray(o.process)
    ? arr(o.process)
        .map((x): ProcessStep => {
          const p = obj(x)
          return { title: str(p.title), text: str(p.text) }
        })
        .filter((p) => p.title)
    : d.process
  return {
    companyName: str(o.companyName, d.companyName) || d.companyName,
    tagline: str(o.tagline, d.tagline),
    established: num(o.established, d.established),
    heroTitle: str(o.heroTitle, d.heroTitle) || d.heroTitle,
    heroText: str(o.heroText, d.heroText),
    heroWords: Array.isArray(o.heroWords) ? strList(o.heroWords) : d.heroWords,
    whatsappNumber: str(o.whatsappNumber, d.whatsappNumber).replace(/\D/g, '') || d.whatsappNumber,
    whatsappDisplay: str(o.whatsappDisplay, d.whatsappDisplay),
    whatsappMessage: str(o.whatsappMessage, d.whatsappMessage),
    email: str(o.email, d.email),
    hours: str(o.hours, d.hours),
    offices,
    socials,
    ceo: normalizeCeo(o.ceo, d.ceo),
    process,
  }
}

/** `fallback` supplies settings for anything missing (normally the published data). */
export function normalizeSiteData(v: unknown, fallback?: SiteData): SiteData {
  const o = obj(v)
  const defaults = fallback?.settings ?? normalizeSettings({}, EMPTY_SETTINGS)
  const services = arr(o.services).map(normalizeService)
  const categories = Array.isArray(o.categories)
    ? arr(o.categories).map(normalizeCategory)
    : services.map((service, i) => ({ ...service, id: service.id, order: i + 1 }))
  return {
    app: 'adeebtechlab-app',
    version: 1,
    updatedAt: num(o.updatedAt),
    settings: normalizeSettings(o.settings, defaults),
    services,
    categories,
    technologies: arr(o.technologies).map(normalizeTechnology),
    clients: arr(o.clients).map(normalizeClient),
    projects: arr(o.projects).map(normalizeProject),
  }
}

const EMPTY_SETTINGS: SiteSettings = {
  companyName: 'Adeeb Technology Lab',
  tagline: '',
  established: 2016,
  heroTitle: 'Mobile apps that put your business in every pocket.',
  heroText: '',
  heroWords: [],
  whatsappNumber: '923092333121',
  whatsappDisplay: '+92 309 2333121',
  whatsappMessage: "Hi, I'd like to discuss a mobile app.",
  email: '',
  hours: '',
  offices: [],
  socials: [],
  ceo: { name: '', role: '', photo: '', bio: '', highlights: [], portfolioUrl: '', linkedinUrl: '' },
  process: [],
}

export function isSiteData(v: unknown) {
  const o = obj(v)
  return o.app === 'adeebtechlab-app' && Array.isArray(o.projects) && Array.isArray(o.services)
}
