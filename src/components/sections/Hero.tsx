import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowDown, Download, Github, Linkedin, Mail, Sparkles } from 'lucide-react'
import { profile } from '../../data'
import { handleAnchorClick } from '../../lib/scroll'
import { Magnetic } from '../ui/Magnetic'
import { Typewriter } from '../ui/Typewriter'

// Code-split: three.js + R3F (~600 KB) load only after the intro, when the browser is idle.
const NeuralScene = lazy(() => import('../three/NeuralScene'))

type HeroProps = { ready: boolean; light: boolean }

// ANIMATION: staggered hero entrance, triggered when the boot intro finishes
const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
}

export function Hero({ ready, light }: HeroProps) {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const [mountScene, setMountScene] = useState(false)
  const [inView, setInView] = useState(true)

  // Mount the 3D scene once the intro is done and the main thread is idle
  useEffect(() => {
    if (!ready || reduce) return
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    if (w.requestIdleCallback) {
      w.requestIdleCallback(() => setMountScene(true), { timeout: 1200 })
    } else {
      const t = window.setTimeout(() => setMountScene(true), 300)
      return () => window.clearTimeout(t)
    }
  }, [ready, reduce])

  // Pause the WebGL render loop while the hero is off-screen
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="home" aria-label="Introduction" className="relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-32">
      {/* 3D constellation background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,color-mix(in_srgb,var(--violet)_18%,transparent),transparent_60%)]" />
        {mountScene && (
          <Suspense fallback={null}>
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6 }}>
              <NeuralScene active={inView} light={light} />
            </motion.div>
          </Suspense>
        )}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_30%_50%,color-mix(in_srgb,var(--bg)_70%,transparent),transparent)]" />
      </div>

      <motion.div
        className="container-x relative"
        variants={container}
        initial="hidden"
        animate={ready ? 'show' : 'hidden'}
      >
        <motion.div variants={item} className="glass mb-8 inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs sm:text-sm">
          <span className="pulse-dot" aria-hidden="true" />
          <span className="font-mono uppercase tracking-wider text-muted">Currently building</span>
          <span className="font-medium text-fg">{profile.currentlyBuilding}</span>
        </motion.div>

        <motion.p variants={item} className="mb-4 font-mono text-sm text-cyan">
          <span className="text-violet">~/</span>hello-world <span className="text-muted">$</span> whoami
        </motion.p>

        <motion.h1 variants={item} className="text-[clamp(2.75rem,9vw,7.5rem)] font-bold leading-[0.95] tracking-[-0.04em]">
          Hi, I’m <br className="sm:hidden" />
          <span className="neon-text drop-shadow-[0_0_30px_color-mix(in_srgb,var(--cyan)_35%,transparent)]">{profile.name}</span>
        </motion.h1>

        <motion.p variants={item} className="mt-6 font-mono text-lg text-fg-2 sm:text-2xl">
          <span className="text-magenta">{'>'}</span>{' '}
          <Typewriter words={profile.roles} />
        </motion.p>

        <motion.p variants={item} className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {profile.pitch}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
          <Magnetic>
            <a href="#projects" onClick={(e) => handleAnchorClick(e, 'projects')} className="btn btn-primary">
              <Sparkles size={16} /> View Projects
            </a>
          </Magnetic>
          <Magnetic>
            <a href={profile.resume} download={profile.resumeDownloadName} className="btn btn-ghost" type="application/pdf">
              <Download size={16} /> Download Resume
            </a>
          </Magnetic>
        </motion.div>

        <motion.ul variants={item} className="mt-10 flex items-center gap-3" aria-label="Social links">
          <li>
            <a className="icon-btn" href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
              <Github size={18} />
            </a>
          </li>
          <li>
            <a className="icon-btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">
              <Linkedin size={18} />
            </a>
          </li>
          <li>
            <a className="icon-btn" href={`mailto:${profile.email}`} aria-label={`Email ${profile.email}`}>
              <Mail size={18} />
            </a>
          </li>
          <li className="ml-2 hidden h-px w-16 bg-gradient-to-r from-line to-transparent sm:block" aria-hidden="true" />
          <li className="hidden font-mono text-xs text-muted sm:block">{profile.location}</li>
        </motion.ul>
      </motion.div>

      {/* ANIMATION: scroll indicator — the wheel dot loops downward */}
      <motion.a
        href="#about"
        onClick={(e) => handleAnchorClick(e, 'about')}
        aria-label="Scroll to About section"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted transition-colors hover:text-cyan sm:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ delay: 1.2 }}
      >
        <span className="flex h-10 w-6 justify-center rounded-full border border-current pt-2">
          <span className="scroll-wheel block h-2 w-1 rounded-full bg-cyan" />
        </span>
        <ArrowDown size={14} />
      </motion.a>
    </section>
  )
}
