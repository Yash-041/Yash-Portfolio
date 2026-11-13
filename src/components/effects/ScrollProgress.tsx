import { motion, useScroll, useSpring } from 'framer-motion'

/** ANIMATION: neon scroll progress bar; the spring smooths jumps from fast scrolling. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-cyan via-violet to-magenta shadow-[0_0_14px_var(--cyan)]"
    />
  )
}
