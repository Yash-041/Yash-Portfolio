import { motion } from 'framer-motion'
import { Cpu, Globe2, Languages, MapPin } from 'lucide-react'
import { profile, stats } from '../../data'
import { CountUp } from '../ui/CountUp'
import { HudCorners } from '../ui/HudCorners'
import { SectionHeading } from '../ui/SectionHeading'
import { TiltCard } from '../ui/TiltCard'

const HEX = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)'

/**
 * Portrait: rotating conic ring + counter-rotating dashed hexagon + hex-clipped photo.
 * ANIMATION (see .portrait-* in index.css):
 *  - photo in true colour; gentle zoom on hover
 *  - holographic scan line sweeping every 5s
 *  - whole frame tilts toward the cursor (TiltCard), HUD labels float on a nearer layer
 */
function Avatar() {
  return (
    <TiltCard max={12} glare={false} className="portrait mx-auto w-full max-w-[400px]">
    <div className="relative aspect-square w-full">
      {/* ANIMATION: outer conic ring spins (spin-slow, 22s) */}
      <div
        className="spin-slow absolute inset-0 rounded-full opacity-80"
        style={{
          background: 'conic-gradient(from 0deg, var(--cyan), transparent 25%, var(--violet) 50%, transparent 75%, var(--magenta))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
        }}
      />
      {/* ANIMATION: dashed hexagon counter-rotates (spin-rev, 30s) */}
      <svg viewBox="0 0 200 200" className="spin-rev absolute inset-[6%] h-[88%] w-[88%]" aria-hidden="true">
        <polygon points="100,6 182,53 182,147 100,194 18,147 18,53" fill="none" stroke="var(--cyan)" strokeOpacity=".45" strokeWidth="1" strokeDasharray="4 6" />
      </svg>
      {/* orbiting satellites */}
      <div className="spin-slow absolute inset-[3%]" aria-hidden="true">
        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_12px_var(--cyan)]" />
        <span className="absolute bottom-[12%] left-[6%] h-2 w-2 rounded-full bg-magenta shadow-[0_0_12px_var(--magenta)]" />
      </div>
      {/* Hex-clipped photo, lifted toward the viewer for parallax */}
      <div className="absolute inset-[11%] [transform:translateZ(40px)]">
        <div className="absolute inset-0 overflow-hidden bg-bg-2" style={{ clipPath: HEX }}>
          <picture>
            <source type="image/webp" srcSet={`${profile.photo.webp480} 480w, ${profile.photo.webp800} 800w`} sizes="(min-width: 1024px) 320px, 70vw" />
            <img
              src={profile.photo.jpg}
              alt={profile.photo.alt}
              width={800}
              height={800}
              loading="lazy"
              decoding="async"
              className="portrait-photo absolute inset-0 h-full w-full object-cover"
            />
          </picture>
          <div className="bg-scanlines absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="portrait-scan" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-bg/70 to-transparent" aria-hidden="true" />
        </div>
        {/* Neon hex border */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="portrait-border" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--cyan)" />
              <stop offset=".5" stopColor="var(--violet)" />
              <stop offset="1" stopColor="var(--magenta)" />
            </linearGradient>
          </defs>
          <polygon
            points="50,0.6 99.4,25.3 99.4,74.7 50,99.4 0.6,74.7 0.6,25.3"
            fill="none"
            stroke="url(#portrait-border)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
            style={{ filter: 'drop-shadow(0 0 6px color-mix(in srgb, var(--cyan) 70%, transparent))' }}
          />
        </svg>
      </div>
      {/* HUD labels float on the nearest layer */}
      <span className="glass absolute -left-2 top-[14%] rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan [transform:translateZ(70px)] sm:-left-6">
        id: ys-041
      </span>
      <span className="glass absolute -right-2 bottom-[16%] flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-fg-2 [transform:translateZ(70px)] sm:-right-6">
        <span className="pulse-dot scale-75" aria-hidden="true" /> online
      </span>
      <span className="glass absolute bottom-[2%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted [transform:translateZ(60px)]">
        human · in · the · loop
      </span>
    </div>
    </TiltCard>
  )
}

export function About() {
  const facts = [
    { icon: MapPin, label: 'Based in', value: profile.location },
    { icon: Cpu, label: 'Focus', value: 'Backend · GenAI · RAG' },
    { icon: Languages, label: 'Languages', value: profile.languages.join(' · ') },
    { icon: Globe2, label: 'Open to', value: 'Internships & SDE / AI roles' },
  ]

  return (
    <section id="about" className="relative py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading index="01" label="About" title="Engineer of" highlight="thinking systems." />
        <div className="grid items-start gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            className="lg:sticky lg:top-32"
            initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Avatar />
          </motion.div>

          <div>
            <div className="space-y-5 text-base leading-relaxed text-fg-2 sm:text-lg">
              {profile.bio.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                >
                  {para}
                </motion.p>
              ))}
            </div>

            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3">
                  <Icon size={18} className="shrink-0 text-cyan" aria-hidden="true" />
                  <div>
                    <dt className="mono-label !text-[10px]">{label}</dt>
                    <dd className="text-sm font-medium text-fg">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {/* Count-up stat cards */}
            <ul className="mt-8 grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <motion.li
                  key={s.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="glass glass-hover group relative overflow-hidden p-5 sm:p-6"
                >
                  <HudCorners />
                  <p className="neon-text font-display text-4xl font-bold sm:text-5xl">
                    <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-muted">{s.label}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
