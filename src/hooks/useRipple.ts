import { useEffect } from 'react'

/** ANIMATION: click ripple on every `.btn` (one delegated listener for the whole page). */
export function useRipple(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const onDown = (e: PointerEvent) => {
      const btn = (e.target as Element | null)?.closest<HTMLElement>('.btn')
      if (!btn) return
      const r = btn.getBoundingClientRect()
      const size = Math.max(r.width, r.height)
      const span = document.createElement('span')
      span.className = 'ripple'
      span.style.width = span.style.height = `${size}px`
      span.style.left = `${e.clientX - r.left - size / 2}px`
      span.style.top = `${e.clientY - r.top - size / 2}px`
      btn.appendChild(span)
      span.addEventListener('animationend', () => span.remove())
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [enabled])
}
