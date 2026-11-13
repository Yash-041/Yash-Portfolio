import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

type MatrixRainProps = { onClose: () => void }

const CHARS = 'アイウエオカキクケコサシスセソタチツテト01ﾊﾋﾌﾍﾎYASHPYTHONRAG<>{}'
const FONT = 16

/** Easter egg: full-screen digital rain. Esc or click to exit. */
export default function MatrixRain({ onClose }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let raf = 0
    let w = 0
    let h = 0
    let drops: number[] = []
    let last = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drops = Array.from({ length: Math.ceil(w / FONT) }, () => Math.random() * -50)
    }
    // ANIMATION: ~30fps frame cap keeps the rain cinematic and cheap
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (now - last < 33) return
      last = now
      ctx.fillStyle = 'rgba(5, 6, 10, 0.09)'
      ctx.fillRect(0, 0, w, h)
      ctx.font = `${FONT}px "JetBrains Mono", monospace`
      drops.forEach((y, i) => {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)]
        ctx.fillStyle = Math.random() > 0.96 ? '#e8fdff' : i % 7 === 0 ? '#8B5CF6' : '#00F0FF'
        ctx.fillText(ch, i * FONT, y * FONT)
        drops[i] = y * FONT > h && Math.random() > 0.975 ? 0 : y + 1
      })
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()

    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div
      role="dialog"
      aria-label="Matrix easter egg. Press Escape to close."
      className="fixed inset-0 z-[95] bg-[#05060A]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-8 text-center font-mono text-xs uppercase tracking-[0.3em] text-[#00F0FF]">
        wake up, recruiter… · esc to exit
      </div>
    </motion.div>
  )
}
