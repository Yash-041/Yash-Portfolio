import { useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight, FolderGit2, GraduationCap, MapPin, Star } from 'lucide-react'
import { education, profile } from '../../data'
import { timeAgo, useGithubFeed, type FeedState } from '../../lib/github'
import { HudCorners } from '../ui/HudCorners'
import { SectionHeading } from '../ui/SectionHeading'

const LANG_COLORS: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  Java: '#B07219',
  CSS: '#663399',
  HTML: '#E34C26',
}

/** Terminal-style `git log` of the latest commits across the most recently pushed repos. */
function CommitTerminal({ state }: { state: FeedState }) {
  return (
    <div className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-line bg-[#05060A]/80 font-mono text-[12.5px]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-[#8A97B1]">yash@github: ~/repos</span>
      </div>
      <div className="flex-1 space-y-1.5 p-4 text-[#B9C6DE]">
        <p>
          <span className="text-[#22e58b]">➜</span> <span className="text-[#00F0FF]">~/repos</span> git log --all --oneline -7
        </p>
        {state.status === 'loading' && (
          <p className="text-[#8A97B1]">
            fetching origin… <span className="caret inline-block h-3.5 w-2 translate-y-0.5 bg-[#00F0FF]" />
          </p>
        )}
        {state.status === 'error' && (
          <p className="text-[#FF2E97]">
            ! GitHub API limit reached for now.{' '}
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="underline">
              View commits on GitHub ↗
            </a>
          </p>
        )}
        {state.status === 'ready' && (
          <ol aria-label="Latest commits">
            {state.feed.commits.map((c, i) => (
              // ANIMATION: lines print one after another, like terminal output
              <motion.li
                key={c.sha + c.repo}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.09, duration: 0.3 }}
                className="flex items-baseline gap-2 py-0.5"
              >
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[#F1E05A] hover:underline" title={`Open commit ${c.sha}`}>
                  {c.sha}
                </a>
                <span className="shrink-0 text-[#FF2E97]">({c.repo})</span>
                <span className="min-w-0 flex-1 truncate" title={c.message}>
                  {c.message}
                </span>
                <span className="hidden shrink-0 text-[#8A97B1] sm:inline">{timeAgo(c.date)}</span>
              </motion.li>
            ))}
            <li className="pt-1">
              <span className="text-[#22e58b]">➜</span> <span className="text-[#00F0FF]">~/repos</span>{' '}
              <span className="caret inline-block h-3.5 w-2 translate-y-0.5 bg-[#00F0FF]" />
            </li>
          </ol>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] uppercase tracking-widest text-[#8A97B1]">
        <span className="flex items-center gap-2">
          <span className="pulse-dot scale-75" aria-hidden="true" /> live from api.github.com
        </span>
        {state.status === 'ready' && <span>synced {timeAgo(new Date(state.feed.fetchedAt).toISOString())}</span>}
      </div>
    </div>
  )
}

/** Most recently pushed repositories. */
function RepoList({ state }: { state: FeedState }) {
  if (state.status !== 'ready') {
    return (
      <ul className="space-y-3" aria-hidden={state.status === 'loading'}>
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="h-[68px] animate-pulse rounded-xl border border-line bg-[color-mix(in_srgb,var(--fg)_3%,transparent)]" />
        ))}
      </ul>
    )
  }
  return (
    <ul className="space-y-3" aria-label="Recently updated repositories">
      {state.feed.repos.slice(0, 4).map((r, i) => (
        <motion.li
          key={r.name}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
        >
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/repo flex items-start gap-3 rounded-xl border border-line p-3.5 transition-colors hover:border-cyan/50"
          >
            <FolderGit2 size={18} className="mt-0.5 shrink-0 text-cyan" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-medium text-fg">
                <span className="truncate">{r.name}</span>
                <ArrowUpRight size={14} className="shrink-0 text-muted transition-transform group-hover/repo:-translate-y-0.5 group-hover/repo:translate-x-0.5" aria-hidden="true" />
              </span>
              {r.description && <span className="mt-0.5 block truncate text-xs text-muted">{r.description}</span>}
              <span className="mt-1.5 flex items-center gap-3 font-mono text-[10px] text-muted">
                {r.language && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: LANG_COLORS[r.language] ?? 'var(--violet)' }} />
                    {r.language}
                  </span>
                )}
                {r.stars > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={10} aria-hidden="true" /> {r.stars}
                  </span>
                )}
                <span>pushed {timeAgo(r.pushedAt)}</span>
              </span>
            </span>
          </a>
        </motion.li>
      ))}
    </ul>
  )
}

/** Placeholder heatmap used if the live contribution chart can't load. */
function FallbackGrid() {
  const cells = useMemo(
    () => Array.from({ length: 7 * 40 }, (_, i) => Math.floor(Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 5)),
    [],
  )
  const tone = ['bg-line', 'bg-cyan/25', 'bg-cyan/45', 'bg-violet/70', 'bg-magenta/80']
  return (
    <div className="grid grid-flow-col grid-rows-7 gap-[3px]" aria-hidden="true">
      {cells.map((v, i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-[2px] ${tone[v]}`} />
      ))}
    </div>
  )
}

function GithubActivity() {
  const ref = useRef<HTMLDivElement>(null)
  // Only hit the GitHub API once the card is close to the viewport
  const near = useInView(ref, { once: true, margin: '400px 0px' })
  const state = useGithubFeed(near)
  const feed = state.status === 'ready' ? state.feed : null
  const [chartFailed, setChartFailed] = useState(false)
  const items = [
    { label: 'Public repos', value: feed?.publicRepos ?? '14+' },
    { label: 'Main languages', value: 'Py · TS · Java' },
    { label: 'On GitHub since', value: feed?.since ?? '2024' },
  ]
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7 }}
      className="glass group relative mt-16 p-6 sm:p-8"
    >
      <HudCorners />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mono-label">git log --graph</p>
          <h3 className="mt-1 text-2xl font-bold">GitHub activity</h3>
        </div>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="link-sweep flex items-center gap-1 pb-0.5 text-sm font-medium text-fg-2">
          @{profile.githubUser} <ArrowUpRight size={15} />
        </a>
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-3">
        {items.map((s) => (
          <div key={s.label} className="flex flex-col-reverse rounded-xl border border-line p-4">
            <dt className="text-xs text-muted">{s.label}</dt>
            <dd className="font-display text-2xl font-bold text-fg">{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <CommitTerminal state={state} />
        <RepoList state={state} />
      </div>
      <div className="mt-6 overflow-x-auto pb-2" data-lenis-prevent>
        {chartFailed ? (
          <>
            <FallbackGrid />
            <p className="mt-3 font-mono text-[10px] text-muted">Illustrative graph — live chart unavailable.</p>
          </>
        ) : (
          <img
            src={`https://ghchart.rshah.org/8B5CF6/${profile.githubUser}`}
            alt={`${profile.name}'s GitHub contribution chart for the past year`}
            loading="lazy"
            decoding="async"
            width={663}
            height={104}
            className="min-w-[640px] opacity-90 [filter:hue-rotate(0deg)]"
            onError={() => setChartFailed(true)}
          />
        )}
      </div>
    </motion.div>
  )
}

export function Education() {
  return (
    <section id="education" className="relative py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading index="06" label="Education" title="Always" highlight="learning." />
        <ol className="grid gap-6 md:grid-cols-3">
          {education.map((e, i) => (
            <motion.li
              key={e.school}
              initial={{ opacity: 0, y: 30, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={`glass glass-hover group relative p-6 ${i === 0 ? 'md:ring-1 md:ring-cyan/30' : ''}`}
            >
              <HudCorners />
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-magenta/20 text-cyan">
                  <GraduationCap size={20} aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-muted">{e.period}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold leading-snug">{e.degree}</h3>
              <p className="mt-1 text-sm font-medium text-cyan">{e.school}</p>
              <p className="mt-3 text-sm text-fg-2">{e.detail}</p>
              <p className="mt-3 flex items-center gap-1.5 font-mono text-xs text-muted">
                <MapPin size={12} aria-hidden="true" /> {e.place}
              </p>
            </motion.li>
          ))}
        </ol>
        <GithubActivity />
      </div>
    </section>
  )
}
