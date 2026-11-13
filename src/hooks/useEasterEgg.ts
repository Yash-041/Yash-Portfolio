import { useEffect, useRef } from 'react'

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']
const WORD = '/matrix'

/** Fires `onTrigger` on the Konami code or when "/matrix" is typed outside a form field. */
export function useEasterEgg(onTrigger: () => void) {
  const keys = useRef<string[]>([])
  const typed = useRef('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keys.current = [...keys.current, key].slice(-KONAMI.length)
      if (keys.current.join() === KONAMI.join()) {
        keys.current = []
        onTrigger()
        return
      }
      const t = e.target as HTMLElement | null
      const editable = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      if (editable || key.length !== 1) return
      typed.current = (typed.current + key).slice(-WORD.length)
      if (typed.current === WORD) {
        typed.current = ''
        onTrigger()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onTrigger])
}
