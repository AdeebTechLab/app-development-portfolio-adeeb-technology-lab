import { Globe, Monitor } from 'lucide-react'
import { siAndroid, siApple, siGooglechrome } from 'simple-icons'
import { PLATFORM_LABELS, type Platform } from '../lib/types'
import { cn } from '../lib/utils'

const PATHS: Partial<Record<Platform, string>> = { android: siAndroid.path, ios: siApple.path, chrome: siGooglechrome.path }

export function PlatformIcon({ platform, className = 'size-4' }: { platform: Platform; className?: string }) {
  const path = PATHS[platform]
  if (path) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d={path} />
      </svg>
    )
  }
  const Icon = platform === 'windows' ? Monitor : Globe
  return <Icon className={className} aria-hidden="true" />
}

/** Small "Android · iOS" style list of the platforms an app runs on. */
export function PlatformList({ platforms, className, iconsOnly = false }: { platforms: Platform[]; className?: string; iconsOnly?: boolean }) {
  if (!platforms.length) return null
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', className)} aria-label="Platforms">
      {platforms.map((p) => (
        <li key={p} className="inline-flex items-center gap-1.5" title={PLATFORM_LABELS[p]}>
          <PlatformIcon platform={p} className="size-3.5" />
          {iconsOnly ? <span className="sr-only">{PLATFORM_LABELS[p]}</span> : PLATFORM_LABELS[p]}
        </li>
      ))}
    </ul>
  )
}
