import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Github, Rocket, X } from 'lucide-react'
import type { Project } from '../../data'
import { lockScroll } from '../../lib/scroll'
import { ProjectPreview } from './ProjectPreview'

type ProjectModalProps = { project: Project | null; onClose: () => void }

/**
 * ANIMATION: shared-element expand — the card's preview and title carry the
 * same layoutId, so Framer Motion morphs them from the card into the modal.
 */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!project) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    lockScroll(true)
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      // Simple focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
      previouslyFocused?.focus()
    }
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            data-lenis-prevent
            className="glass relative max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-t-3xl !bg-[var(--glass-strong)] sm:rounded-3xl"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div layoutId={`preview-${project.id}`} className="relative h-48 overflow-hidden sm:h-64">
              <ProjectPreview project={project} />
            </motion.div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="icon-btn absolute right-4 top-4 z-10 !bg-black/40 !text-white backdrop-blur"
              aria-label="Close project details"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-10">
              <p className="font-mono text-xs uppercase tracking-widest text-cyan">{project.tagline}</p>
              <motion.h3 layoutId={`title-${project.id}`} id="project-modal-title" className="mt-2 text-3xl font-bold sm:text-4xl">
                {project.name}
              </motion.h3>
              <p className="mt-4 text-lg leading-relaxed text-fg-2">{project.summary}</p>

              <ol className="mt-8 space-y-4">
                {project.highlights.map((h, i) => (
                  <motion.li
                    key={h.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex gap-4 rounded-2xl border border-line p-5"
                  >
                    <span className="font-mono text-sm text-magenta">0{i + 1}</span>
                    <div>
                      <h4 className="font-semibold">{h.title}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{h.text}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>

              <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tech stack">
                {project.stack.map((t) => (
                  <li key={t} className="chip">{t}</li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href={project.repo} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <Github size={16} /> View on GitHub
                </a>
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    <Rocket size={16} /> Live Demo
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
