import { motion } from 'framer-motion'
import { ArrowUpRight, BookOpen, PenTool } from 'lucide-react'
import { books, type Book } from '../../data'
import { SectionHeading } from '../ui/SectionHeading'

/** Generated cover for books without artwork yet (Vol. 2). */
function GeneratedCover({ book }: { book: Book }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between bg-[linear-gradient(160deg,#0b1030,#070915_55%,#1a0b24)] p-5 text-white">
      <div className="bg-grid absolute inset-0 opacity-70" />
      <svg viewBox="0 0 100 100" className="absolute right-3 top-10 h-24 w-24 opacity-70" aria-hidden="true">
        {[[20, 20], [70, 15], [50, 50], [85, 60], [25, 75], [65, 88]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 2 ? 5 : 3} fill={i % 2 ? '#FF2E97' : '#00F0FF'} />
        ))}
        <path d="M20 20 50 50 70 15M50 50 85 60M50 50 25 75 65 88 85 60" stroke="#8B5CF6" strokeWidth=".8" fill="none" />
      </svg>
      <p className="relative font-mono text-[9px] uppercase tracking-[0.25em] text-[#9ff6ff]/80">From ML systems to agents</p>
      <div className="relative">
        <p className="font-display text-3xl font-bold leading-none">CODE IN</p>
        <p className="font-display text-3xl font-bold leading-none">PYTHON</p>
        <div className="my-2 h-0.5 w-16 bg-gradient-to-r from-[#00F0FF] to-[#FF2E97]" />
        <p className="font-display text-lg font-semibold tracking-wide text-[#00F0FF]">THINK IN AI</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-white/70">{book.volume}</p>
      </div>
      <p className="relative font-mono text-[9px] uppercase tracking-[0.2em] text-white/60">Yash Sharma</p>
    </div>
  )
}

/**
 * ANIMATION: CSS 3D book (front, spine, page block, back). Rests at an angle,
 * floats continuously, and swings toward the viewer on hover (see .book in index.css).
 */
function Book3D({ book }: { book: Book }) {
  return (
    <div className="book-scene relative grid place-items-center py-10">
      <div className="book">
        <div className="book-back" />
        <div className="book-spine" />
        <div className="book-pages" />
        <div className="book-face">
          {book.cover ? (
            <img
              src={book.cover}
              alt={`Cover of “${book.title}” ${book.volume}`}
              loading="lazy"
              decoding="async"
              width={400}
              height={600}
              className="h-full w-full object-cover"
            />
          ) : (
            <GeneratedCover book={book} />
          )}
        </div>
      </div>
      <div className="book-shadow" />
      {book.status === 'In progress' && (
        <span className="glow-pulse absolute right-2 top-4 z-10 rounded-full bg-magenta px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-widest text-white sm:right-6">
          Coming Soon
        </span>
      )}
    </div>
  )
}

export function Books() {
  return (
    <section id="books" className="relative py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading
          index="05"
          label="Books & achievements"
          title="I also"
          highlight="write."
          description="A book series that teaches Python with an AI engineer’s mindset."
        />

        <ul className="grid gap-10 lg:grid-cols-2">
          {books.map((book, i) => (
            <motion.li
              key={book.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="glass glass-hover group relative flex flex-col items-center gap-4 overflow-hidden p-6 sm:p-8 md:flex-row md:items-start lg:flex-col lg:items-stretch"
            >
              {book.link ? (
                <a
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book-link shrink-0 self-center rounded-xl"
                  aria-label={`${book.title} ${book.volume} — ${book.linkLabel ?? 'open'} (opens in a new tab)`}
                  data-cursor="card"
                  data-cursor-label="Amazon ↗"
                >
                  <Book3D book={book} />
                </a>
              ) : (
                <div className="book-static shrink-0 self-center">
                  <Book3D book={book} />
                </div>
              )}

              <div className="flex-1">
                <span
                  className={`chip ${book.status === 'Published' ? '!border-emerald-400/40 !text-emerald-400' : '!border-magenta/40 !text-magenta'}`}
                >
                  {book.status === 'Published' ? <BookOpen size={12} className="mr-1.5" /> : <PenTool size={12} className="mr-1.5" />}
                  {book.status}
                </span>
                <h3 className="mt-4 text-2xl font-bold leading-tight">
                  {book.title} <span className="neon-text">({book.volume.replace('Volume ', 'Vol. ')})</span>
                </h3>
                <p className="mt-1 text-sm font-medium text-cyan">{book.role}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{book.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Topics">
                  {book.topics.map((t) => (
                    <li key={t} className="chip">{t}</li>
                  ))}
                </ul>
                {book.link && (
                  <a href={book.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6 px-5 py-2.5">
                    {book.linkLabel ?? 'View'} <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
