import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { profile } from '../../data'

const LINES: { k?: string; v: string }[] = [
  { v: '$ contact --yash' },
  { k: 'name', v: profile.name },
  { k: 'role', v: profile.title },
  { k: 'email', v: profile.email },
  { k: 'phone', v: profile.phone },
  { k: 'github', v: `github.com/${profile.githubUser}` },
  { k: 'location', v: profile.location },
  { k: 'status', v: 'open to opportunities ✓' },
]
const asText = (l: (typeof LINES)[number]) => (l.k ? `${l.k}: ${l.v}` : l.v)

/** ANIMATION: types the contact card out character by character when scrolled into view. */
export function TerminalWidget() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const total = LINES.reduce((s, l) => s + asText(l).length, 0)
  const [typed, setTyped] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setTyped(total)
      return
    }
    const id = window.setInterval(() => {
      setTyped((t) => {
        if (t >= total) {
          window.clearInterval(id)
          return t
        }
        return t + 2
      })
    }, 22)
    return () => window.clearInterval(id)
  }, [inView, reduce, total])

  let remaining = typed
  return (
    <div ref={ref} className="glass overflow-hidden rounded-2xl font-mono text-[13px]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-muted">yash@portfolio: ~</span>
      </div>
      {/* Full text for assistive tech; the animated copy is decorative */}
      <p className="sr-only">{LINES.map(asText).join('. ')}</p>
      <div className="min-h-[230px] space-y-1 p-5" aria-hidden="true">
        {LINES.map((l, i) => {
          const text = asText(l)
          if (remaining <= 0) return null
          const shown = text.slice(0, remaining)
          remaining -= text.length
          const done = remaining >= 0
          const keyLen = l.k ? l.k.length + 1 : 0
          return (
            <p key={i} className={i === 0 ? 'text-cyan' : 'text-fg-2'}>
              {i > 0 && <span className="text-violet">› </span>}
              {l.k ? (
                <>
                  <span className="text-magenta">{shown.slice(0, keyLen)}</span>
                  {shown.slice(keyLen)}
                </>
              ) : (
                shown
              )}
              {!done && <span className="caret ml-0.5 inline-block h-3.5 w-2 translate-y-0.5 bg-cyan" />}
            </p>
          )
        })}
        {typed >= total && (
          <p className="text-cyan">
            $ <span className="caret inline-block h-3.5 w-2 translate-y-0.5 bg-cyan" />
          </p>
        )}
      </div>
    </div>
  )
}
