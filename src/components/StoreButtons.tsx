import { siApple, siGoogleplay } from 'simple-icons'
import { cn } from '../lib/utils'

const STORES = {
  play: { path: siGoogleplay.path, small: 'Get it on', name: 'Google Play' },
  apple: { path: siApple.path, small: 'Download on the', name: 'App Store' },
}

/** A store button in the familiar black badge style. */
export function StoreButton({ store, href, className }: { store: keyof typeof STORES; href: string; className?: string }) {
  const s = STORES[store]
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex min-h-12 items-center gap-2.5 rounded-xl border border-white/25 bg-black px-4 py-1.5 text-white transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-6 shrink-0" fill="currentColor" aria-hidden="true">
        <path d={s.path} />
      </svg>
      <span className="flex flex-col text-left leading-tight">
        <span className="text-[0.62rem] font-medium uppercase tracking-wide text-white/75">{s.small}</span>
        <span className="text-base font-bold">{s.name}</span>
      </span>
    </a>
  )
}
