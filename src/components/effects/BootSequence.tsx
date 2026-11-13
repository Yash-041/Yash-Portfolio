import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { bootLines, profile } from '../../data'

type BootSequenceProps = { onDone: () => void }

/** ms per typed character / pause between lines / pause after "Ready." */
const CHAR_MS = 14
const LINE_PAUSE = 160
const END_PAUSE = 420

/**
 * ANIMATION: terminal boot intro.
 * Types each line of `bootLines`, fills a progress bar, then the parent's
 * AnimatePresence plays the exit (a clip-path wipe up into the hero).
 * Any key or click skips it.
 */
export function BootSequence({ onDone }: BootSequenceProps) {
  const [line, setLine] = useState(0)
  const [chars, setChars] = useState(0)

  useEffect(() => {
    if (line >= bootLines.length) {
      const t = window.setTimeout(onDone, END_PAUSE)
      return () => window.clearTimeout(t)
    }
    const current = bootLines[line]
    const t =
      chars < current.length
        ? window.setTimeout(() => setChars((c) => c + 1), CHAR_MS)
        : window.setTimeout(() => {
            setLine((l) => l + 1)
            setChars(0)
          }, LINE_PAUSE)
    return () => window.clearTimeout(t)
  }, [line, chars, onDone])

  useEffect(() => {
    const skip = () => onDone()
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [onDone])

  const total = bootLines.reduce((s, l) => s + l.length, 0)
  const done = bootLines.slice(0, line).reduce((s, l) => s + l.length, 0) + chars
  const pct = Math.min(100, Math.round((done / total) * 100))

  return (
    <motion.div
      role="status"
      aria-label="Loading portfolio"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#05060A] px-6"
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="bg-scanlines absolute inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-xl font-mono text-sm text-[#b9c6de] sm:text-[15px]">
        <div className="mb-6 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[#8a97b1]">
          <span>
            {profile.initials}::neural-os <span className="text-[#00F0FF]">v2.0</span>
          </span>
          <span>{pct}%</span>
        </div>
        <div className="space-y-2">
          {bootLines.map((text, i) => {
            if (i > line) return null
            const shown = i < line ? text : text.slice(0, chars)
            const isLast = i === bootLines.length - 1
            return (
              <p key={text} className={isLast && i < line ? 'text-[#00F0FF]' : ''}>
                <span className="mr-3 text-[#8B5CF6]">{'>'}</span>
                {shown}
                {i < line && !isLast && <span className="ml-2 text-[#22e58b]">[ok]</span>}
                {i === line && <span className="caret ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-[#00F0FF]" />}
              </p>
            )
          })}
        </div>
        <div className="mt-8 h-[2px] w-full overflow-hidden rounded bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#00F0FF] via-[#8B5CF6] to-[#FF2E97] shadow-[0_0_12px_#00F0FF] transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-[#8a97b1]/70">Press any key to skip</p>
      </div>
    </motion.div>
  )
}
