import { buildSystemPrompt } from '../src/lib/chatPrompt.js'

/**
 * POST /api/chat: streams an AI reply (Groq) as plain text.
 *
 * Request body: { messages: [{ role: "user" | "assistant", content: string }] }
 * Response:     text/plain stream of the answer, or a JSON error (4xx/5xx), in
 *               which case the widget falls back to its offline answer engine.
 *
 * Runtime-agnostic (Web Request → Response): wrapped by api/chat.ts (Vercel),
 * netlify/functions/chat.ts (Netlify) and the Vite dev middleware.
 * The API key is read from GROQ_API_KEY on the server and never reaches the browser.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
/** Override with the GROQ_MODEL env var; see https://console.groq.com/docs/models */
const DEFAULT_MODEL = 'openai/gpt-oss-120b'
const MAX_TURNS = 12 // conversation turns forwarded to the model
const MAX_CHARS = 1000 // per visitor message
// Caps tokens per reply. Includes the model's hidden reasoning; answers are asked to stay ~120 words.
const MAX_TOKENS = 1024

// Best-effort per-IP rate limit (in-memory: resets on cold start, per instance).
const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 20
const hits = new Map<string, number[]>()

const SYSTEM = buildSystemPrompt()

type ChatTurn = { role: 'user' | 'assistant'; content: string }
type GroqChunk = { choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[] }

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

function rateLimited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear() // keep memory bounded
  return recent.length > MAX_REQUESTS
}

/** Keep only well-formed user/assistant text turns, starting and ending with a user turn. */
function sanitize(input: unknown): ChatTurn[] | null {
  if (!Array.isArray(input)) return null
  const msgs: ChatTurn[] = []
  for (const m of input.slice(-MAX_TURNS * 2)) {
    if (!m || typeof m !== 'object') continue
    const { role, content } = m as { role?: unknown; content?: unknown }
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue
    const text = content.trim().slice(0, MAX_CHARS)
    if (text) msgs.push({ role, content: text })
  }
  const trimmed = msgs.slice(-MAX_TURNS)
  while (trimmed.length && trimmed[0].role !== 'user') trimmed.shift() // the widget's greeting comes first
  return trimmed.length && trimmed[trimmed.length - 1].role === 'user' ? trimmed : null
}

export async function handleChat(request: Request, apiKey: string | undefined, model = DEFAULT_MODEL): Promise<Response> {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' })
  if (!apiKey) return json(503, { error: 'not_configured' })

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) return json(429, { error: 'rate_limited' })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'invalid_json' })
  }
  const messages = sanitize((body as { messages?: unknown })?.messages)
  if (!messages) return json(400, { error: 'invalid_messages' })

  const upstream = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: true,
      max_completion_tokens: MAX_TOKENS,
      reasoning_effort: 'low', // quick, cheap chat answers
      messages: [{ role: 'system', content: SYSTEM }, ...messages],
    }),
  }).catch(() => null)

  if (!upstream || !upstream.ok || !upstream.body) {
    const detail = upstream ? `${upstream.status} ${await upstream.text().catch(() => '')}` : 'network error'
    console.error('Groq request failed:', detail.slice(0, 500))
    // 429 from Groq = free-tier limit reached; let the widget answer offline instead
    return json(upstream?.status === 429 ? 429 : 502, { error: 'upstream_failed' })
  }

  // Re-emit only the answer text from Groq's server-sent events (reasoning is dropped)
  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''

  const stream = new ReadableStream<Uint8Array>({
    // A pull() that enqueues nothing is never called again, so keep reading until we
    // have answer text (the first chunks are often reasoning-only) or the stream ends.
    async pull(controller) {
      try {
        for (;;) {
          const { value, done } = await reader.read()
          if (done) {
            controller.close()
            return
          }
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          let out = ''
          for (const line of lines) {
            const data = line.startsWith('data:') ? line.slice(5).trim() : ''
            if (!data || data === '[DONE]') continue
            try {
              out += (JSON.parse(data) as GroqChunk).choices?.[0]?.delta?.content ?? ''
            } catch {
              /* ignore keep-alives / partial lines */
            }
          }
          if (out) {
            controller.enqueue(encoder.encode(out))
            return
          }
        }
      } catch (error) {
        console.error('Groq stream interrupted:', error)
        controller.enqueue(encoder.encode('\n\n[Connection interrupted. Please try again.]'))
        controller.close()
      }
    },
    cancel() {
      void reader.cancel()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Chat-Source': 'groq' },
  })
}
