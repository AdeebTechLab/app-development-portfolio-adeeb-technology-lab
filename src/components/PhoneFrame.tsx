import { useState, type ReactNode } from 'react'
import { ImageOff } from 'lucide-react'
import { cn, img } from '../lib/utils'

/**
 * A simple phone outline around an app screenshot (or any content).
 * The screen keeps a 9:19.5 shape, like most modern phones; screenshots are cropped to fit.
 */
export function PhoneFrame({
  src,
  alt = '',
  width = 360,
  priority = false,
  className,
  children,
}: {
  src?: string
  alt?: string
  width?: number
  priority?: boolean
  className?: string
  children?: ReactNode
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div
      className={cn(
        'relative rounded-[1.6rem] border-[3px] border-[#3a4858] bg-[#11171d] p-[5px] shadow-[0_24px_50px_-22px_rgba(0,0,0,0.8)]',
        className,
      )}
    >
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.25rem] bg-[#f4f6f8]">
        {children ??
          (src && !failed ? (
            <img
              src={img(src, width)}
              alt={alt}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => setFailed(true)}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <span className="grid h-full w-full place-items-center bg-surface-2 text-ink-faint">
              <ImageOff className="size-6" aria-hidden="true" />
            </span>
          ))}
        {/* camera notch */}
        <span className="absolute left-1/2 top-1.5 h-[0.9rem] w-[32%] -translate-x-1/2 rounded-full bg-[#11171d]" aria-hidden="true" />
      </div>
    </div>
  )
}

/** The app's icon as a rounded square, like on a phone home screen. */
export function AppIcon({ src, name, className }: { src?: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w[0] ?? ''))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
  return (
    <span className={cn('@container grid aspect-square shrink-0 place-items-center overflow-hidden rounded-[22%] bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-black/5', className)}>
      {src && !failed ? (
        <img src={img(src, 320)} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-contain p-[10%]" />
      ) : (
        <span className="text-[28cqw] font-extrabold leading-none text-[#a35700]">{initials || 'AT'}</span>
      )}
    </span>
  )
}
