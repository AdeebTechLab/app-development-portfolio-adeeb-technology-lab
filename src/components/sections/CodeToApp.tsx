import { useEffect, useMemo, useState } from 'react'
import { BellRing, Check, CreditCard, Search } from 'lucide-react'
import { siAndroid, siApple, siGoogleplay } from 'simple-icons'
import { cn } from '../../lib/utils'

// The hero visual: a line of app code is typed, and the matching part of a phone app appears next to it.
type Tok = [string, 'tag' | 'attr' | 'str' | 'kw' | 'punct']

const LINES: Tok[][] = [
  [['App', 'tag'], ['(', 'punct']],
  [['  name', 'attr'], [': ', 'punct'], ['"Your Business"', 'str'], [',', 'punct']],
  [['  os', 'attr'], [': ', 'punct'], ['[android, ios]', 'kw'], [',', 'punct']],
  [['  login', 'attr'], [': ', 'punct'], ['true', 'kw'], [',', 'punct']],
  [['  catalog', 'attr'], [': ', 'punct'], ['true', 'kw'], [',', 'punct']],
  [['  payments', 'attr'], [': ', 'punct'], ['true', 'kw'], [',', 'punct']],
  [['  push', 'attr'], [': ', 'punct'], ['true', 'kw'], [',', 'punct']],
  [['  publish', 'attr'], [': ', 'punct'], ['store', 'kw'], [',', 'punct']],
  [[')', 'punct']],
]

const TOK_CLASS: Record<Tok[1], string> = {
  tag: 'text-accent',
  attr: 'text-[#7cc4ff]',
  str: 'text-[#9be38f]',
  kw: 'text-[#d4a5ff]',
  punct: 'text-white/45',
}

const lineText = (l: Tok[]) => l.map((t) => t[0]).join('')
const TOTAL = LINES.reduce((n, l) => n + lineText(l).length, 0)

function usePrefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function SiIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d={path} />
    </svg>
  )
}

const ITEMS = [
  { label: 'Courses', tone: 'bg-[#ffe3c2]' },
  { label: 'Offers', tone: 'bg-[#d6ecff]' },
  { label: 'Orders', tone: 'bg-[#dff5df]' },
  { label: 'Support', tone: 'bg-[#efe3ff]' },
]

export function CodeToApp({ file = 'main.dart' }: { file?: string }) {
  const reduced = usePrefersReducedMotion()
  const [typed, setTyped] = useState(reduced ? TOTAL : 0)

  useEffect(() => {
    if (reduced || typed >= TOTAL) return
    // pause briefly at the end of each line so each part of the app appears in turn
    let acc = 0
    let atLineEnd = false
    for (const l of LINES) {
      acc += lineText(l).length
      if (typed === acc) atLineEnd = true
    }
    const t = setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 700 : atLineEnd ? 420 : 34)
    return () => clearTimeout(t)
  }, [typed, reduced])

  const done = useMemo(() => {
    let acc = 0
    let count = 0
    for (const l of LINES) {
      acc += lineText(l).length
      if (typed >= acc) count++
    }
    return count
  }, [typed])

  const visibleByLine = useMemo(() => {
    let rest = typed
    return LINES.map((l) => {
      const len = lineText(l).length
      const v = Math.max(0, Math.min(len, rest))
      rest -= len
      return v
    })
  }, [typed])
  const show = (step: number) => done > step
  const appear = (step: number, from = 'translate-y-2') => (show(step) ? 'translate-y-0 translate-x-0 scale-100 opacity-100' : `${from} opacity-0`)

  return (
    <div className="relative mx-auto w-full max-w-[600px]" aria-hidden="true">
      {/* glow */}
      <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_70%_45%,var(--glow),transparent_65%)]" />

      <div className="relative flex items-center">
        {/* code editor */}
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#1a232c] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="truncate rounded-md bg-white/5 px-3 py-1 font-mono text-[0.68rem] text-white/60">{file}</span>
          </div>
          <pre className="min-h-[230px] overflow-hidden bg-black/20 py-4 pl-3 pr-14 font-mono text-[0.62rem] leading-[1.75] sm:min-h-[300px] sm:pl-4 sm:pr-24 sm:text-[0.76rem]">
            {LINES.map((line, i) => {
              let left = visibleByLine[i]!
              const caretHere = typed < TOTAL && i === done
              return (
                <div key={i} className="flex">
                  <span className="mr-3 hidden w-4 shrink-0 select-none text-right text-white/25 sm:inline">{i + 1}</span>
                  <span className="whitespace-pre">
                    {line.map(([text, kind], k) => {
                      const part = text.slice(0, Math.max(0, left))
                      left -= text.length
                      return (
                        <span key={k} className={TOK_CLASS[kind]}>
                          {part}
                        </span>
                      )
                    })}
                    {caretHere && <span className="type-caret ml-px inline-block h-[1.05em] w-[2px] translate-y-[0.2em] bg-accent" />}
                  </span>
                </div>
              )
            })}
          </pre>
        </div>

        {/* the app being built */}
        <div className="relative z-10 -ml-12 w-[42%] max-w-[210px] shrink-0 sm:-ml-20">
          {/* platform pills */}
          <div className="absolute -left-[4.5rem] top-[46%] z-20 flex flex-col items-end gap-1.5 sm:-left-24">
            <span className={cn('flex items-center gap-1 rounded-full bg-[#1a232c] px-2 py-1 text-[0.55rem] font-bold text-[#3ddc84] shadow-lg ring-1 ring-white/10 transition-all duration-500 sm:text-[0.62rem]', appear(2, '-translate-x-2'))}>
              <SiIcon path={siAndroid.path} className="size-3" /> Android
            </span>
            <span className={cn('flex items-center gap-1 rounded-full bg-[#1a232c] px-2 py-1 text-[0.55rem] font-bold text-white shadow-lg ring-1 ring-white/10 transition-all delay-150 duration-500 sm:text-[0.62rem]', appear(2, '-translate-x-2'))}>
              <SiIcon path={siApple.path} className="size-3" /> iOS
            </span>
          </div>

          <div className="rounded-[1.7rem] border-[3px] border-[#3a4858] bg-[#11171d] p-[5px] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.85)]">
            <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.3rem] bg-[#f4f6f8] text-[#222d38]">
              {/* status bar + notch */}
              <div className="flex items-center justify-between px-3 pt-1.5 text-[0.45rem] font-bold text-[#222d38]/70 sm:text-[0.5rem]">
                <span>9:41</span>
                <span className="flex items-center gap-0.5">
                  <span className="h-1.5 w-2.5 rounded-[2px] border border-current" />
                </span>
              </div>
              <span className="absolute left-1/2 top-1.5 h-[0.8rem] w-[32%] -translate-x-1/2 rounded-full bg-[#11171d]" />

              <div className={cn('px-2.5 pt-2.5 transition-all duration-500', show(0) ? 'opacity-100' : 'opacity-0')}>
                {/* app bar */}
                <div className={cn('flex items-center justify-between transition-all duration-500', appear(1, '-translate-y-2'))}>
                  <span className="flex items-center gap-1.5 text-[0.58rem] font-extrabold sm:text-[0.68rem]">
                    <span className="size-3.5 rounded-[5px] bg-[#ff8e01]" />
                    Your Business
                  </span>
                  <Search className="size-3 text-[#5b6570]" />
                </div>

                {/* signed-in welcome */}
                <div className={cn('mt-2.5 rounded-xl bg-[#222d38] p-2.5 text-white transition-all duration-500', appear(3))}>
                  <span className="flex items-center gap-1.5">
                    <span className="grid size-5 place-items-center rounded-full bg-[#ff8e01] text-[0.45rem] font-extrabold text-[#1a232c]">SA</span>
                    <span className="min-w-0">
                      <span className="block text-[0.45rem] text-white/60 sm:text-[0.5rem]">Welcome back</span>
                      <span className="block truncate text-[0.58rem] font-bold sm:text-[0.66rem]">Sara Ahmed</span>
                    </span>
                  </span>
                </div>

                {/* catalog */}
                <div className={cn('mt-2 grid grid-cols-2 gap-1.5 transition-all duration-500', appear(4))}>
                  {ITEMS.map((it) => (
                    <span key={it.label} className="rounded-lg bg-white p-1.5 shadow-sm">
                      <span className={cn('block h-5 rounded-md sm:h-7', it.tone)} />
                      <span className="mt-1 block text-[0.45rem] font-bold sm:text-[0.52rem]">{it.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* payments */}
              <span
                className={cn(
                  'absolute inset-x-2.5 bottom-6 flex items-center justify-center gap-1 rounded-lg bg-[#ff8e01] py-1.5 text-[0.52rem] font-extrabold text-[#1a232c] shadow transition-all duration-500 sm:text-[0.6rem]',
                  appear(5),
                )}
              >
                <CreditCard className="size-3" /> Pay securely
              </span>
              <span className="absolute bottom-1.5 left-1/2 h-1 w-1/3 -translate-x-1/2 rounded-full bg-[#222d38]/40" />

              {/* push notification */}
              <span
                className={cn(
                  'absolute inset-x-1.5 top-5 flex items-start gap-1.5 rounded-xl bg-white/95 p-1.5 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur transition-all duration-500',
                  show(6) ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0',
                )}
              >
                <span className="grid size-4 shrink-0 place-items-center rounded-[5px] bg-[#ff8e01] text-[#1a232c]">
                  <BellRing className="size-2.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.48rem] font-extrabold sm:text-[0.54rem]">Order confirmed</span>
                  <span className="block truncate text-[0.42rem] text-[#5b6570] sm:text-[0.48rem]">Thanks! We’re preparing it now.</span>
                </span>
              </span>
            </div>
          </div>

          {/* published */}
          <span
            className={cn(
              'absolute -bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[#157a3d] px-2.5 py-1 text-[0.55rem] font-bold text-white shadow-lg transition-all duration-500 sm:text-[0.62rem]',
              show(7) ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
            )}
          >
            <SiIcon path={siGoogleplay.path} className="size-3" /> Live on the store <Check className="size-3" />
          </span>
        </div>
      </div>
    </div>
  )
}
