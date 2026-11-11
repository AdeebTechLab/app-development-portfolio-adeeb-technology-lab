import { Link } from 'react-router'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useContent } from '../../hooks/useContent'
import { useWhatsApp } from '../../hooks/useWhatsApp'
import { safeUrl } from '../../lib/utils'
import { BrandIcon } from '../icons/BrandIcon'
import { Logo } from './Logo'

const EXPLORE = [
  { label: 'Services', section: 'services' },
  { label: 'Technologies', section: 'tech' },
  { label: 'Process', section: 'process' },
  { label: 'About', section: 'about' },
  { label: 'Contact', section: 'contact' },
]

export function Footer() {
  const { settings, services } = useContent()
  const wa = useWhatsApp()
  const year = new Date().getFullYear()
  const lastUpdated = new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeZone: 'Asia/Karachi' }).format(new Date(__BUILD_DATE__))

  return (
    <footer className="site-footer mt-12 border-t border-line bg-page-deep/60">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1.3fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm text-ink-muted">
            Android, iOS and cross-platform apps for businesses, schools and brands in Pakistan and abroad. Building since {settings.established}.
          </p>
          {settings.socials.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Social media">
              {settings.socials.map((s) => {
                const href = safeUrl(s.url)
                if (!href) return null
                return (
                  <li key={s.name + s.url}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid size-9 place-items-center rounded-full border border-line text-ink-muted transition-colors hover:border-accent hover:text-accent-text"
                      aria-label={s.name}
                      title={s.name}
                    >
                      <BrandIcon name={s.icon} className="size-4" />
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold text-ink">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/work" className="text-ink-muted hover:text-accent-text">
                Our apps
              </Link>
            </li>
            {EXPLORE.map((e) => (
              <li key={e.label}>
                <Link to="/" state={{ scrollTo: e.section }} className="text-ink-muted hover:text-accent-text">
                  {e.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold text-ink">App services</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.slice(0, 7).map((s) => (
              <li key={s.id}>
                <Link to={`/work?service=${s.slug}`} className="text-ink-muted hover:text-accent-text">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold text-ink">Get in touch</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-muted">
            <li>
              <a href={wa.link()} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-accent-text">
                <BrandIcon name="whatsapp" className="mt-0.5 size-4 shrink-0 text-whatsapp" />
                WhatsApp {settings.whatsappDisplay}
              </a>
            </li>
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-start gap-3 break-all hover:text-accent-text">
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
                  {settings.email}
                </a>
              </li>
            )}
            {settings.offices.map((o) => (
              <li key={o.city + o.phone} className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-ink">{o.city}</span>
                  {o.phone && (
                    <a href={`tel:${o.phone.replace(/[^\d+]/g, '')}`} className="ml-1 hover:text-accent-text">
                      <Phone className="mb-0.5 mr-1 inline size-3.5" aria-hidden="true" />
                      {o.phone}
                    </a>
                  )}
                </span>
              </li>
            ))}
            {settings.hours && (
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
                {settings.hours}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p className="pl-12 sm:pl-0">
            {/* The © sign is the hidden link to the admin panel */}
            <Link to="/admin" rel="nofollow" aria-label="Admin panel" className="cursor-text rounded-sm no-underline hover:text-ink-faint focus-visible:text-ink">
              ©
            </Link>{' '}
            {year} {settings.companyName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 sm:justify-end"><p>{settings.tagline}</p><p>Last updated {lastUpdated}</p></div>
        </div>
      </div>
    </footer>
  )
}
