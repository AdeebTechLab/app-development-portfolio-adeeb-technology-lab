import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash } from 'lucide-react'
import { useSave } from '../../hooks/useSave'
import type { SiteSettings } from '../../lib/types'
import { canonicalJson, safeUrl } from '../../lib/utils'
import { useSite } from '../../store/siteStore'
import { RoundImageInput } from '../../components/admin/ImageInputs'
import { TagInput } from '../../components/admin/TagInput'
import { Field, PageHeader, Panel } from '../../components/admin/ui'
import { BrandIcon, SOCIAL_ICONS } from '../../components/icons/BrandIcon'

const SECTIONS = [
  { id: 'general', label: 'Company' },
  { id: 'hero', label: 'Hero' },
  { id: 'contact', label: 'Contact & WhatsApp' },
  { id: 'ceo', label: 'CEO section' },
  { id: 'process', label: 'Process' },
  { id: 'socials', label: 'Social links' },
]

function moveItem<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [x] = next.splice(from, 1)
  next.splice(to, 0, x!)
  return next
}

export default function ContentAdmin() {
  const site = useSite()
  const save = useSave()
  const [form, setForm] = useState<SiteSettings>(site.settings)
  const [error, setError] = useState('')
  const savedRef = useRef(canonicalJson(site.settings))
  const dirty = useMemo(() => canonicalJson(form) !== savedRef.current, [form])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setForm((f) => ({ ...f, [k]: v }))
  const setCeo = <K extends keyof SiteSettings['ceo']>(k: K, v: SiteSettings['ceo'][K]) => setForm((f) => ({ ...f, ceo: { ...f.ceo, [k]: v } }))

  const submit = () => {
    setError('')
    const number = form.whatsappNumber.replace(/\D/g, '')
    if (!form.companyName.trim()) return setError('Add the company name.')
    if (!form.heroTitle.trim()) return setError('Add the main heading for the hero.')
    if (number.length < 10) return setError('Enter the WhatsApp number with country code, for example 923092333121.')
    const clean: SiteSettings = {
      ...form,
      companyName: form.companyName.trim(),
      heroTitle: form.heroTitle.trim(),
      whatsappNumber: number,
      email: form.email.trim(),
      offices: form.offices.filter((o) => o.city.trim() || o.address.trim() || o.phone.trim()),
      socials: form.socials.filter((s) => s.url.trim()).map((s) => ({ ...s, url: safeUrl(s.url) || s.url.trim() })),
      process: form.process.filter((p) => p.title.trim()),
      ceo: { ...form.ceo, portfolioUrl: safeUrl(form.ceo.portfolioUrl), linkedinUrl: safeUrl(form.ceo.linkedinUrl) },
    }
    if (save((d) => ({ ...d, settings: clean }), 'Site content saved.')) {
      savedRef.current = canonicalJson(clean)
      setForm(clean)
    }
  }

  return (
    <>
      <PageHeader title="Site content" description="Edit the text and details shown across the portfolio." />
      <nav aria-label="Sections" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => document.getElementById(`c-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="chip shrink-0 py-1.5 hover:border-accent hover:text-ink"
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="space-y-6">
        <Panel id="c-general" title="Company">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Company name" required htmlFor="g-name">
              <input id="g-name" className="input" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
            </Field>
            <Field label="Building since (year)" required htmlFor="g-year">
              <input id="g-year" type="number" min={1990} max={2100} className="input" value={form.established} onChange={(e) => set('established', Number(e.target.value) || form.established)} />
            </Field>
          </div>
          <Field label="Tagline" htmlFor="g-tagline" hint="Shown above the hero heading and in the footer.">
            <input id="g-tagline" className="input" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
        </Panel>

        <Panel id="c-hero" title="Hero" description="The first thing visitors see.">
          <Field label="Main heading" required htmlFor="h-title" counter={{ value: form.heroTitle.length, max: 70 }}>
            <input id="h-title" className="input" value={form.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} />
          </Field>
          <Field label="Typing words" htmlFor="h-words" hint="Shown after “We build”, one at a time. Press Enter after each.">
            <TagInput id="h-words" value={form.heroWords} onChange={(v) => set('heroWords', v)} placeholder="Android apps" />
          </Field>
          <Field label="Introduction" htmlFor="h-text" counter={{ value: form.heroText.length, max: 260 }}>
            <textarea id="h-text" className="input" value={form.heroText} onChange={(e) => set('heroText', e.target.value)} />
          </Field>
        </Panel>

        <Panel id="c-contact" title="Contact & WhatsApp" description="Used by the WhatsApp button, the contact form and the footer.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="WhatsApp number" required htmlFor="w-number" hint="Digits only, with country code, for example 923092333121.">
              <input id="w-number" className="input" inputMode="numeric" value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} />
            </Field>
            <Field label="Number as shown" htmlFor="w-display">
              <input id="w-display" className="input" value={form.whatsappDisplay} onChange={(e) => set('whatsappDisplay', e.target.value)} placeholder="+92 309 2333121" />
            </Field>
          </div>
          <Field label="Default WhatsApp message" htmlFor="w-message">
            <input id="w-message" className="input" value={form.whatsappMessage} onChange={(e) => set('whatsappMessage', e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" htmlFor="w-email">
              <input id="w-email" type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Opening hours" htmlFor="w-hours">
              <input id="w-hours" className="input" value={form.hours} onChange={(e) => set('hours', e.target.value)} />
            </Field>
          </div>
          <fieldset>
            <legend className="field-label">Offices</legend>
            <div className="space-y-3">
              {form.offices.map((o, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[140px_1fr_160px_auto]">
                  <input className="input" aria-label={`Office ${i + 1} city`} placeholder="City" value={o.city} onChange={(e) => set('offices', form.offices.map((x, k) => (k === i ? { ...x, city: e.target.value } : x)))} />
                  <input className="input" aria-label={`Office ${i + 1} address`} placeholder="Address" value={o.address} onChange={(e) => set('offices', form.offices.map((x, k) => (k === i ? { ...x, address: e.target.value } : x)))} />
                  <input className="input" aria-label={`Office ${i + 1} phone`} placeholder="Phone" value={o.phone} onChange={(e) => set('offices', form.offices.map((x, k) => (k === i ? { ...x, phone: e.target.value } : x)))} />
                  <button type="button" className="btn btn-ghost btn-icon text-danger" onClick={() => set('offices', form.offices.filter((_, k) => k !== i))} aria-label={`Remove office ${i + 1}`}>
                    <Trash className="size-4" />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={() => set('offices', [...form.offices, { city: '', address: '', phone: '' }])}>
                <Plus className="size-4" aria-hidden="true" />
                Add office
              </button>
            </div>
          </fieldset>
        </Panel>

        <Panel id="c-ceo" title="CEO section">
          <Field label="Photo">
            <RoundImageInput value={form.ceo.photo} onChange={(v) => setCeo('photo', v)} label="photo" photo />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="ceo-name" hint="Leave empty to hide the CEO section.">
              <input id="ceo-name" className="input" value={form.ceo.name} onChange={(e) => setCeo('name', e.target.value)} />
            </Field>
            <Field label="Role" htmlFor="ceo-role">
              <input id="ceo-role" className="input" value={form.ceo.role} onChange={(e) => setCeo('role', e.target.value)} placeholder="CEO & Founder" />
            </Field>
          </div>
          <Field label="About" htmlFor="ceo-bio" hint="Leave an empty line between paragraphs.">
            <textarea id="ceo-bio" className="input min-h-36" value={form.ceo.bio} onChange={(e) => setCeo('bio', e.target.value)} />
          </Field>
          <Field label="Highlights" htmlFor="ceo-highlights" hint="Short points with a tick. Press Enter after each.">
            <TagInput id="ceo-highlights" value={form.ceo.highlights} onChange={(v) => setCeo('highlights', v)} placeholder="Founded the company in 2016" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Portfolio link" htmlFor="ceo-portfolio">
              <input id="ceo-portfolio" className="input" inputMode="url" value={form.ceo.portfolioUrl} onChange={(e) => setCeo('portfolioUrl', e.target.value)} placeholder="https://" />
            </Field>
            <Field label="LinkedIn link" htmlFor="ceo-linkedin">
              <input id="ceo-linkedin" className="input" inputMode="url" value={form.ceo.linkedinUrl} onChange={(e) => setCeo('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/…" />
            </Field>
          </div>
        </Panel>

        <Panel id="c-process" title="Process" description="The steps shown in “How we build your app”.">
          <ol className="space-y-3">
            {form.process.map((p, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-line p-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-accent text-xs font-extrabold text-accent-text">{i + 1}</span>
                <div className="min-w-0 flex-1 space-y-2">
                  <input className="input" aria-label={`Step ${i + 1} title`} placeholder="Step title" value={p.title} onChange={(e) => set('process', form.process.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} />
                  <textarea className="input min-h-16" aria-label={`Step ${i + 1} description`} placeholder="What happens in this step" value={p.text} onChange={(e) => set('process', form.process.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)))} />
                </div>
                <div className="flex flex-col gap-1">
                  <button type="button" className="btn btn-ghost btn-icon size-8 min-h-8" onClick={() => set('process', moveItem(form.process, i, i - 1))} disabled={i === 0} aria-label={`Move step ${i + 1} up`}>
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" className="btn btn-ghost btn-icon size-8 min-h-8" onClick={() => set('process', moveItem(form.process, i, i + 1))} disabled={i === form.process.length - 1} aria-label={`Move step ${i + 1} down`}>
                    <ArrowDown className="size-4" />
                  </button>
                  <button type="button" className="btn btn-ghost btn-icon size-8 min-h-8 text-danger" onClick={() => set('process', form.process.filter((_, k) => k !== i))} aria-label={`Remove step ${i + 1}`}>
                    <Trash className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => set('process', [...form.process, { title: '', text: '' }])}>
            <Plus className="size-4" aria-hidden="true" />
            Add step
          </button>
        </Panel>

        <Panel id="c-socials" title="Social links" description="Shown as icons in the footer.">
          <div className="space-y-2">
            {form.socials.map((s, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:grid-cols-[auto_160px_1fr_auto]">
                <span className="grid size-10 place-items-center rounded-full border border-line text-ink-muted">
                  <BrandIcon name={s.icon} className="size-4" />
                </span>
                <select
                  className="input"
                  aria-label={`Platform for link ${i + 1}`}
                  value={s.icon}
                  onChange={(e) => {
                    const icon = e.target.value
                    const name = icon === 'x' ? 'X' : icon === 'website' ? 'Website' : icon === 'linkedin' ? 'LinkedIn' : icon === 'youtube' ? 'YouTube' : icon === 'tiktok' ? 'TikTok' : icon === 'github' ? 'GitHub' : icon === 'whatsapp' ? 'WhatsApp' : icon === 'googleplay' ? 'Google Play' : icon[0]!.toUpperCase() + icon.slice(1)
                    set('socials', form.socials.map((x, k) => (k === i ? { ...x, icon, name } : x)))
                  }}
                >
                  {SOCIAL_ICONS.map((k) => (
                    <option key={k} value={k}>
                      {k === 'x' ? 'X' : k === 'googleplay' ? 'Google Play' : k[0]!.toUpperCase() + k.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  className="input col-span-2 sm:col-span-1"
                  aria-label={`Address for link ${i + 1}`}
                  placeholder="https://"
                  inputMode="url"
                  value={s.url}
                  onChange={(e) => set('socials', form.socials.map((x, k) => (k === i ? { ...x, url: e.target.value } : x)))}
                />
                <button type="button" className="btn btn-ghost btn-icon text-danger max-sm:col-start-3 max-sm:row-start-1" onClick={() => set('socials', form.socials.filter((_, k) => k !== i))} aria-label={`Remove link ${i + 1}`}>
                  <Trash className="size-4" />
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={() => set('socials', [...form.socials, { name: 'Website', icon: 'website', url: '' }])}>
              <Plus className="size-4" aria-hidden="true" />
              Add link
            </button>
          </div>
        </Panel>
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-line bg-page/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <p className="min-w-0 text-sm text-ink-muted" aria-live="polite">
          {error ? <span className="text-danger">{error}</span> : dirty ? 'You have unsaved changes.' : 'All changes saved.'}
        </p>
        <div className="flex shrink-0 gap-2">
          {dirty && (
            <button type="button" className="btn btn-ghost" onClick={() => setForm(site.settings)}>
              Undo
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={submit} disabled={!dirty}>
            Save changes
          </button>
        </div>
      </div>
    </>
  )
}
