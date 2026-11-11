import { useId, useRef, useState, type DragEvent } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Link2, LoaderCircle, Star, Trash } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import type { ImageItem } from '../../lib/types'
import { dataUrlBytes, imageToData, validateImage } from '../../lib/upload'
import { cn, formatBytes, img, safeUrl } from '../../lib/utils'

/** Drop zone + file picker + "paste a link". */
function Uploader({ multiple, onAdd, compact, maxSide }: { multiple?: boolean; onAdd: (urls: string[]) => void; compact?: boolean; maxSide?: number }) {
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const linkId = useId()
  const [busy, setBusy] = useState(0)
  const [over, setOver] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [link, setLink] = useState('')

  const handle = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, multiple ? 12 : 1)
    const valid: File[] = []
    for (const f of list) {
      const problem = validateImage(f)
      if (problem) toast(problem, 'error')
      else valid.push(f)
    }
    if (!valid.length) return
    setBusy(valid.length)
    const urls: string[] = []
    for (const f of valid) {
      try {
        urls.push(await imageToData(f, maxSide))
      } catch (err) {
        toast(err instanceof Error ? err.message : 'That image could not be added.', 'error')
      } finally {
        setBusy((b) => b - 1)
      }
    }
    if (urls.length) onAdd(urls)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    if (e.dataTransfer.files?.length) void handle(e.dataTransfer.files)
  }

  const addLink = () => {
    const url = safeUrl(link)
    if (!url) {
      toast('Paste a full image link starting with https://, or a site path like /images/photo.jpg', 'error')
      return
    }
    onAdd([url])
    setLink('')
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition-colors',
          compact ? 'py-5' : 'py-8',
          over ? 'border-accent bg-accent-soft' : 'border-line-strong',
        )}
      >
        {busy > 0 ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <LoaderCircle className="size-4 animate-spin text-accent-text" aria-hidden="true" />
            Adding {busy > 1 ? `${busy} images` : 'image'}…
          </p>
        ) : (
          <>
            <ImagePlus className="size-6 text-accent-text" aria-hidden="true" />
            <p className="text-sm text-ink-muted">
              Drag {multiple ? 'images' : 'an image'} here or{' '}
              <button type="button" className="font-semibold text-accent-text underline-offset-2 hover:underline" onClick={() => input.current?.click()}>
                choose {multiple ? 'files' : 'a file'}
              </button>
            </p>
            <p className="text-xs text-ink-faint">JPG, PNG, WebP, GIF or SVG. Images are resized and saved in this browser.</p>
          </>
        )}
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
          multiple={multiple}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            if (e.target.files?.length) void handle(e.target.files)
            e.target.value = ''
          }}
        />
      </div>
      {linkOpen ? (
        <div className="flex gap-2">
          <label className="sr-only" htmlFor={linkId}>
            Image link
          </label>
          <input
            id={linkId}
            className="input"
            placeholder="https://… or /images/file.jpg"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addLink()
              }
            }}
          />
          <button type="button" className="btn btn-outline" onClick={addLink}>
            Add
          </button>
        </div>
      ) : (
        <button type="button" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink" onClick={() => setLinkOpen(true)}>
          <Link2 className="size-3.5" aria-hidden="true" />
          Or paste an image link (saves browser space)
        </button>
      )}
    </div>
  )
}

function SizeNote({ url }: { url: string }) {
  const bytes = dataUrlBytes(url)
  if (!bytes) return null
  return <span className="text-xs text-ink-faint">Saved in this browser, {formatBytes(bytes)}</span>
}

export function CoverImageInput({ value, onChange }: { value: ImageItem | null; onChange: (v: ImageItem | null) => void }) {
  const altId = useId()
  if (!value) return <Uploader maxSide={1600} onAdd={([url]) => url && onChange({ url, alt: '' })} />
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="aspect-[2/1] w-full overflow-hidden rounded-xl border border-line bg-page-deep sm:w-64">
        <img src={img(value.url, 600)} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 space-y-3">
        <div>
          <label htmlFor={altId} className="field-label">
            Describe the image <span className="font-normal text-ink-faint">(for Google and screen readers)</span>
          </label>
          <input id={altId} className="input" value={value.alt} onChange={(e) => onChange({ ...value, alt: e.target.value })} placeholder="Promo banner showing the app’s home screen" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => onChange(null)}>
            <Trash className="size-4" aria-hidden="true" />
            Remove image
          </button>
          <SizeNote url={value.url} />
        </div>
      </div>
    </div>
  )
}

/** A single image such as a logo or a photo, shown round (or as a rounded square for app icons). */
export function RoundImageInput({ value, onChange, label = 'image', photo, square }: { value: string; onChange: (v: string) => void; label?: string; photo?: boolean; square?: boolean }) {
  if (!value) return <Uploader compact maxSide={photo ? 600 : 400} onAdd={([url]) => url && onChange(url)} />
  return (
    <div className="flex items-center gap-4">
      <span className={cn('grid size-20 shrink-0 place-items-center overflow-hidden ring-2 ring-accent', square ? 'rounded-[22%]' : 'rounded-full', photo ? 'bg-page-deep' : 'bg-white p-2')}>
        <img src={img(value, 240)} alt="" className={cn('h-full w-full', photo ? 'object-cover' : 'object-contain')} />
      </span>
      <div className="flex flex-col items-start gap-1">
        <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => onChange('')}>
          <Trash className="size-4" aria-hidden="true" />
          Remove {label}
        </button>
        <SizeNote url={value} />
      </div>
    </div>
  )
}

export function GalleryInput({
  value,
  onChange,
  onAppend,
  onMakeCover,
}: {
  value: ImageItem[]
  onChange: (v: ImageItem[]) => void
  onAppend: (images: ImageItem[]) => void
  /** Offer a "Cover" button that turns a screenshot into the cover image. */
  onMakeCover?: (image: ImageItem) => void
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j]!, next[i]!]
    onChange(next)
  }
  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {value.map((im, i) => (
            <li key={`${im.url.slice(0, 80)}-${i}`} className="flex gap-3 rounded-xl border border-line p-3">
              <div className="aspect-[9/19.5] w-14 shrink-0 overflow-hidden rounded-lg border border-line-strong bg-page-deep">
                <img src={img(im.url, 240)} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <input
                  aria-label={`Description for image ${i + 1}`}
                  className="input min-h-9 py-1.5 text-sm"
                  placeholder="Describe this screen, e.g. Home screen"
                  value={im.alt}
                  onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))}
                />
                <div className="flex flex-wrap gap-1">
                  <button type="button" className="btn btn-ghost btn-icon size-8 min-h-8" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move image ${i + 1} earlier`}>
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" className="btn btn-ghost btn-icon size-8 min-h-8" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Move image ${i + 1} later`}>
                    <ArrowDown className="size-4" />
                  </button>
                  {onMakeCover && (
                    <button type="button" className="btn btn-ghost btn-sm min-h-8 px-2" onClick={() => onMakeCover(im)} title="Use as cover image">
                      <Star className="size-4" aria-hidden="true" />
                      <span className="text-xs">Cover</span>
                    </button>
                  )}
                  <button type="button" className="btn btn-ghost btn-icon ml-auto size-8 min-h-8 text-danger" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label={`Remove image ${i + 1}`}>
                    <Trash className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Uploader multiple compact={value.length > 0} maxSide={1600} onAdd={(urls) => onAppend(urls.map((url) => ({ url, alt: '' })))} />
    </div>
  )
}
