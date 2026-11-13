// Vercel Function: POST /api/chat → streamed AI reply (Groq).
// Set GROQ_API_KEY (and optionally GROQ_MODEL) in Vercel → Project → Settings → Environment Variables.
import { handleChat } from '../server/chat.js'

export const maxDuration = 60

export function POST(request: Request) {
  return handleChat(request, process.env.GROQ_API_KEY, process.env.GROQ_MODEL || undefined)
}
