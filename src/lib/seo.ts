import { useEffect } from 'react'
import { DEFAULT_DESCRIPTION, OG_IMAGE, SITE_URL } from '../config/site'
import { getSite } from '../store/siteStore'

interface SeoOptions {
  title?: string
  description?: string
  image?: string
  path?: string
  noindex?: boolean
  type?: 'website' | 'article'
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

/** Sets the page title, description, canonical URL and link-preview tags. */
export function useSeo({ title, description, image, path, noindex, type = 'website' }: SeoOptions) {
  useEffect(() => {
    const company = getSite().settings.companyName
    const fullTitle = title ? `${title} | ${company}` : `App Development Company | ${company}`
    const desc = (description || DEFAULT_DESCRIPTION).slice(0, 300)
    const url = `${SITE_URL}${path ?? ''}`
    const img = image || OG_IMAGE

    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', img)
    setMeta('property', 'og:type', type)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image', img)
    if (path !== undefined) setCanonical(url)
  }, [title, description, image, path, noindex, type])
}
