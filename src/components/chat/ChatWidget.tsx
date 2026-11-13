import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, X } from 'lucide-react'
import { profile } from '../../data'
import { chatProvider, type ChatMessage } from '../../lib/chatEngine'

const SUGGESTIONS = ['What has Yash built?', 'Tell me about his internship', 'Is he good at RAG?', 'How can I contact him?']

/** Turns bare URLs and email addresses in an answer into clickable links. */
function linkify(text: string): ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g)
  return parts.map((part, i) => {
    if (i % 2 === 0) return part
    const url = part.replace(/[.,;:!?]+$/, '')
    const trailing = part.slice(url.length)
    const href = url.includes('@') && !url.startsWith('http') ? `mailto:${url}` : url
    return (
      <span key={i}>
        <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-cyan underline underline-offset-2 [overflow-wrap:anywhere]">
          {url}
        </a>
        {trailing}
      </span>
    )
  })
}

/** Corner "Ask about Yash" assistant. UI only — answers come from `chatProvider`. */
export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false) // waiting for the first token
  const [streaming, setStreaming] = useState(false) // an answer is still arriving
  const [live, setLive] = useState<boolean | null>(null) // null until the first answer
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I’m Yash’s portfolio assistant. Ask me anything about his work, skills or books.' },
  ])
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        launcherRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const setLastAssistant = (content: string) =>
    setMessages((m) => {
      const copy = m.slice()
      copy[copy.length - 1] = { role: 'assistant', content }
      return copy
    })

  const ask = async (text: string) => {
    const q = text.trim()
    if (!q || busy || streaming) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setInput('')
    setBusy(true)
    setStreaming(true)

    // Live answers stream in token by token: the first chunk replaces the typing dots
    let started = false
    const reply = await chatProvider.reply(next, (soFar) => {
      if (!started) {
        started = true
        setBusy(false)
        setMessages((m) => [...m, { role: 'assistant', content: soFar }])
      } else {
        setLastAssistant(soFar)
      }
    })
    setLive(reply.live)
    setBusy(false)

    if (started) {
      setLastAssistant(reply.text)
      setStreaming(false)
      return
    }
    // ANIMATION: offline answers are "typed" out word by word
    setMessages((m) => [...m, { role: 'assistant', content: '' }])
    const words = reply.text.split(/(\s+)/)
    let i = 0
    const id = window.setInterval(() => {
      i += 2
      setLastAssistant(words.slice(0, i).join(''))
      if (i >= words.length) {
        window.clearInterval(id)
        setStreaming(false)
      }
    }, 30)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void ask(input)
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Ask about Yash"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{ transformOrigin: 'bottom right' }}
            className="glass absolute bottom-16 right-0 flex h-[min(520px,calc(100svh-120px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden !bg-[var(--glass-strong)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className="relative h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-cyan via-violet to-magenta p-[2px]">
                <img src={profile.chatAvatar} alt="" width={40} height={40} className="h-full w-full rounded-full object-cover" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg bg-[#22e58b]" />
              </span>
              <div className="flex-1">
                <p className="font-display text-sm font-semibold">Ask about Yash</p>
                <p className="font-mono text-[10px] text-muted">
                  {live === null ? 'resume-grounded assistant' : live ? 'AI · live answers' : 'offline mode · quick answers'}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="icon-btn h-8 w-8" aria-label="Close chat">
                <X size={15} />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite" data-lenis-prevent>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'ml-auto rounded-br-sm bg-gradient-to-r from-cyan/25 to-violet/25 text-fg'
                      : 'rounded-bl-sm border border-line bg-[color-mix(in_srgb,var(--fg)_4%,transparent)] text-fg-2'
                  }`}
                >
                  {linkify(m.content)}
                </motion.div>
              ))}
              {busy && (
                <div className="flex w-fit gap-1 rounded-2xl border border-line px-4 py-3" aria-label="Assistant is typing">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-cyan"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              )}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => void ask(s)} className="chip transition-colors hover:border-cyan hover:text-cyan">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line p-3">
              <label htmlFor="chat-input" className="sr-only">Your question</label>
              <input
                ref={inputRef}
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about projects, skills…"
                autoComplete="off"
                className="flex-1 rounded-full border border-line bg-transparent px-4 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-cyan/60"
              />
              <button type="submit" disabled={!input.trim() || busy || streaming} className="grid h-10 w-10 place-items-center rounded-full bg-cyan on-accent transition-opacity disabled:opacity-40" aria-label="Send">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Ask about Yash'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`group relative flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet font-display text-sm font-semibold on-accent shadow-[0_0_30px_-4px_var(--cyan)] ${
          open ? 'pl-4 pr-5' : 'pl-1.5 pr-1.5 sm:pr-5'
        }`}
      >
        {open ? (
          <X size={20} />
        ) : (
          <img src={profile.chatAvatar} alt="" width={44} height={44} className="h-11 w-11 rounded-full border-2 border-white/70 object-cover" />
        )}
        <span className="hidden sm:inline">{open ? 'Close' : 'Ask about Yash'}</span>
      </motion.button>
    </div>
  )
}
