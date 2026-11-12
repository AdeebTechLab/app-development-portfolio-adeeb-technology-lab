import { SITE_URL } from '../config/site'
import type { Project } from './types'

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

export function uid(prefix = '') {
  const raw =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  return prefix ? `${prefix}-${raw}` : raw
}

/** "2025-03" → "March 2025" */
export function formatMonth(value: string) {
  if (!value) return ''
  const [y, m] = value.split('-').map(Number)
  if (!y) return value
  if (!m) return String(y)
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function formatDateTime(ms: number) {
  if (!ms) return ''
  return new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}

export function projectInquiryMessage(company: string, project: Pick<Project, 'title' | 'slug'>) {
  return `Hi ${company}, I saw "${project.title}" in your portfolio (${projectUrl(project.slug)}) and I'd like a similar app.`
}

export function routePath(path: string) {
  return __HASH_ROUTER__ ? `/#${path}` : path
}

export function siteOrigin() {
  if (typeof window !== 'undefined' && window.location.protocol.startsWith('http') && !__HASH_ROUTER__) {
    return window.location.origin
  }
  return SITE_URL
}

/** Public link to a project page. */
export function projectUrl(slug: string) {
  return `${siteOrigin()}${routePath(`/work/${slug}`)}`
}

/**
 * Optimise Cloudinary images (automatic format and quality, width limit).
 * Other image addresses are returned unchanged.
 */
export function img(url: string | undefined | null, width = 1200) {
  if (!url) return ''
  const marker = '/image/upload/'
  if (!url.includes('res.cloudinary.com') || !url.includes(marker)) return url
  const [head, tail] = url.split(marker)
  if (!/^v\d+\//.test(tail)) return url
  return `${head}${marker}f_auto,q_auto,c_limit,w_${width}/${tail}`
}

/** A 1200×630 social preview image from a Cloudinary cover or logo. */
export function shareImage(cover?: string, logo?: string) {
  const marker = '/image/upload/'
  const transform = (url: string, t: string) => {
    if (!url.includes('res.cloudinary.com') || !url.includes(marker)) return url.startsWith('http') ? url : undefined
    const [head, tail] = url.split(marker)
    return /^v\d+\//.test(tail) ? `${head}${marker}${t}/${tail}` : url
  }
  if (cover && !cover.startsWith('data:')) return transform(cover, 'c_fill,g_auto,w_1200,h_630,q_auto,f_jpg')
  if (logo && !logo.startsWith('data:')) return transform(logo, 'c_pad,b_rgb:222D38,w_1200,h_630,q_auto,f_jpg')
  return undefined
}

/** Friendly button text for a project link. */
/** "owner/repo" for a GitHub repository link, otherwise null. */
export function githubRepo(url: string) {
  const m = /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?(?:[?#].*)?$/i.exec(url)
  return m ? `${m[1]}/${m[2]}` : null
}

export function linkLabel(url: string, fallback = 'Visit website') {
  if (/play\.google\.com/i.test(url)) return 'Get it on Google Play'
  if (/apps\.apple\.com/i.test(url)) return 'Download on the App Store'
  if (/apps\.microsoft\.com/i.test(url)) return 'Get it from Microsoft Store'
  if (/chromewebstore\.google\.com/i.test(url)) return 'Add to Chrome'
  return fallback
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand('copy')
      el.remove()
      return ok
    } catch {
      return false
    }
  }
}

export function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean)
}

/** Accepts full links, bare domains (adds https://) and site paths like /images/shot.png. */
export function safeUrl(url: string) {
  const u = url.trim()
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  if (/^\/[^/]/.test(u)) return u
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(u)) return `https://${u}`
  return ''
}

export function byOrder<T extends { order: number }>(a: T, b: T) {
  return a.order - b.order
}

export function sortProjects(list: Project[]) {
  return [...list].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return a.order - b.order || b.updatedAt - a.updatedAt
  })
}

/** JSON with sorted keys, so two objects with the same data compare equal. */
export function canonicalJson(value: unknown): string {
  const sort = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(sort)
    if (v && typeof v === 'object') {
      return Object.keys(v as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          const val = (v as Record<string, unknown>)[k]
          if (val !== undefined) acc[k] = sort(val)
          return acc
        }, {})
    }
    return v
  }
  return JSON.stringify(sort(value))
}

export function downloadFile(name: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
