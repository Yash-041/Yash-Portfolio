import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { skillCloud } from '../../data'

/**
 * ANIMATION: orbiting 3D tag cloud (no WebGL — plain DOM + transforms).
 * Words sit on a Fibonacci sphere; each frame rotates the sphere and
 * writes transform/opacity directly to each element (no React re-renders).
 * Pointer position steers spin direction/speed; hovering a word pauses it.
 * The loop stops while off-screen.
 */
const BASE_SPEED = 0.0025
const STEER = 0.012

export function SkillSphere() {
  const wrap = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLLIElement | null)[]>([])
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const n = skillCloud.length
    // Fibonacci sphere distribution → evenly spaced points
    const pts = skillCloud.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = Math.PI * (3 - Math.sqrt(5)) * i
      return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r }
    })

    let ax = BASE_SPEED // rotation per frame around Y
    let ay = BASE_SPEED * 0.6 // around X
    let tx = ax
    let ty = ay
    let paused = false
    let raf = 0
    let visible = true

    const render = () => {
      const radius = el.clientWidth / 2.6
      const cosY = Math.cos(ax), sinY = Math.sin(ax)
      const cosX = Math.cos(ay), sinX = Math.sin(ay)
      pts.forEach((p, i) => {
        if (!paused && !reduce) {
          // rotate around Y then X
          const x1 = p.x * cosY - p.z * sinY
          const z1 = p.x * sinY + p.z * cosY
          const y1 = p.y * cosX - z1 * sinX
          const z2 = p.y * sinX + z1 * cosX
          p.x = x1
          p.y = y1
          p.z = z2
        }
        const node = items.current[i]
        if (!node) return
        const scale = 0.6 + (p.z + 1) * 0.35
        node.style.transform = `translate3d(${p.x * radius}px, ${p.y * radius}px, 0) translate(-50%, -50%) scale(${scale})`
        node.style.opacity = String(0.25 + (p.z + 1) * 0.375)
        node.style.zIndex = String(Math.round((p.z + 1) * 50))
        node.style.filter = p.z < -0.3 ? 'blur(1px)' : 'none'
      })
    }

    const loop = () => {
      ax += (tx - ax) * 0.05
      ay += (ty - ay) * 0.05
      render()
      if (visible) raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * STEER
      ty = -((e.clientY - r.top) / r.height - 0.5) * STEER
    }
    const onLeave = () => {
      paused = false
      tx = BASE_SPEED
      ty = BASE_SPEED * 0.6
    }
    const onOver = (e: Event) => {
      paused = (e.target as Element).tagName === 'LI'
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(raf)
      if (visible && !reduce) raf = requestAnimationFrame(loop)
    })

    render()
    if (!reduce) {
      io.observe(el)
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      el.addEventListener('pointerover', onOver)
    }
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointerover', onOver)
    }
  }, [reduce])

  return (
    <div ref={wrap} className="relative mx-auto aspect-square w-full max-w-[460px]">
      {/* glowing core */}
      <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--violet)_45%,transparent),transparent_70%)] blur-xl" aria-hidden="true" />
      <div className="absolute inset-[8%] rounded-full border border-line" aria-hidden="true" />
      <div className="spin-slow absolute inset-[20%] rounded-full border border-dashed border-cyan/20" aria-hidden="true" />
      <ul className="absolute left-1/2 top-1/2" aria-label="Technologies I work with">
        {skillCloud.map((word, i) => (
          <li
            key={word}
            ref={(node) => {
              items.current[i] = node
            }}
            className="absolute left-0 top-0 whitespace-nowrap rounded-full border border-cyan/25 bg-[var(--glass)] px-3 py-1 font-mono text-xs text-fg backdrop-blur transition-colors hover:border-magenta hover:text-magenta sm:text-sm"
          >
            {word}
          </li>
        ))}
      </ul>
    </div>
  )
}
