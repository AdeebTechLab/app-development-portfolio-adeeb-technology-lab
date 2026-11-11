import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { Menu, Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ThemeToggle } from '../ThemeToggle'
import { Logo } from './Logo'

const NAV: Array<{ label: string; to: string; section?: string }> = [
  { label: 'Services', to: '/', section: 'services' },
  { label: 'Apps', to: '/work' },
  { label: 'Technologies', to: '/', section: 'tech' },
  { label: 'Process', to: '/', section: 'process' },
  { label: 'About', to: '/', section: 'about' },
  { label: 'Contact', to: '/', section: 'contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchInput = useRef<HTMLInputElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.key])

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const linkClass = (active: boolean) =>
    cn('rounded-lg px-3 py-2 text-sm font-semibold transition-colors', active ? 'text-accent-text' : 'text-ink-muted hover:text-ink')

  const search = (event: FormEvent) => {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/work?q=${encodeURIComponent(value)}` : '/work')
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <header className={cn('site-header sticky top-0 z-40 border-b transition-colors duration-200', scrolled || open ? 'border-line bg-page/85 backdrop-blur-md' : 'border-transparent bg-transparent')}>
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          const main = document.getElementById('main')
          main?.setAttribute('tabindex', '-1')
          main?.focus()
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent">
        Skip to content
      </a>
      <div className="container-x flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) =>
            item.section ? (
              <Link key={item.label} to={item.to} state={{ scrollTo: item.section }} className={linkClass(false)}>
                {item.label}
              </Link>
            ) : (
              <NavLink key={item.label} to={item.to} className={({ isActive }) => linkClass(isActive)}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <button type="button" className="btn btn-ghost btn-icon border border-line" onClick={() => { setOpen(false); setSearchOpen((value) => !value) }} aria-label="Search the site" aria-expanded={searchOpen} aria-controls="site-search" aria-keyshortcuts="Control+K Meta+K" title="Search (Ctrl/⌘ K)">
            <Search className="size-5" aria-hidden="true" />
          </button>
          <Link to="/" state={{ scrollTo: 'contact' }} className="btn btn-primary btn-sm hidden sm:inline-flex">
            Start your app
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-icon border border-line lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 px-4 pt-24" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false) }}>
          <section id="site-search" role="dialog" aria-modal="true" aria-labelledby="site-search-title" className="mx-auto max-w-2xl rounded-2xl border border-line bg-page p-5 shadow-2xl sm:p-7">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div><h2 id="site-search-title" className="text-lg font-bold text-ink">Search the site</h2><p className="text-sm text-ink-muted">Find apps by name, client, platform or technology.</p></div>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setSearchOpen(false)} aria-label="Close search"><X className="size-5" /></button>
            </div>
            <form role="search" onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="site-search-input">Search apps</label>
              <input ref={searchInput} id="site-search-input" className="input flex-1" type="search" placeholder="Try ‘education’, ‘Android’ or a technology" value={query} onChange={(event) => setQuery(event.target.value)} />
              <button type="submit" className="btn btn-primary"><Search className="size-4" aria-hidden="true" /> Search</button>
            </form>
            <p className="mt-3 text-xs text-ink-faint">Tip: press Ctrl+K or ⌘K to open search.</p>
          </section>
        </div>
      )}
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-page lg:hidden">
          <ul className="container-x grid py-3 sm:grid-cols-2 sm:gap-x-6">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link to={item.to} state={item.section ? { scrollTo: item.section } : undefined} className="flex min-h-12 items-center rounded-lg px-2 text-base font-semibold text-ink hover:text-accent-text">
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 sm:hidden">
              <Link to="/" state={{ scrollTo: 'contact' }} className="btn btn-primary w-full">
                Start your app
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
