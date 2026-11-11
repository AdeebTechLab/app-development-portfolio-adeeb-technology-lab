import { useState } from 'react'
import type { Project } from '../lib/types'
import { cn, img } from '../lib/utils'
import { AppIcon, PhoneFrame } from './PhoneFrame'

/**
 * The picture for an app project:
 * - its cover image (a wide banner, like a Play Store feature graphic) when there is one,
 * - otherwise its first screenshots in phone frames on a branded panel,
 * - otherwise its app icon on a branded panel,
 * - otherwise the project's initials.
 */
export function ProjectVisual({
  project,
  className,
  width = 800,
  priority = false,
  compact = false,
}: {
  project: Pick<Project, 'title' | 'coverImage' | 'logo'> & Partial<Pick<Project, 'gallery'>>
  className?: string
  width?: number
  priority?: boolean
  /** For small thumbnails (admin lists). */
  compact?: boolean
}) {
  const [coverFailed, setCoverFailed] = useState(false)
  const cover = project.coverImage?.url

  if (cover && !coverFailed) {
    return (
      <img
        src={img(cover, width)}
        alt={project.coverImage?.alt || project.title}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setCoverFailed(true)}
        className={cn('h-full w-full object-cover', className)}
      />
    )
  }

  const shots = (project.gallery ?? []).slice(0, compact ? 1 : 3)

  return (
    <div className={cn('relative grid h-full w-full place-items-center overflow-hidden bg-page-deep', className)}>
      {/* circuit traces + glow */}
      <svg className="absolute inset-0 h-full w-full text-accent/25" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M0 60h90l20 20h60M400 70h-80l-24 24h-50M0 170h70l26-26h52M400 160h-96l-18 18h-40" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="170" cy="80" r="2.5" fill="currentColor" />
        <circle cx="246" cy="94" r="2.5" fill="currentColor" />
        <circle cx="148" cy="144" r="2.5" fill="currentColor" />
        <circle cx="246" cy="178" r="2.5" fill="currentColor" />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,var(--glow),transparent_60%)]" />

      {shots.length > 0 ? (
        compact ? (
          <PhoneFrame src={shots[0]!.url} width={160} className="relative h-[92%] w-auto rounded-[0.6rem] border-2 p-[2px] [&>div]:h-full [&>div]:rounded-[0.45rem]" />
        ) : (
          <div className="relative flex h-full w-full items-end justify-center gap-[3%] px-[6%] pt-[7%]">
            {shots.map((s, i) => (
              <PhoneFrame
                key={s.url + i}
                src={s.url}
                alt={i === 0 ? s.alt || project.title : ''}
                width={400}
                priority={priority && i === 0}
                className={cn(
                  'w-[26%] max-w-48 shrink-0 translate-y-[12%]',
                  shots.length === 3 && i !== 1 && 'translate-y-[22%] opacity-90',
                  shots.length === 3 && i === 1 && 'w-[29%]',
                )}
              />
            ))}
          </div>
        )
      ) : (
        <AppIcon
          src={project.logo}
          name={project.title}
          className={cn('relative', compact ? 'w-[52%] rounded-[24%]' : 'w-[30%] min-w-16 max-w-36 ring-[3px] ring-accent/70')}
        />
      )}
    </div>
  )
}
