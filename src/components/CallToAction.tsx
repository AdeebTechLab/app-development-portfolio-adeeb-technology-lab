import { Link } from 'react-router'
import { useWhatsApp } from '../hooks/useWhatsApp'
import { BrandIcon } from './icons/BrandIcon'

export function CallToAction({ message, title = 'Have an app idea?' }: { message?: string; title?: string }) {
  const wa = useWhatsApp()
  return (
    <section className="container-x">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-12 sm:px-12 md:py-14">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_70%)]" aria-hidden="true" />
        <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h2>
            <p className="mt-3 max-w-lg text-ink-muted">Tell us what you need on WhatsApp and we’ll reply with questions, ideas and a quote.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <a href={wa.link(message)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
              <BrandIcon name="whatsapp" className="size-[18px]" />
              Chat on WhatsApp
            </a>
            <Link to="/" state={{ scrollTo: 'contact' }} className="btn btn-outline">
              Send a message
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
