export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface" aria-hidden="true">
      <div className="aspect-[16/10] animate-pulse bg-surface-2" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  )
}

export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status">
      <span className="flex items-center gap-3 text-sm text-ink-muted">
        <span className="size-5 animate-spin rounded-full border-2 border-line-strong border-t-accent" aria-hidden="true" />
        {label}…
      </span>
    </div>
  )
}
