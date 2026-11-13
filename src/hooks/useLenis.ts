import { useEffect } from 'react'
import { setLenis } from '../lib/scroll'

/**
 * ANIMATION: Lenis smooth scrolling.
 * `duration` / `easing` control the inertia feel. Disabled when the
 * visitor prefers reduced motion. Imported lazily so it never blocks first paint.
 */
export function useLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    let raf = 0
    let destroyed = false
    let destroy = () => {}

    void import('lenis').then(({ default: Lenis }) => {
      if (destroyed) return
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
        smoothWheel: true,
        wheelMultiplier: 0.95,
      })
      setLenis(lenis)
      const loop = (time: number) => {
        lenis.raf(time)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
      destroy = () => {
        cancelAnimationFrame(raf)
        lenis.destroy()
        setLenis(null)
      }
    })

    return () => {
      destroyed = true
      destroy()
    }
  }, [enabled])
}
