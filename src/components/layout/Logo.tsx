import { useState } from 'react'
import { Link } from 'react-router'
import { LOGO_URL } from '../../config/site'
import { useSite } from '../../store/siteStore'
import { cn, img } from '../../lib/utils'

export function LogoMark({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className={cn('grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-page-deep ring-2 ring-accent', className)}>
      {failed ? (
        <span className="text-sm font-extrabold text-accent-text">ATL</span>
      ) : (
        <img src={img(LOGO_URL, 120)} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      )}
    </span>
  )
}

export function Logo({ to = '/', subtitle, small }: { to?: string; subtitle?: string; small?: boolean }) {
  const { settings } = useSite()
  return (
    <Link to={to} className="flex min-w-0 items-center gap-3 rounded-lg" aria-label={`${settings.companyName} home`}>
      <LogoMark />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className={cn('truncate font-extrabold tracking-tight text-ink', small ? 'text-sm' : 'text-[0.95rem]')}>{settings.companyName}</span>
        <span className="truncate text-xs font-medium text-ink-faint">{subtitle ?? 'App Development'}</span>
      </span>
    </Link>
  )
}
