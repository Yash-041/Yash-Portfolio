# Yash Sharma — Portfolio

A futuristic "Neural Cyberpunk" portfolio built with React, Vite, TypeScript, Tailwind CSS v4, Framer Motion, GSAP ScrollTrigger, React Three Fiber and Lenis.

## Features

- Terminal-style boot intro (plays once per session, any key skips)
- Interactive 3D neural constellation in the hero that reacts to the mouse (lazy-loaded, pauses off-screen)
- Custom cursor with trailing ring, magnetic buttons, 3D tilt cards with glare, text-scramble headings, click ripples
- Scroll progress bar, Lenis smooth scrolling, GSAP scroll-drawn experience timeline
- Project cards open their GitHub repo on click; **View Details** opens an animated case-study modal; category filter
- 3D CSS skill sphere, animated progress rings, infinite tech marquee (pauses on hover)
- 3D book mockups — Vol. 1 links to Amazon; Vol. 2 shows a glowing "Coming Soon" badge
- Live GitHub feed: a terminal-style `git log` of the latest commits, recently pushed repos, stats and the contribution chart
- Contact form (Formspree, or a prefilled email draft as fallback), typing terminal widget
- "Ask about Yash" AI chat (Groq, `openai/gpt-oss-120b`): streamed, resume-grounded answers, with an offline fallback
- Easter egg: Konami code (↑↑↓↓←→←→BA) or type `/matrix`
- Dark / light-neon theme toggle (remembered)
- Accessibility: semantic landmarks, skip link, focus styles, focus-trapped modal, screen-reader text for animated copy, full `prefers-reduced-motion` fallback (no intro, 3D, smooth scroll, cursor or loops)
- SEO: meta + Open Graph tags, JSON-LD `Person` schema, sitemap, robots.txt

## Project structure

```text
public/
  Yash_resume.pdf                       downloaded by "Download Resume"
  books/code-in-python-think-in-ai-vol-1.jpg
  images/                               portrait (WebP + JPEG) and chat avatar
  favicon.svg  og-image.png  robots.txt  sitemap.xml
src/
  data.ts                 ← ALL content: profile, links, projects, skills, books…
  index.css               design tokens (colours/fonts), glass/HUD/book styles, keyframes
  App.tsx                 page composition + global effects
  main.tsx
  lib/
    scroll.ts             Lenis instance, scrollTo, scroll lock
    chatEngine.ts         chat provider interface, local + HTTP providers
  hooks/                  useLenis, useActiveSection, useTheme, useEasterEgg, useRipple, usePointer
  components/
    effects/              BootSequence, CustomCursor, ScrollProgress, Background, MatrixRain
    three/NeuralScene.tsx 3D hero (config block at the top)
    layout/               Navbar, Footer
    sections/             Hero, About, Experience, Projects (+ Modal, Preview), Skills (+ SkillSphere),
                          Books, Education (+ GitHub activity), Contact (+ TerminalWidget)
    ui/                   Magnetic, TiltCard, ScrambleText, Typewriter, CountUp, ProgressRing,
                          SectionHeading, HudCorners
    chat/ChatWidget.tsx
```

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

## Environment variables

Copy `.env.example` to `.env.local` (gitignored) for local development, and set the same variables in your host for production:

| Variable | Purpose |
| --- | --- |
| `GROQ_API_KEY` | Powers the "Ask about Yash" AI chat (server-side only; never sent to the browser). Get one at https://console.groq.com/keys. Without it, the chat answers from `data.ts` in offline mode. |
| `GROQ_MODEL` | Optional. Defaults to `openai/gpt-oss-120b`. |
| `VITE_FORMSPREE_ENDPOINT` | Optional. Formspree form URL (e.g. `https://formspree.io/f/abcdwxyz`). Without it, the form opens a prefilled email draft. |
| `VITE_CHAT_ENDPOINT` | Optional. Overrides the chat endpoint (defaults to `/api/chat`). |

### How the AI chat works

`src/components/chat/ChatWidget.tsx` → `src/lib/chatEngine.ts` → `POST /api/chat` → `server/chat.ts` → Groq, streamed back token by token.

- The system prompt is generated from `data.ts` (`src/lib/chatPrompt.ts`), so the AI only knows what the site says. Update `data.ts` and the chat stays in sync.
- `server/chat.ts` caps message length, history and reply tokens, and rate-limits each IP (20 requests / 10 min, best effort).
- If the endpoint is missing, unconfigured, rate-limited or down, the widget falls back to offline keyword answers; the header shows which mode is active.
- The same handler runs in `npm run dev` (Vite middleware), on Vercel (`api/chat.ts`) and on Netlify (`netlify/functions/chat.ts`). `npm run preview` has no API, so the chat runs offline there.

### Live GitHub feed

The GitHub activity card (Education section) calls the public GitHub API from the visitor's browser: the latest commits across the 3 most recently pushed repos, plus the recently updated repos. No token is needed. Results are cached for 10 minutes per tab to stay under GitHub's 60-requests-per-hour limit for anonymous visitors. Edit `src/lib/github.ts` to change what's shown.

## Deploy

### Vercel
1. Push the repo to GitHub, then **Add New → Project** in Vercel and import it.
2. Framework preset: **Vite** (build `npm run build`, output `dist`). Vercel picks up `api/chat.ts` automatically.
3. Under **Settings → Environment Variables**, add `GROQ_API_KEY` (and any optional variables), then **Deploy**.

### Netlify
1. **Add new site → Import an existing project** and pick the repo.
2. Build command `npm run build`, publish directory `dist`. Netlify picks up `netlify/functions/chat.ts` automatically.
3. Add `GROQ_API_KEY` (and any optional variables) under **Site configuration → Environment variables**, then deploy.

**After the first deploy**, replace `https://yash-sharma-portfolio.vercel.app` with your real domain in `index.html` (canonical, `og:*`, JSON-LD), `public/sitemap.xml` and `public/robots.txt`.

## Customization

| What | Where |
| --- | --- |
| Text, links, projects, skills, books, education, boot lines | `src/data.ts` |
| Project repo / live demo links | `projects[].repo` / `projects[].demo` in `data.ts` (the "Demo soon" chip becomes a **Live Demo** button once `demo` is set) |
| Amazon link / book covers | `books[]` in `data.ts`; covers live in `public/books/` |
| Resume | replace `public/Yash_resume.pdf` (keep the name, or change `profile.resume`) |
| Colours (dark + light) | CSS variables at the top of `src/index.css` |
| Fonts | Google Fonts link in `index.html` + `--font-*` in `src/index.css` |
| 3D scene (node count, link distance, mouse pull, colours, speed) | `CONFIG` at the top of `src/components/three/NeuralScene.tsx` |
| Animation feel | commented `ANIMATION:` blocks in each component (spring stiffness, durations, lerp) |
| Skill ring percentages | `skillGroups[].skills[].level` in `data.ts` |
| Your photo | Source: `public/images/IMG_20261114_035408.png`. Served versions: `yash-portrait-800/480.webp`, `-800.jpg`, `yash-avatar.webp` (paths in `profile.photo` in `data.ts`). To use a new photo: `npm i -D sharp`, adjust the crop boxes at the top of `scripts/photo-assets.cjs`, then run `node scripts/photo-assets.cjs <photo> public` (also rebuilds `og-image.png`) |
| Social preview image | `public/og-image.png` (1200×630, includes the photo) |
