export type ProjectStatus = 'completed' | 'ongoing' | 'demo'

/** Where an app runs. */
export type Platform = 'android' | 'ios' | 'web' | 'windows' | 'chrome'

export const PLATFORMS: Platform[] = ['android', 'ios', 'web', 'windows', 'chrome']

export const PLATFORM_LABELS: Record<Platform, string> = {
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
  windows: 'Windows',
  chrome: 'Chrome extension',
}

export interface ImageItem {
  url: string
  alt: string
}

export interface LinkItem {
  label: string
  url: string
}

/** An app development service we offer. */
export interface Service {
  id: string
  slug: string
  name: string
  description: string
  /** Icon key from src/components/ServiceIcon.tsx */
  icon: string
  order: number
}

/** A category used to organize projects in the Work section. */
export interface ProjectCategory {
  id: string
  slug: string
  name: string
  description: string
  /** Icon key from src/components/ServiceIcon.tsx */
  icon: string
  order: number
}

export interface Technology {
  id: string
  name: string
  /** Icon key from src/components/TechIcon.tsx ('' shows initials) */
  icon: string
  group: string
  order: number
  showOnSite: boolean
}

export interface Testimonial {
  quote: string
  author: string
  role: string
}

export interface Client {
  id: string
  name: string
  logo: string
  website: string
  industry: string
  /** Only add testimonials the client actually gave and agreed to show. */
  testimonial: Testimonial | null
  showOnSite: boolean
  order: number
}

export interface Project {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  coverImage: ImageItem | null
  logo: string
  /** App screenshots, ideally portrait phone screens. */
  gallery: ImageItem[]
  /** Project category ids. The first one is the main category. */
  categoryIds: string[]
  /** Services provided for this project. */
  serviceIds: string[]
  clientId: string
  technologies: string[]
  features: string[]
  problem: string
  solution: string
  /** Platforms the app runs on. */
  platforms: Platform[]
  /** Google Play listing. */
  playStoreUrl: string
  /** Apple App Store listing. */
  appStoreUrl: string
  /** Website or web version of the app. */
  liveUrl: string
  sourceUrl: string
  extraLinks: LinkItem[]
  /** YYYY-MM */
  completedAt: string
  status: ProjectStatus
  published: boolean
  featured: boolean
  order: number
  createdAt: number
  updatedAt: number
}

export interface ProcessStep {
  title: string
  text: string
}

export interface Office {
  city: string
  address: string
  phone: string
}

export interface SocialLink {
  name: string
  /** Icon key for BrandIcon */
  icon: string
  url: string
}

export interface CeoInfo {
  name: string
  role: string
  photo: string
  /** Paragraphs separated by a blank line */
  bio: string
  highlights: string[]
  portfolioUrl: string
  linkedinUrl: string
}

export interface SiteSettings {
  companyName: string
  tagline: string
  established: number
  heroTitle: string
  heroText: string
  heroWords: string[]
  whatsappNumber: string
  whatsappDisplay: string
  whatsappMessage: string
  email: string
  hours: string
  offices: Office[]
  socials: SocialLink[]
  ceo: CeoInfo
  process: ProcessStep[]
}

export interface SiteData {
  app: 'adeebtechlab-app'
  version: 1
  updatedAt: number
  settings: SiteSettings
  services: Service[]
  categories: ProjectCategory[]
  technologies: Technology[]
  clients: Client[]
  projects: Project[]
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: 'Completed',
  ongoing: 'Ongoing',
  demo: 'Demo / Sample',
}

export const TECH_GROUPS = ['Mobile frameworks', 'Languages', 'Backend & Cloud', 'Design & Tools', 'Publishing & Growth'] as const
