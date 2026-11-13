import { books, education, experience, profile, projects, skillGroups } from '../data'

/**
 * "Ask about Yash" answer engine.
 *
 * 1. Live: POST /api/chat (server/chat.ts → Claude), streamed token by token.
 *    The API key stays on the server; the system prompt lives in chatPrompt.ts.
 * 2. Offline fallback: if the endpoint is missing, not configured, rate-limited
 *    or unreachable, a keyword matcher answers from data.ts.
 */

export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type ChatReply = { text: string; live: boolean }
export interface ChatProvider {
  /** `onText` receives the full text so far while a live answer streams in. */
  reply(messages: ChatMessage[], onText?: (textSoFar: string) => void): Promise<ChatReply>
}

type Intent = { test: RegExp; answer: () => string }

const intents: Intent[] = [
  {
    test: /\b(hi|hello|hey|yo|namaste)\b/i,
    answer: () => `Hey! 👋 I can tell you about ${profile.firstName}'s projects, internship, skills, books or how to contact him.`,
  },
  {
    test: /prepmind|jee|tutor|exam/i,
    answer: () => {
      const p = projects[0]
      return `${p.name} is ${p.tagline.toLowerCase()}. ${p.highlights.map((h) => `• ${h.title}: ${h.text}`).join('\n')}\nRepo: ${p.repo}`
    },
  },
  {
    test: /hcare|clinic|medical|health|offline|whisper/i,
    answer: () => {
      const p = projects[1]
      return `${p.name} is an ${p.tagline.toLowerCase()} platform. ${p.highlights.map((h) => `• ${h.title}: ${h.text}`).join('\n')}\nRepo: ${p.repo}`
    },
  },
  {
    test: /project|built|build|portfolio|work on/i,
    answer: () =>
      `His flagship projects:\n${projects.map((p) => `• ${p.name} — ${p.tagline}`).join('\n')}\nAsk about either one for details!`,
  },
  {
    test: /intern|experience|job|tridevum|work(ed)?\b/i,
    answer: () => {
      const e = experience[0]
      return `${e.role} at ${e.company} (${e.period}, ${e.location}):\n${e.bullets.map((b) => `• ${b.text}`).join('\n')}`
    },
  },
  {
    test: /rag|retriev|vector|langgraph|langchain|llm|genai|ai\b/i,
    answer: () =>
      'RAG is his specialty: ChromaDB + semantic chunking at Tridevum, and a LangGraph tutor with query rewriting, pgvector retrieval and grounding checks over 129 PDFs in PrepMind AI.',
  },
  {
    test: /skill|stack|tech|language|python|java|fastapi|sql|docker/i,
    answer: () => skillGroups.map((g) => `• ${g.title}: ${g.skills.map((s) => s.name).join(', ')}`).join('\n'),
  },
  {
    test: /book|author|write|wrote|amazon|volume/i,
    answer: () =>
      `He co-authored “${books[0].title}” (Vol. 1) with Kripa Shankar Sharma — available on Amazon: ${books[0].link}. Vol. 2, on ML lifecycles, FastAPI serving, RAG and agents, is in progress.`,
  },
  {
    test: /educat|college|degree|cgpa|gpa|study|student|university/i,
    answer: () => `${education[0].degree} at ${education[0].school} — ${education[0].detail}.`,
  },
  {
    test: /contact|email|hire|reach|phone|call|available|resume|cv/i,
    answer: () =>
      `He's open to opportunities! Email ${profile.email}, call ${profile.phone}, or download the resume from the hero section (${profile.resume}).`,
  },
  {
    test: /where|location|based|live/i,
    answer: () => `${profile.firstName} is based in ${profile.location}.`,
  },
]

/** Offline provider: keyword intents over data.ts, with a short artificial delay. */
export const localProvider: ChatProvider = {
  async reply(messages) {
    const last = messages[messages.length - 1]?.content ?? ''
    await new Promise((r) => setTimeout(r, 450 + Math.random() * 400))
    const hit = intents.find((i) => i.test.test(last))
    const text =
      hit?.answer() ??
      `I'm in offline mode right now, so I may not know that one. Try asking about projects, RAG, skills, the internship or books — or email ${profile.email}.`
    return { text, live: false }
  },
}

/**
 * Live provider: streams from the serverless chat function.
 * Any failure before the first token falls back to the local provider.
 * After a failure we stay offline for the rest of the visit to avoid repeated slow errors.
 */
export function httpProvider(endpoint: string): ChatProvider {
  let offline = false
  return {
    async reply(messages, onText) {
      if (offline) return localProvider.reply(messages)
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        })
        const type = res.headers.get('content-type') ?? ''
        if (!res.ok || !res.body || !type.startsWith('text/plain')) {
          // 503 = no API key configured; 404 = no function deployed (e.g. static hosting)
          if (res.status === 503 || res.status === 404 || res.status === 405) offline = true
          throw new Error(String(res.status))
        }
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let text = ''
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          text += decoder.decode(value, { stream: true })
          onText?.(text)
        }
        text += decoder.decode()
        if (!text.trim()) throw new Error('empty reply')
        return { text, live: true }
      } catch {
        return localProvider.reply(messages)
      }
    },
  }
}

const endpoint = (import.meta.env.VITE_CHAT_ENDPOINT as string | undefined) || '/api/chat'
export const chatProvider: ChatProvider = httpProvider(endpoint)
