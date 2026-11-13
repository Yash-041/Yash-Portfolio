import { useEffect, useRef, useState } from 'react'

type Variant = 'default' | 'link' | 'card' | 'text'

/**
 * ANIMATION: custom cursor.
 * - The dot follows the pointer exactly (no lag).
 * - The ring lerps toward it each frame (LERP controls trail length).
 * - Hovering links/buttons expands the ring; elements with
 *   data-cursor="card" morph it into a labelled disc (data-cursor-label).
 * Mounted only for fine pointers and when reduced motion is off.
 */
const LERP = 0.18

export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [variant, setVariant] = useState<Variant>('default')
  const [label, setLabel] = useState('')
  const [pressed, setPressed] = useState(false)
  const [visible, setVisible] = useState(false)
  const state = useRef({ variant: 'default' as Variant, label: '' })

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('has-custom-cursor')
    let mx = -100, my = -100, rx = -100, ry = -100
    let raf = 0

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mx = e.clientX
      my = e.clientY
      setVisible(true)
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`

      const el = (e.target as Element | null)?.closest<HTMLElement>(
        '[data-cursor], a, button, input, textarea, select, label, [role="button"]',
      )
      let v: Variant = 'default'
      if (el) {
        const attr = el.dataset.cursor as Variant | undefined
        v = attr ?? (/^(INPUT|TEXTAREA)$/.test(el.tagName) ? 'text' : 'link')
      }
      const l = el?.dataset.cursorLabel ?? ''
      if (v !== state.current.variant) {
        state.current.variant = v
        setVariant(v)
      }
      if (l !== state.current.label) {
        state.current.label = l
        setLabel(l)
      }
    }
    const loop = () => {
      rx += (mx - rx) * LERP
      ry += (my - ry) * LERP
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    const down = () => setPressed(true)
    const up = () => setPressed(false)
    const leave = () => setVisible(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(loop)
    return () => {
      root.classList.remove('has-custom-cursor')
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', leave)
    }
  }, [])

  // Ring geometry per variant (transitions handle the morph)
  const ringClass: Record<Variant, string> = {
    default: 'h-9 w-9 rounded-full border border-cyan/60',
    link: 'h-14 w-14 rounded-full border border-cyan bg-cyan/10 shadow-[0_0_24px_-2px_var(--cyan)]',
    card: 'h-24 w-24 rounded-full border border-magenta/70 bg-magenta/15 backdrop-blur-sm',
    text: 'h-8 w-1 rounded-sm border-0 bg-cyan/80',
  }

  return (
    <div aria-hidden="true" className={`pointer-events-none fixed inset-0 z-[100] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div ref={ring} className="absolute left-0 top-0 will-change-transform">
        <div
          className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all duration-300 ease-out ${ringClass[variant]} ${pressed ? 'scale-75' : 'scale-100'}`}
        >
          {variant === 'card' && label && (
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-fg">{label}</span>
          )}
        </div>
      </div>
      <div ref={dot} className="absolute left-0 top-0 will-change-transform">
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan shadow-[0_0_12px_2px_var(--cyan)] transition-[width,height,opacity] duration-200 ${
            variant === 'default' ? 'h-1.5 w-1.5' : 'h-1 w-1 opacity-0'
          }`}
        />
      </div>
    </div>
  )
}
