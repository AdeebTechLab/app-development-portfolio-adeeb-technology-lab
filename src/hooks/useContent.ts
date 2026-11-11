import { useMemo } from 'react'
import { useSite } from '../store/siteStore'
import { byOrder, sortProjects } from '../lib/utils'

/** Published content for the public website, sorted and with lookup maps. */
export function useContent() {
  const site = useSite()
  return useMemo(() => {
    const services = [...site.services].sort(byOrder)
    const categories = [...site.categories].sort(byOrder)
    const technologies = [...site.technologies].sort(byOrder)
    const clients = [...site.clients].sort(byOrder)
    const projects = sortProjects(site.projects.filter((p) => p.published))
    const serviceById = new Map(services.map((s) => [s.id, s]))
    const serviceBySlug = new Map(services.map((s) => [s.slug, s]))
    const categoryById = new Map(categories.map((c) => [c.id, c]))
    const categoryBySlug = new Map(categories.map((c) => [c.slug, c]))
    const clientById = new Map(clients.map((c) => [c.id, c]))
    const techByName = new Map(technologies.map((t) => [t.name.toLowerCase(), t]))
    return { site, settings: site.settings, services, categories, technologies, clients, projects, serviceById, serviceBySlug, categoryById, categoryBySlug, clientById, techByName }
  }, [site])
}
