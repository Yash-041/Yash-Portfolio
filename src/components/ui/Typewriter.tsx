import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

type TypewriterProps = {
  words: string[]
  className?: string
  /** ms per typed character */
  typeSpeed?: number
  /** ms per deleted character */
  deleteSpeed?: number
  /** ms to hold a finished word */
  hold?: number
}

/** ANIMATION: typewriter that types, holds, deletes and cycles through `words`. */
export function Typewriter({ words, className = '', typeSpeed = 70, deleteSpeed = 35, hold = 1600 }: TypewriterProps) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reduce) {
      const t = window.setTimeout(() => setIndex((i) => (i + 1) % words.length), 2500)
      return () => window.clearTimeout(t)
    }
    const word = words[index]
    let t: number
    if (!deleting && text === word) t = window.setTimeout(() => setDeleting(true), hold)
    else if (deleting && text === '') {
      setDeleting(false)
      setIndex((i) => (i + 1) % words.length)
      return
    } else {
      t = window.setTimeout(
        () => setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
        deleting ? deleteSpeed : typeSpeed,
      )
    }
    return () => window.clearTimeout(t)
  }, [text, deleting, index, words, reduce, typeSpeed, deleteSpeed, hold])

  return (
    <span className={className}>
      <span className="sr-only">{words.join(', ')}</span>
      <span aria-hidden="true">
        {reduce ? words[index] : text}
        <span className="caret ml-0.5 inline-block h-[0.95em] w-[3px] translate-y-[0.12em] bg-cyan" />
      </span>
    </span>
  )
}
