import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Project, ProjectCategory } from '../lib/types'
import { STATUS_LABELS } from '../lib/types'
import { cn } from '../lib/utils'
import { PlatformList } from './PlatformIcon'
import { ProjectVisual } from './ProjectVisual'

export function ProjectCard({ project, category, className, preview }: { project: Project; category?: ProjectCategory; className?: string; preview?: boolean }) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-200 hover:border-accent/60',
        className,
      )}
    >
      <div className="relative aspect-[2/1] overflow-hidden border-b border-line">
        <ProjectVisual project={project} className="transition-transform duration-500 group-hover:scale-[1.03]" />
        {project.status !== 'completed' && (
          <span className="absolute left-3 top-3 rounded-full bg-page-deep/90 px-2.5 py-1 text-xs font-semibold text-accent-text backdrop-blur">
            {STATUS_LABELS[project.status]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {category && <p className="text-xs font-semibold text-accent-text">{category.name}</p>}
        <h3 className="text-lg font-bold text-ink">
          {preview ? (
            project.title
          ) : (
            <Link to={`/work/${project.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {project.title}
            </Link>
          )}
        </h3>
        <p className="line-clamp-2 text-sm text-ink-muted">{project.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {project.platforms.length > 0 ? (
            <PlatformList platforms={project.platforms} className="min-w-0 text-xs font-semibold text-ink-faint" />
          ) : (
            <p className="truncate text-xs text-ink-faint">{project.technologies.slice(0, 3).join(', ')}</p>
          )}
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-ink-muted transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </div>
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-accent group-has-[a:focus-visible]:ring-2" aria-hidden="true" />
    </article>
  )
}
