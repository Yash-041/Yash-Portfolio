/**
 * ─────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH FOR ALL PORTFOLIO CONTENT
 *  Edit this file to update text, links, projects, skills, etc.
 *  No component contains hard-coded resume content.
 * ─────────────────────────────────────────────────────────────
 */

export const profile = {
  name: 'Yash Sharma',
  firstName: 'Yash',
  initials: 'YS',
  title: 'Backend & AI Engineer',
  email: 'yashsharma959931@gmail.com',
  phone: '+91-8750818173',
  phoneHref: 'tel:+918750818173',
  location: 'Ghaziabad · Delhi-NCR, India',
  github: 'https://github.com/Yash-041',
  githubUser: 'Yash-041',
  linkedin: 'https://www.linkedin.com/in/sharmayash11',
  linkedinLabel: 'linkedin.com/in/sharmayash11',
  /** File lives in /public. `resumeDownloadName` is the filename the browser saves it as. */
  resume: '/Yash_resume.pdf',
  resumeDownloadName: 'Yash_Sharma_Resume.pdf',
  /** Portrait (in /public/images), made from IMG_20261114_035408.png by scripts/photo-assets.cjs.
   *  Same photo, trimmed to a square and compressed (the 2.4 MB original is too heavy to serve). */
  photo: {
    webp800: '/images/yash-portrait-800.webp',
    webp480: '/images/yash-portrait-480.webp',
    jpg: '/images/yash-portrait-800.jpg',
    avatar: '/images/yash-avatar.webp',
    alt: 'Yash Sharma',
  },
  /** "Ask about Yash" chatbot avatar, cropped from IMG_20261114_043552.jpg. */
  chatAvatar: '/images/chat-bot-avatar.webp',
  /** Rotating typewriter subtitle in the hero. */
  roles: ['Backend Engineer', 'AI/ML Engineer', 'RAG Systems Builder', 'Author'],
  pitch:
    'I build scalable async backends and intelligent AI systems — from RAG pipelines to offline-first on-device AI.',
  /** Shown in the pulsing "currently building" badge. */
  currentlyBuilding: 'PrepMind AI · adaptive exam engine',
  languages: ['English', 'Hindi'],
  bio: [
    'I’m a B.Tech Computer Science student at R.D. Engineering College (CGPA 8.5/10, graduating Aug 2027), based in Ghaziabad, Delhi-NCR.',
    'I care about the unglamorous parts that make AI useful: async APIs that don’t fall over, retrieval that cites its sources, and systems that keep working when the network doesn’t.',
    'When I’m not shipping backends, I write about AI — I co-authored “Code in Python, Think in AI” and I’m writing Volume 2.',
  ],
}

export type NavItem = { id: string; label: string }
export const navItems: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'books', label: 'Books' },
  { id: 'contact', label: 'Contact' },
]

export type Stat = { value: number; decimals?: number; suffix?: string; label: string }
export const stats: Stat[] = [
  { value: 8.5, decimals: 1, label: 'CGPA / 10' },
  { value: 3, suffix: '+', label: 'AI projects' },
  { value: 129, label: 'PDFs indexed for RAG' },
  { value: 2, label: 'Books' },
]

export type Experience = {
  role: string
  company: string
  period: string
  location: string
  type: string
  bullets: { title: string; text: string }[]
  tags: string[]
}
export const experience: Experience[] = [
  {
    role: 'AI/ML Engineer Intern',
    company: 'Tridevum Technology',
    period: '02/2026 – 08/2026',
    location: 'Delhi-NCR, India',
    type: 'Internship',
    bullets: [
      {
        title: 'Backend & API integration',
        text: 'Built async FastAPI microservices integrating OpenAI and Gemini APIs, with rate limiting and error logging.',
      },
      {
        title: 'RAG & vector search',
        text: 'Engineered RAG pipelines using ChromaDB and semantic chunking for context-aware retrieval over custom datasets.',
      },
      {
        title: 'Prompt engineering & prototyping',
        text: 'Optimized prompts with JSON Schema outputs to minimize hallucinations; built interactive demo dashboards in Streamlit.',
      },
    ],
    tags: ['FastAPI', 'AsyncIO', 'OpenAI', 'Gemini', 'ChromaDB', 'Streamlit'],
  },
]

export type ProjectCategory = 'AI' | 'Backend' | 'Frontend'
export type Project = {
  id: string
  name: string
  tagline: string
  summary: string
  highlights: { title: string; text: string }[]
  stack: string[]
  categories: ProjectCategory[]
  /** Clicking the card opens this repository. */
  repo: string
  /** Set to a URL once a live deployment exists; the button shows "Demo soon" until then. */
  demo?: string
  /** Two colours used by the card's animated preview. */
  accent: [string, string]
  /** Preview animation style on the card. */
  preview: 'chat' | 'wave'
  metrics: { value: string; label: string }[]
}

export const projects: Project[] = [
  {
    id: 'prepmind',
    name: 'PrepMind AI',
    tagline: 'AI-Powered JEE Preparation Platform',
    summary:
      'A grounded JEE tutor that cites its sources, plans each student’s daily practice and simulates the real exam.',
    highlights: [
      {
        title: 'RAG tutor on LangGraph',
        text: 'Query rewriting → pgvector retrieval → grounding check over 129 NCERT/JEE PDFs, with page-level citations and live answer streaming over Server-Sent Events.',
      },
      {
        title: 'Daily practice with streaks',
        text: 'A personalised set of 20 questions every day — 14 from weak topics, 6 for revision — driven by per-chapter weakness tracking and a streak system.',
      },
      {
        title: 'Adaptive exam simulator',
        text: 'Assembles a 75-question, 180-minute JEE Main mock paper, adjusts difficulty across 3 levels from past accuracy, and generates questions on demand when the bank runs short.',
      },
    ],
    stack: ['Python', 'FastAPI', 'LangGraph', 'PostgreSQL', 'pgvector', 'React', 'TypeScript'],
    categories: ['AI', 'Backend'],
    repo: 'https://github.com/Yash-041/PrepMind',
    accent: ['#00F0FF', '#8B5CF6'],
    preview: 'chat',
    metrics: [
      { value: '129', label: 'PDFs indexed' },
      { value: '75Q', label: 'Mock exam' },
      { value: 'SSE', label: 'Streaming' },
    ],
  },
  {
    id: 'hcare',
    name: 'HCare',
    tagline: 'Offline-First Clinical Documentation & On-Device AI',
    summary:
      'Clinical notes captured by voice and camera, structured by on-device AI and synced securely — with no network required.',
    highlights: [
      {
        title: 'Multimodal clinical capture',
        text: 'Async Web Worker inference pipeline — Whisper speech-to-text, image preprocessing, OCR, local LLM and embeddings — transcribes voice notes and digitizes lab reports fully offline.',
      },
      {
        title: 'Hybrid case-file extraction',
        text: 'Deterministic rules + medical lexicons + local LLM generation populate patient records with field-level provenance and a human-in-the-loop review queue.',
      },
      {
        title: 'Encrypted offline sync',
        text: 'Client-side cryptographic vault and encrypted blob store over IndexedDB, background sync with diff/merge conflict resolution, RBAC and audit logging.',
      },
    ],
    stack: ['TypeScript', 'React', 'Vite', 'Web Workers', 'Whisper', 'IndexedDB', 'Python', 'SQL', 'Docker'],
    categories: ['AI', 'Frontend'],
    repo: 'https://github.com/Yash-041/HCare',
    accent: ['#FF2E97', '#8B5CF6'],
    preview: 'wave',
    metrics: [
      { value: '100%', label: 'Offline' },
      { value: 'E2E', label: 'Encrypted' },
      { value: 'HITL', label: 'Review' },
    ],
  },
]

export type Skill = { name: string; level: number }
export type SkillGroup = { title: string; icon: 'code' | 'database' | 'brain' | 'flask' | 'terminal'; skills: Skill[] }

/** `level` (0–100) drives the progress rings — a self-assessment, adjust freely. */
export const skillGroups: SkillGroup[] = [
  {
    title: 'Core Development',
    icon: 'code',
    skills: [
      { name: 'Python', level: 92 },
      { name: 'Java', level: 75 },
      { name: 'DSA', level: 80 },
      { name: 'SQL', level: 85 },
      { name: 'OOP', level: 85 },
      { name: 'RESTful Microservices', level: 85 },
      { name: 'AsyncIO', level: 82 },
    ],
  },
  {
    title: 'Data Storage',
    icon: 'database',
    skills: [
      { name: 'PostgreSQL', level: 84 },
      { name: 'MySQL', level: 78 },
      { name: 'ChromaDB', level: 82 },
      { name: 'FAISS', level: 74 },
    ],
  },
  {
    title: 'AI / GenAI',
    icon: 'brain',
    skills: [
      { name: 'FastAPI', level: 90 },
      { name: 'LangChain', level: 82 },
      { name: 'LangGraph', level: 84 },
      { name: 'RAG Pipelines', level: 88 },
    ],
  },
  {
    title: 'Testing & Deployment',
    icon: 'flask',
    skills: [
      { name: 'Unit Testing', level: 76 },
      { name: 'Docker', level: 78 },
      { name: 'CI/CD Basics', level: 68 },
      { name: 'Git/GitHub', level: 86 },
      { name: 'Postman', level: 84 },
    ],
  },
  {
    title: 'DevOps & Tooling',
    icon: 'terminal',
    skills: [
      { name: 'Linux Administration', level: 72 },
      { name: 'VS Code', level: 90 },
    ],
  },
]

/** Words orbiting in the 3D skill sphere. */
export const skillCloud = [
  'Python', 'FastAPI', 'LangGraph', 'LangChain', 'RAG', 'pgvector', 'PostgreSQL', 'ChromaDB',
  'FAISS', 'AsyncIO', 'Docker', 'Java', 'SQL', 'MySQL', 'Whisper', 'OpenAI', 'Gemini',
  'React', 'TypeScript', 'Linux', 'Git', 'Postman', 'SSE', 'IndexedDB', 'Streamlit', 'DSA',
]

/** Infinite marquee strip. */
export const marqueeTech = [
  'Python', 'FastAPI', 'LangGraph', 'LangChain', 'PostgreSQL', 'pgvector', 'ChromaDB', 'FAISS',
  'Docker', 'React', 'TypeScript', 'Whisper', 'OpenAI', 'Gemini', 'Linux', 'Git',
]

export type Book = {
  id: string
  title: string
  volume: string
  status: 'Published' | 'In progress'
  role: string
  description: string
  topics: string[]
  /** Cover image in /public. If absent, a generated CSS cover is rendered. */
  cover?: string
  /** Clicking the book opens this store page. */
  link?: string
  linkLabel?: string
}
export const books: Book[] = [
  {
    id: 'vol-1',
    title: 'Code in Python, Think in AI',
    volume: 'Volume 1',
    status: 'Published',
    role: 'Co-author with Kripa Shankar Sharma',
    description:
      'Bridges Python fundamentals — OOP and async design — with practical AI mental models and algorithm design. Hands-on code examples and structured problem sets take readers from basic scripting to production-grade practice.',
    topics: ['Python fundamentals', 'OOP & async design', 'AI mental models', 'Algorithm design', 'Problem sets'],
    cover: '/books/code-in-python-think-in-ai-vol-1.jpg',
    link: 'https://amzn.in/d/07JYtqNm',
    linkLabel: 'Buy on Amazon',
  },
  {
    id: 'vol-2',
    title: 'Code in Python, Think in AI',
    volume: 'Volume 2',
    status: 'In progress',
    role: 'Author · upcoming',
    description:
      'An end-to-end guide to enterprise ML lifecycles — data quality, feature pipelines, experiment tracking and model monitoring — with capstones on FastAPI model serving, Docker, GenAI, RAG and agentic systems.',
    topics: ['ML lifecycles', 'Feature pipelines', 'FastAPI serving', 'Docker', 'RAG & agents'],
  },
]

export type Education = { degree: string; school: string; detail: string; period: string; place: string }
export const education: Education[] = [
  {
    degree: 'B.Tech, Computer Science & Engineering',
    school: 'R.D. Engineering College',
    detail: 'CGPA 8.5 / 10 · Expected Aug 2027',
    period: '2023 – 2027',
    place: 'Ghaziabad',
  },
  {
    degree: 'Senior Secondary (Class XII), Science',
    school: 'Paras Public School',
    detail: 'Aggregate 73.8%',
    period: '2022 – 2023',
    place: 'Noida',
  },
  {
    degree: 'Secondary (Class X)',
    school: 'C.C.S. Mem. Public School',
    detail: 'Aggregate 73.8%',
    period: '2020 – 2021',
    place: 'Ghaziabad',
  },
]

/** Lines typed by the boot intro. */
export const bootLines = [
  'Initializing neural core...',
  'Mounting async runtime [FastAPI]...',
  'Indexing 129 documents into vector store...',
  'Loading projects...',
  'Ready.',
]
