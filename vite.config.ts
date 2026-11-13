import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Dev-only: serve POST /api/chat from server/chat.ts, the same handler the
 * Vercel/Netlify functions use in production. Reads GROQ_API_KEY from
 * .env.local (never exposed to the browser: it has no VITE_ prefix).
 */
function devChatApi(apiKey: string | undefined, model: string | undefined): Plugin {
  return {
    name: 'dev-chat-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          const { handleChat } = (await server.ssrLoadModule('/server/chat.ts')) as {
            handleChat: (request: Request, apiKey: string | undefined, model?: string) => Promise<Response>
          }
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const request = new Request(`http://localhost${req.originalUrl ?? '/api/chat'}`, {
            method: req.method,
            headers: { 'content-type': req.headers['content-type'] ?? 'application/json', 'x-forwarded-for': req.socket.remoteAddress ?? '' },
            body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
          })
          const response = await handleChat(request, apiKey, model || undefined)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          if (response.body) for await (const chunk of response.body) res.write(chunk)
          res.end()
        } catch (error) {
          console.error(error)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'dev_handler_failed' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // Public path the site is served from. GitHub Pages serves this repo at
    // https://yash-041.github.io/Yash-Portfolio/, so the deploy workflow sets
    // BASE_PATH=/Yash-Portfolio/. Local dev (and Vercel/Netlify) use '/'.
    base: env.BASE_PATH || '/',
    plugins: [react(), tailwindcss(), devChatApi(env.GROQ_API_KEY, env.GROQ_MODEL)],
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      // three.js is ~800 KB but lazy-loaded after first paint, so the warning is expected.
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          // Split heavy libraries into their own cacheable chunks.
          // three + R3F only load when the hero scene is lazily mounted.
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return
            if (id.includes('three') || id.includes('@react-three')) return 'three'
            if (id.includes('gsap')) return 'gsap'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'react'
          },
        },
      },
    },
  }
})
