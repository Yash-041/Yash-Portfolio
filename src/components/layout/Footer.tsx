import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Github, Linkedin, Mail, Rocket } from 'lucide-react'
import { profile } from '../../data'
import { scrollToTarget } from '../../lib/scroll'

export function Footer() {
  const [launching, setLaunching] = useState(false)
  const reduce = useReducedMotion()

  // ANIMATION: rocket lifts off (with a flame trail), page scrolls to top, rocket returns
  const launch = () => {
    if (launching) return
    setLaunching(true)
    window.setTimeout(() => scrollToTarget(0), reduce ? 0 : 250)
    window.setTimeout(() => setLaunching(false), 1600)
  }

  return (
    <footer className="relative border-t border-line py-10">
      <div className="container-x flex flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="font-mono text-xs text-muted">
          © 2026 {profile.name} · Built with React, Three.js &amp; too much coffee
        </p>
        <div className="flex items-center gap-2">
          <a className="icon-btn h-10 w-10" href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github size={16} />
          </a>
          <a className="icon-btn h-10 w-10" href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin size={16} />
          </a>
          <a className="icon-btn h-10 w-10" href={`mailto:${profile.email}`} aria-label="Email">
            <Mail size={16} />
          </a>
          <button type="button" onClick={launch} className="group ml-2 flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-cyan/50 hover:text-cyan" aria-label="Back to top">
            <span className="relative block h-5 w-5">
              <motion.span
                className="absolute inset-0"
                animate={launching && !reduce ? { y: -70, opacity: 0, rotate: -45 } : { y: 0, opacity: 1, rotate: -45 }}
                transition={launching ? { duration: 0.8, ease: [0.5, 0, 0.75, 0] } : { duration: 0 }}
              >
                <Rocket size={18} className="transition-transform group-hover:-translate-y-0.5" />
                {launching && !reduce && (
                  <motion.span
                    className="absolute left-0 top-4 h-6 w-1.5 rounded-full bg-gradient-to-b from-magenta via-violet to-transparent blur-[1px]"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                  />
                )}
              </motion.span>
            </span>
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
