import { motion } from 'framer-motion'
import { Brain, Code2, Database, FlaskConical, TerminalSquare, type LucideIcon } from 'lucide-react'
import { marqueeTech, skillGroups, type SkillGroup } from '../../data'
import { HudCorners } from '../ui/HudCorners'
import { ProgressRing } from '../ui/ProgressRing'
import { SectionHeading } from '../ui/SectionHeading'
import { SkillSphere } from './SkillSphere'

const ICONS: Record<SkillGroup['icon'], LucideIcon> = {
  code: Code2,
  database: Database,
  brain: Brain,
  flask: FlaskConical,
  terminal: TerminalSquare,
}

function Marquee() {
  // The list is rendered twice; the track translates -50% for a seamless loop.
  const row = [...marqueeTech, ...marqueeTech]
  return (
    <div className="marquee relative mt-24 overflow-hidden border-y border-line py-6 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <ul className="marquee-track flex w-max items-center gap-12" aria-label="Technology stack">
        {row.map((t, i) => (
          <li
            key={`${t}-${i}`}
            aria-hidden={i >= marqueeTech.length}
            className="flex items-center gap-3 font-display text-2xl font-semibold text-muted/70 transition-colors hover:text-cyan sm:text-3xl"
          >
            <span className="h-2 w-2 rotate-45 bg-gradient-to-br from-cyan to-magenta" aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Skills() {
  return (
    <section id="skills" className="relative overflow-hidden py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading index="04" label="Skills" title="The" highlight="stack." />

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SkillSphere />
          <div>
            <p className="text-lg leading-relaxed text-fg-2">
              Python is home base. I design <span className="text-cyan">async REST microservices</span> with FastAPI,
              store and search data in <span className="text-violet">PostgreSQL + vector stores</span>, and orchestrate
              LLMs with <span className="text-magenta">LangChain & LangGraph</span> — then containerise and test it all.
            </p>
            <p className="mt-4 font-mono text-xs text-muted">
              {'// move your cursor over the sphere to steer it · hover a word to freeze it'}
            </p>
          </div>
        </div>

        {/* Grouped grid with animated glowing progress rings */}
        <ul className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, gi) => {
            const Icon = ICONS[group.icon]
            return (
              <motion.li
                key={group.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: (gi % 3) * 0.1 }}
                className="glass glass-hover group relative p-6"
              >
                <HudCorners />
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-violet/20 text-cyan">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold">{group.title}</h3>
                </div>
                <ul className="space-y-3">
                  {group.skills.map((s) => (
                    <li key={s.name} className="flex items-center gap-3">
                      <span className="relative grid place-items-center">
                        <ProgressRing value={s.level} size={40} stroke={3} />
                        <span className="absolute font-mono text-[10px] text-fg-2">{s.level}</span>
                      </span>
                      <span className="text-sm text-fg">{s.name}</span>
                      <span className="sr-only">proficiency {s.level} out of 100</span>
                    </li>
                  ))}
                </ul>
              </motion.li>
            )
          })}
        </ul>
      </div>

      <Marquee />
    </section>
  )
}
