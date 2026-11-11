import { useState } from 'react'
import { Check, Link2, Mail, Share2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { copyText } from '../lib/utils'
import { BrandIcon } from './icons/BrandIcon'

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const copy = async () => {
    const ok = await copyText(url)
    if (ok) {
      setCopied(true)
      toast('Link copied. Paste it anywhere to share this project.')
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast('Copy failed. Select the address bar and copy the link manually.', 'error')
    }
  }

  const iconBtn =
    'grid size-10 place-items-center rounded-full border border-line text-ink-muted transition-colors hover:border-accent hover:text-accent-text'

  return (
    <div className="space-y-3">
      <button type="button" onClick={copy} className="btn btn-outline btn-sm w-full">
        {copied ? <Check className="size-4 text-success" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
        {copied ? 'Link copied' : 'Copy app link'}
      </button>
      <div className="flex flex-wrap items-center gap-2">
      <a
        className={iconBtn}
        href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
      >
        <BrandIcon name="whatsapp" className="size-4" />
      </a>
      <a
        className={iconBtn}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <BrandIcon name="linkedin" className="size-4" />
      </a>
      <a
        className={iconBtn}
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <BrandIcon name="facebook" className="size-4" />
      </a>
      <a
        className={iconBtn}
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
        aria-label="Share by email"
        title="Share by email"
      >
        <Mail className="size-4" />
      </a>
      {canNativeShare && (
        <button
          type="button"
          className={iconBtn}
          aria-label="More sharing options"
          title="More sharing options"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
        >
          <Share2 className="size-4" />
        </button>
      )}
      </div>
    </div>
  )
}
