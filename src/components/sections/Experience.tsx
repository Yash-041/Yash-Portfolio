import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Briefcase, Calendar, MapPin, Rocket } from 'lucide-react'
import { experience } from '../../data'
import { HudCorners } from '../ui/HudCorners'
import { SectionHeading } from '../ui/SectionHeading'

export function Experience() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  /**
   * ANIMATION (GSAP + ScrollTrigger): the glowing timeline line draws itself
   * as you scroll. `scrub: 0.6` ties progress to scroll position with slight
   * smoothing; start/end define when the draw begins and finishes.
   * GSAP is dynamically imported so it's not in the initial bundle.
   */
  useEffect(() => {
    if (reduce || !timelineRef.current || !lineRef.current) return
    let revert = () => {}
    let cancelled = false
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      const ctx = gsap.context(() => {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: timelineRef.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
          },
        )
      })
      revert = () => ctx.revert()
    })
    return () => {
      cancelled = true
      revert()
    }
  }, [reduce])

  return (
    <section id="experience" className="relative py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading
          index="02"
          label="Experience"
          title="Where I’ve"
          highlight="shipped."
          description="Production-minded AI engineering: async services, retrieval pipelines and prompts that return valid JSON."
        />

        <div ref={timelineRef} className="relative pl-10 sm:pl-16">
          {/* Track + scroll-drawn neon line */}
          <div className="absolute bottom-0 left-[11px] top-2 w-px bg-line sm:left-[19px]" aria-hidden="true" />
          <div
            ref={lineRef}
            className="absolute bottom-0 left-[10px] top-2 w-[3px] origin-top rounded-full bg-gradient-to-b from-cyan via-violet to-magenta shadow-[0_0_16px_var(--cyan)] sm:left-[18px]"
            style={reduce ? undefined : { transform: 'scaleY(0)' }}
            aria-hidden="true"
          />

          <ol className="space-y-14">
            {experience.map((job) => (
              <li key={job.company} className="relative">
                {/* Glowing node marker */}
                <motion.span
                  aria-hidden="true"
                  className="absolute -left-10 top-6 grid h-6 w-6 place-items-center rounded-full border border-cyan bg-bg shadow-[0_0_20px_var(--cyan)] sm:-left-16 sm:h-10 sm:w-10"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <Briefcase className="h-3 w-3 text-cyan sm:h-4 sm:w-4" />
                </motion.span>

                {/* ANIMATION: card slides in from the right */}
                <motion.article
                  initial={{ opacity: 0, x: 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="glass glass-hover group relative p-6 sm:p-10"
                >
                  <HudCorners />
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="chip mb-3 !border-magenta/40 !bg-magenta/10 !text-magenta">{job.type}</span>
                      <h3 className="text-2xl font-bold sm:text-3xl">{job.role}</h3>
                      <p className="mt-1 text-lg font-medium text-cyan">{job.company}</p>
                    </div>
                    <div className="space-y-1.5 font-mono text-xs text-muted sm:text-right">
                      <p className="flex items-center gap-2 sm:justify-end">
                        <Calendar size={13} aria-hidden="true" /> {job.period}
                      </p>
                      <p className="flex items-center gap-2 sm:justify-end">
                        <MapPin size={13} aria-hidden="true" /> {job.location}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-8 grid gap-5 md:grid-cols-3">
                    {job.bullets.map((b, i) => (
                      <motion.li
                        key={b.title}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.12 }}
                        className="rounded-xl border border-line bg-[color-mix(in_srgb,var(--fg)_2%,transparent)] p-5"
                      >
                        <p className="font-mono text-xs text-cyan">0{i + 1}</p>
                        <h4 className="mt-2 font-semibold">{b.title}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{b.text}</p>
                      </motion.li>
                    ))}
                  </ul>

                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies used">
                    {job.tags.map((t) => (
                      <li key={t} className="chip">{t}</li>
                    ))}
                  </ul>
                </motion.article>
              </li>
            ))}

            {/* Next node */}
            <li className="relative">
              <span aria-hidden="true" className="absolute -left-10 top-4 grid h-6 w-6 place-items-center rounded-full border border-dashed border-magenta bg-bg sm:-left-16 sm:h-10 sm:w-10">
                <Rocket className="h-3 w-3 text-magenta sm:h-4 sm:w-4" />
              </span>
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="rounded-2xl border border-dashed border-line p-6"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-magenta">next()</p>
                <p className="mt-2 text-fg-2">
                  Looking for my next backend / AI engineering role — 2027 graduate, available for internships now.
                </p>
              </motion.div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
