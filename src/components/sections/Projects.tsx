import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ArrowUpRight, Expand, Github, Rocket } from 'lucide-react'
import { profile, projects, type Project, type ProjectCategory } from '../../data'
import { HudCorners } from '../ui/HudCorners'
import { SectionHeading } from '../ui/SectionHeading'
import { TiltCard } from '../ui/TiltCard'
import { ProjectModal } from './ProjectModal'
import { ProjectPreview } from './ProjectPreview'

type Filter = 'All' | ProjectCategory
const FILTERS: Filter[] = ['All', 'AI', 'Backend', 'Frontend']

function ProjectCard({ project, index, onDetails }: { project: Project; index: number; onDetails: (p: Project) => void }) {
  return (
    <TiltCard className="h-full rounded-3xl">
      <article className="glass glass-hover group relative flex h-full flex-col overflow-hidden rounded-3xl">
        {/* Whole card opens the GitHub repo (stretched link); buttons below sit above it */}
        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10 rounded-3xl"
          aria-label={`${project.name} — open GitHub repository`}
          data-cursor="card"
          data-cursor-label="Repo ↗"
        />
        <motion.div layoutId={`preview-${project.id}`} className="relative h-56 overflow-hidden sm:h-64">
          <ProjectPreview project={project} />
          <span className="absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">
            case_{String(index + 1).padStart(2, '0')}
          </span>
          <span className="absolute bottom-3 right-4 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-all duration-500 group-hover:rotate-45 group-hover:border-cyan group-hover:text-cyan">
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </motion.div>

        <div className="relative flex flex-1 flex-col p-6 [transform:translateZ(30px)] sm:p-8">
          <HudCorners />
          <p className="font-mono text-xs uppercase tracking-widest text-cyan">{project.tagline}</p>
          <motion.h3 layoutId={`title-${project.id}`} className="mt-2 text-3xl font-bold">
            {project.name}
          </motion.h3>
          <p className="mt-3 leading-relaxed text-muted">{project.summary}</p>

          <dl className="mt-6 grid grid-cols-3 gap-2">
            {project.metrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-line px-3 py-2 text-center">
                <dt className="sr-only">{m.label}</dt>
                <dd className="font-display text-lg font-bold text-fg">{m.value}</dd>
                <dd className="text-[11px] text-muted" aria-hidden="true">{m.label}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tech stack">
            {project.stack.map((t) => (
              <li key={t} className="chip">{t}</li>
            ))}
          </ul>

          <div className="relative z-20 mt-auto flex flex-wrap items-center gap-3 pt-8">
            <button type="button" onClick={() => onDetails(project)} className="btn btn-ghost px-5 py-2.5">
              <Expand size={15} /> View Details
            </button>
            <a href={project.repo} target="_blank" rel="noopener noreferrer" className="btn btn-primary px-5 py-2.5">
              <Github size={15} /> GitHub
            </a>
            {project.demo ? (
              <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost px-5 py-2.5">
                <Rocket size={15} /> Live Demo
              </a>
            ) : (
              <span className="chip !py-2" title="Live demo coming soon">
                <Rocket size={13} className="mr-1.5" aria-hidden="true" /> Demo soon
              </span>
            )}
          </div>
        </div>
      </article>
    </TiltCard>
  )
}

export function Projects() {
  const [filter, setFilter] = useState<Filter>('All')
  const [selected, setSelected] = useState<Project | null>(null)
  const visible = projects.filter((p) => filter === 'All' || p.categories.includes(filter))

  return (
    <section id="projects" className="relative py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading
          index="03"
          label="Projects"
          title="Selected"
          highlight="work."
          description="Click a card to open its GitHub repository, or View Details for the full case study."
        />

        {/* Filter bar with sliding active pill */}
        <div role="group" aria-label="Filter projects by category" className="glass mb-10 inline-flex flex-wrap rounded-full p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors ${filter === f ? 'text-fg' : 'text-muted hover:text-fg'}`}
            >
              {filter === f && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-cyan/20 to-violet/20 ring-1 ring-cyan/40"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              {f}
            </button>
          ))}
        </div>

        {/* ANIMATION: layout transitions when filtering (popLayout keeps the grid fluid) */}
        <LayoutGroup>
          <motion.ul layout className="grid gap-8 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visible.map((p) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectCard project={p} index={projects.indexOf(p)} onDetails={setSelected} />
                </motion.li>
              ))}
              {filter === 'All' && (
                <motion.li
                  key="more"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="md:col-span-2"
                >
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-start justify-between gap-4 rounded-3xl border border-dashed border-line p-8 transition-colors hover:border-cyan/50 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-muted">More experiments</p>
                      <p className="mt-1 font-display text-xl font-semibold">
                        Face recognition, OTT platform, OTP verification & more on GitHub
                      </p>
                    </div>
                    <span className="flex items-center gap-2 font-medium text-cyan">
                      github.com/{profile.githubUser}
                      <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </span>
                  </a>
                </motion.li>
              )}
            </AnimatePresence>
          </motion.ul>

          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        </LayoutGroup>
      </div>
    </section>
  )
}
