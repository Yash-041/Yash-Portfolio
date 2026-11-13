import { useId } from 'react'
import { motion } from 'framer-motion'

type ProgressRingProps = { value: number; size?: number; stroke?: number }

/** ANIMATION: SVG ring that draws to `value`% (pathLength) when scrolled into view. */
export function ProgressRing({ value, size = 44, stroke = 3.5 }: ProgressRingProps) {
  const id = `ring-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const r = (size - stroke) / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" />
          <stop offset="60%" stopColor="var(--violet)" />
          <stop offset="100%" stopColor="var(--magenta)" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 4px color-mix(in srgb, var(--cyan) 70%, transparent))' }}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: value / 100 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}
