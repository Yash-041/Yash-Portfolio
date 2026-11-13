import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react'
import { navItems } from '../../data'
import { handleAnchorClick } from '../../lib/scroll'
import type { Theme } from '../../hooks/useTheme'
import { Magnetic } from '../ui/Magnetic'

type NavbarProps = { active: string; theme: Theme; onToggleTheme: () => void }

export function Navbar({ active, theme, onToggleTheme }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    setOpen(false)
    handleAnchorClick(e, id)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full px-3 py-2 transition-all duration-500 ${
            scrolled ? 'glass' : ''
          }`}
        >
          {/* Empty spacer (mirrors the right-hand actions) so the pill nav stays centred */}
          <div className="flex-1" aria-hidden="true" />

          {/* Desktop pill nav with sliding active indicator */}
          <nav aria-label="Primary" className={`hidden rounded-full p-1 lg:block ${scrolled ? '' : 'glass'}`}>
            <ul className="flex items-center">
              {navItems.map((item) => {
                const isActive = active === item.id
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => go(e, item.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                        isActive ? 'text-fg' : 'text-muted hover:text-fg'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full border border-cyan/40 bg-cyan/10 shadow-[0_0_18px_-4px_var(--cyan)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="icon-btn h-10 w-10"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                </motion.span>
              </AnimatePresence>
            </button>
            <div className="hidden sm:block">
              <Magnetic>
                <a href="#contact" onClick={(e) => go(e, 'contact')} className="btn btn-primary px-5 py-2.5">
                  Hire Me <ArrowUpRight size={15} />
                </a>
              </Magnetic>
            </div>
            <button
              ref={toggleRef}
              type="button"
              className="icon-btn h-10 w-10 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ANIMATION: fullscreen mobile menu — circular clip-path reveal from the toggle, staggered links */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            className="fixed inset-0 z-40 flex flex-col justify-center bg-[var(--glass-strong)] px-8 backdrop-blur-xl lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 44px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
            <ul className="relative space-y-1">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => go(e, item.id)}
                    className={`flex items-baseline gap-4 py-2 font-display text-4xl font-bold sm:text-5xl ${
                      active === item.id ? 'neon-text' : 'text-fg'
                    }`}
                  >
                    <span className="font-mono text-xs font-normal text-cyan">0{i + 1}</span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.a
              href="#contact"
              onClick={(e) => go(e, 'contact')}
              className="btn btn-primary relative mt-10 self-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              Hire Me <ArrowUpRight size={15} />
            </motion.a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
