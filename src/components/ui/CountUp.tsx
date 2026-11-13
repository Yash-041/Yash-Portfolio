import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

type CountUpProps = { value: number; decimals?: number; suffix?: string; duration?: number }

/** ANIMATION: counts from 0 → value (easeOut) the first time it scrolls into view. */
export function CountUp({ value, decimals = 0, suffix = '', duration = 1.6 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.8 })
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? value : 0)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: setN })
    return () => controls.stop()
  }, [inView, reduce, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {n.toFixed(decimals)}
      {suffix}
    </span>
  )
}
