// Netlify Function: POST /api/chat → streamed AI reply (Groq).
// Set GROQ_API_KEY (and optionally GROQ_MODEL) in Netlify → Site configuration → Environment variables.
import { handleChat } from '../../server/chat.js'

export default (request: Request) => handleChat(request, process.env.GROQ_API_KEY, process.env.GROQ_MODEL || undefined)

export const config = { path: '/api/chat' }
