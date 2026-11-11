import { Link } from 'react-router'
import { useSeo } from '../lib/seo'

export default function NotFound({
  title = 'This page doesn’t exist',
  text = 'The link may be old or mistyped. Head back to the homepage or browse our work.',
}: {
  title?: string
  text?: string
}) {
  useSeo({ title: 'Page not found', noindex: true })
  return (
    <section className="container-x grid min-h-[55vh] place-items-center py-16 text-center">
      <div className="max-w-lg">
        <p className="text-6xl font-extrabold text-accent-text">404</p>
        <h1 className="mt-4 text-3xl font-extrabold text-ink">{title}</h1>
        <p className="mt-3 text-ink-muted">{text}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/work" className="btn btn-primary">
            Browse our work
          </Link>
          <Link to="/" className="btn btn-outline">
            Go to homepage
          </Link>
        </div>
      </div>
    </section>
  )
}
