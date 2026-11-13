import { useRef, type PointerEvent, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'

type TiltCardProps = {
  children: ReactNode
  className?: string
  /** Max rotation in degrees. */
  max?: number
  glare?: boolean
}

/**
 * ANIMATION: 3D tilt with parallax + glare.
 * Pointer position (−0.5…0.5) maps to rotateX/rotateY via springs.
 * Children can use `[transform:translateZ(40px)]` for a parallax layer.
 */
export function TiltCard({ children, className = '', max = 9, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const spring = { stiffness: 160, damping: 18 }
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring)
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring)
  const gx = useTransform(px, [-0.5, 0.5], [0, 100])
  const gy = useTransform(py, [-0.5, 0.5], [0, 100])
  const glareOpacity = useMotionValue(0)
  const glareBg = useMotionTemplate`radial-gradient(520px circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.14), transparent 45%)`

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
    glareOpacity.set(1)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
    glareOpacity.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1100, transformStyle: 'preserve-3d' }}
      className={`relative ${className}`}
    >
      {children}
      {glare && !reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300"
          style={{ background: glareBg, opacity: glareOpacity }}
        />
      )}
    </motion.div>
  )
}
