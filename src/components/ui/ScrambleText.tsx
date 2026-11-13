import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFXYZ'

type ScrambleTextProps = {
  text: string
  className?: string
  /** Total decode time in ms. */
  duration?: number
  delay?: number
}

const scramble = (text: string) =>
  text.replace(/\S/g, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)])

/**
 * ANIMATION: text scramble / decode.
 * When the element enters the viewport, characters resolve left→right
 * while unresolved ones flicker through GLYPHS. Screen readers get the
 * real text from a visually-hidden copy.
 */
export function ScrambleText({ text, className = '', duration = 900, delay = 0 }: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(() => (reduce ? text : scramble(text)))

  useEffect(() => {
    if (reduce) {
      setDisplay(text)
      return
    }
    if (!inView) return
    let raf = 0
    let start = 0
    const tick = (now: number) => {
      if (!start) start = now + delay
      const p = Math.max(0, Math.min(1, (now - start) / duration))
      const resolved = Math.floor(p * text.length)
      let out = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        out += i < resolved || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
      setDisplay(out)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduce, text, duration, delay])

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  )
}
