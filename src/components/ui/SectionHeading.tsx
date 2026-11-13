import { motion } from 'framer-motion'
import { ScrambleText } from './ScrambleText'

type SectionHeadingProps = {
  index: string
  label: string
  title: string
  highlight?: string
  description?: string
  align?: 'left' | 'center'
}

/** Numbered section header: mono label → scrambled title → optional description. */
export function SectionHeading({ index, label, title, highlight, description, align = 'left' }: SectionHeadingProps) {
  const center = align === 'center'
  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-12 sm:mb-16 ${center ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'}`}
    >
      <p className={`mono-label mb-4 flex items-center gap-3 ${center ? 'justify-center' : ''}`}>
        <span className="text-cyan">{index}</span>
        <span className="h-px w-10 bg-gradient-to-r from-cyan to-transparent" aria-hidden="true" />
        {label}
      </p>
      <h2 className="text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
        <ScrambleText text={title} />
        {highlight && (
          <>
            {' '}
            <ScrambleText text={highlight} className="neon-text" delay={250} />
          </>
        )}
      </h2>
      {description && <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
    </motion.header>
  )
}
