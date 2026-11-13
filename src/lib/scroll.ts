import type { MouseEvent } from 'react'
import type Lenis from 'lenis'

/** Lenis instance shared app-wide (null when reduced motion disables it). */
let lenis: Lenis | null = null

export const setLenis = (instance: Lenis | null) => {
  lenis = instance
}

const NAV_OFFSET = -88

/** Smooth-scroll to a section id (or 0 for the top), with or without Lenis. */
export function scrollToTarget(target: string | 0) {
  const el = target === 0 ? null : document.getElementById(target)
  if (target !== 0 && !el) return
  if (lenis) {
    lenis.scrollTo(el ?? 0, { offset: el ? NAV_OFFSET : 0, duration: 1.4 })
  } else if (el) {
    el.scrollIntoView({ block: 'start' })
  } else {
    window.scrollTo({ top: 0 })
  }
  if (el) history.replaceState(null, '', `#${target}`)
  else history.replaceState(null, '', window.location.pathname)
}

/** Freeze page scrolling (e.g. while a modal is open). */
export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  if (locked) lenis?.stop()
  else lenis?.start()
}

/** onClick handler for in-page anchors: keeps the href for no-JS / middle-click. */
export function handleAnchorClick(e: MouseEvent<HTMLAnchorElement>, id: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  scrollToTarget(id)
}
