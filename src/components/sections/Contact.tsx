import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Github, Linkedin, Loader2, Mail, Phone, Send } from 'lucide-react'
import { profile } from '../../data'
import { HudCorners } from '../ui/HudCorners'
import { Magnetic } from '../ui/Magnetic'
import { SectionHeading } from '../ui/SectionHeading'
import { TerminalWidget } from './TerminalWidget'

type Status = 'idle' | 'sending' | 'sent' | 'error'
type Errors = Partial<Record<'name' | 'email' | 'message', string>>

const ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT as string | undefined

/** ANIMATION: success state — check mark draws itself, particles burst outward. */
function Success({ onReset, viaMail }: { onReset: () => void; viaMail: boolean }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[420px] flex-col items-center justify-center text-center"
      role="status"
    >
      <div className="relative">
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
              style={{ background: ['var(--cyan)', 'var(--violet)', 'var(--magenta)'][i % 3] }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: Math.cos(angle) * 70, y: Math.sin(angle) * 70, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            />
          )
        })}
        <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true">
          <motion.circle cx="44" cy="44" r="40" fill="none" stroke="var(--cyan)" strokeWidth="2.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
          <motion.path d="M28 45 L39 56 L61 33" fill="none" stroke="var(--cyan)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
        </svg>
      </div>
      <h3 className="mt-6 text-2xl font-bold">{viaMail ? 'Draft ready!' : 'Message sent!'}</h3>
      <p className="mt-2 max-w-xs text-muted">
        {viaMail ? 'Your email app opened with the message — just hit send.' : 'Thanks for reaching out. I’ll reply within a day or two.'}
      </p>
      <button type="button" onClick={onReset} className="link-sweep mt-6 pb-0.5 text-sm text-cyan">
        Send another message
      </button>
    </motion.div>
  )
}

export function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Errors>({})

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    const next: Errors = {}
    if (!name) next.name = 'Please tell me your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'That email doesn’t look right.'
    if (message.length < 10) next.message = 'A little more detail, please (10+ characters).'
    setErrors(next)
    if (Object.keys(next).length) return

    if (!ENDPOINT) {
      // No form backend configured: open a prefilled email draft instead
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`)
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
      setStatus('sent')
      form.reset()
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  const links = [
    { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: 'Phone', value: profile.phone, href: profile.phoneHref },
    { icon: Linkedin, label: 'LinkedIn', value: profile.linkedinLabel, href: profile.linkedin, external: true },
    { icon: Github, label: 'GitHub', value: `github.com/${profile.githubUser}`, href: profile.github, external: true },
  ]

  return (
    <section id="contact" className="relative py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading
          index="07"
          label="Contact"
          title="Let’s build"
          highlight="something."
          description="Have a role, a project or just a question about RAG? My inbox is open."
        />

        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <ul className="space-y-3">
              {links.map(({ icon: Icon, label, value, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="glass glass-hover group flex items-center gap-4 rounded-2xl p-4"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-violet/20 text-cyan transition-transform group-hover:scale-110">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</span>
                      <span className="block truncate font-medium text-fg">{value}</span>
                    </span>
                    <ArrowUpRight size={18} className="text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <TerminalWidget />
          </div>

          <div className="glass group relative p-6 sm:p-10">
            <HudCorners />
            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <Success onReset={() => setStatus('idle')} viaMail={!ENDPOINT} />
              ) : (
                <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <p className="mono-label">{'// send_message()'}</p>
                  {([
                    { id: 'name', label: 'Your name', type: 'text', auto: 'name' },
                    { id: 'email', label: 'Email address', type: 'email', auto: 'email' },
                  ] as const).map((f) => (
                    <div key={f.id}>
                      <div className="field">
                        <input
                          id={f.id}
                          name={f.id}
                          type={f.type}
                          autoComplete={f.auto}
                          placeholder=" "
                          required
                          aria-invalid={Boolean(errors[f.id])}
                          aria-describedby={errors[f.id] ? `${f.id}-err` : undefined}
                        />
                        <label htmlFor={f.id}>{f.label}</label>
                      </div>
                      {errors[f.id] && <p id={`${f.id}-err`} className="mt-1.5 text-xs text-magenta">{errors[f.id]}</p>}
                    </div>
                  ))}
                  <div>
                    <div className="field">
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder=" "
                        required
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? 'message-err' : undefined}
                      />
                      <label htmlFor="message">Your message</label>
                    </div>
                    {errors.message && <p id="message-err" className="mt-1.5 text-xs text-magenta">{errors.message}</p>}
                  </div>
                  {/* Honeypot for Formspree spam filtering */}
                  <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                  {status === 'error' && (
                    <p role="alert" className="text-sm text-magenta">
                      Couldn’t send right now — please email me directly at {profile.email}.
                    </p>
                  )}
                  <Magnetic strength={0.2}>
                    <button type="submit" disabled={status === 'sending'} className="btn btn-primary disabled:opacity-60">
                      {status === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {status === 'sending' ? 'Sending…' : 'Send Message'}
                    </button>
                  </Magnetic>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
