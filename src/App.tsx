import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { navItems } from './data'
import { useActiveSection } from './hooks/useActiveSection'
import { useEasterEgg } from './hooks/useEasterEgg'
import { useLenis } from './hooks/useLenis'
import { useFinePointer } from './hooks/usePointer'
import { useRipple } from './hooks/useRipple'
import { useTheme } from './hooks/useTheme'
import { Background } from './components/effects/Background'
import { BootSequence } from './components/effects/BootSequence'
import { CustomCursor } from './components/effects/CustomCursor'
import { ScrollProgress } from './components/effects/ScrollProgress'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Experience } from './components/sections/Experience'
import { Projects } from './components/sections/Projects'
import { Skills } from './components/sections/Skills'
import { Books } from './components/sections/Books'
import { Education } from './components/sections/Education'
import { Contact } from './components/sections/Contact'
import { ChatWidget } from './components/chat/ChatWidget'

const MatrixRain = lazy(() => import('./components/effects/MatrixRain'))

const SECTION_IDS = navItems.map((n) => n.id)
const BOOT_KEY = 'ys-booted'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Boot intro plays once per browser session and never for reduced-motion users. */
function shouldBoot() {
  if (prefersReducedMotion()) return false
  try {
    return sessionStorage.getItem(BOOT_KEY) !== '1'
  } catch {
    return true
  }
}

export default function App() {
  const [reduce] = useState(prefersReducedMotion)
  const [booting, setBooting] = useState(shouldBoot)
  const [matrix, setMatrix] = useState(false)
  const finePointer = useFinePointer()
  const { theme, toggle } = useTheme()
  const active = useActiveSection(SECTION_IDS)

  useLenis(!reduce)
  useRipple(!reduce)
  useEasterEgg(useCallback(() => setMatrix(true), []))

  const finishBoot = useCallback(() => {
    setBooting(false)
    try {
      sessionStorage.setItem(BOOT_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  // Hold the page still while the intro plays
  useEffect(() => {
    document.documentElement.style.overflow = booting ? 'hidden' : ''
  }, [booting])

  return (
    // reducedMotion="user": Framer Motion drops transform/layout animations for reduced-motion users
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-[100] rounded-full bg-cyan px-4 py-2 font-medium text-[#05060A] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <Background />
      <ScrollProgress />
      {finePointer && !reduce && <CustomCursor />}

      <Navbar active={active} theme={theme} onToggleTheme={toggle} />

      <main id="main">
        <Hero ready={!booting} light={theme === 'light'} />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Books />
        <Education />
        <Contact />
      </main>
      <Footer />

      <ChatWidget />

      <AnimatePresence>{booting && <BootSequence key="boot" onDone={finishBoot} />}</AnimatePresence>
      <Suspense fallback={null}>
        <AnimatePresence>{matrix && <MatrixRain key="matrix" onClose={() => setMatrix(false)} />}</AnimatePresence>
      </Suspense>
    </MotionConfig>
  )
}
