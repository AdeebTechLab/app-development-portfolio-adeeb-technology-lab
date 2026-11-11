import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { ImageItem } from '../lib/types'
import { img } from '../lib/utils'

export function Lightbox({
  images,
  index,
  onClose,
  onChange,
}: {
  images: ImageItem[]
  index: number
  onClose: () => void
  onChange: (i: number) => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const current = images[index]
  const many = images.length > 1

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && many) onChange((index + 1) % images.length)
      if (e.key === 'ArrowLeft' && many) onChange((index - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, images.length, many, onChange, onClose])

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80" onClick={(e) => e.stopPropagation()}>
        <span>
          {many ? `${index + 1} of ${images.length}` : ''}
        </span>
        <button ref={closeRef} type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Close image viewer">
          <X className="size-6" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-16">
        <img
          src={img(current.url, 2000)}
          alt={current.alt}
          className="max-h-full max-w-full rounded-lg object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        {many && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange((index - 1 + images.length) % images.length)
              }}
              className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange((index + 1) % images.length)
              }}
              className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4"
              aria-label="Next image"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>
      {current.alt && (
        <p className="px-4 pb-5 text-center text-sm text-white/75" onClick={(e) => e.stopPropagation()}>
          {current.alt}
        </p>
      )}
    </div>
  )
}
