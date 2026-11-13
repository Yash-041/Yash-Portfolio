import type { Project } from '../../data'

/**
 * Animated "screen" at the top of each project card (stands in for a video preview).
 * Idle state is a slow gradient; on hover the faux UI comes alive (see .pv-* in index.css).
 */
export function ProjectPreview({ project }: { project: Project }) {
  const [a, b] = project.accent
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="pv-bg absolute -inset-8"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${a}55, transparent 50%), radial-gradient(circle at 85% 80%, ${b}66, transparent 55%), linear-gradient(135deg, #070a16, #0d1430)`,
        }}
      />
      <div className="bg-grid absolute inset-0 opacity-70" />
      <div className="bg-scanlines absolute inset-0" />

      {project.preview === 'chat' ? (
        // PrepMind: streaming, citation-backed tutor answer
        <div className="absolute inset-x-6 top-6 space-y-3 font-mono text-[10px] sm:inset-x-10">
          <div className="ml-auto w-fit rounded-lg rounded-br-sm bg-white/10 px-3 py-2 text-white/80 backdrop-blur">
            Why does current lag voltage in an inductor?
          </div>
          <div className="pv-fade w-[85%] space-y-2 rounded-lg rounded-bl-sm border border-white/10 bg-black/40 p-3 backdrop-blur">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest" style={{ color: a }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: a }} /> streaming · sse
            </div>
            {[100, 92, 70].map((w, i) => (
              <div key={i} className="pv-line h-1.5 rounded-full bg-white/50" style={{ width: `${w}%`, transitionDelay: `${i * 160}ms` }} />
            ))}
            <span className="inline-block rounded border px-1.5 py-0.5 text-[9px] text-white/80" style={{ borderColor: `${b}aa` }}>
              NCERT Physics XII · p.237
            </span>
          </div>
        </div>
      ) : (
        // HCare: on-device Whisper transcription waveform
        <div className="absolute inset-x-6 top-6 font-mono text-[10px] text-white/80 sm:inset-x-10">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: a }} /> REC · whisper.local
            </span>
            <span className="rounded border border-white/20 px-1.5 py-0.5">OFFLINE ✓</span>
          </div>
          <div className="mt-4 flex h-14 items-end gap-[3px]" aria-hidden="true">
            {Array.from({ length: 36 }, (_, i) => (
              <span
                key={i}
                className="pv-bar w-full rounded-full"
                style={{
                  height: `${30 + ((i * 37) % 70)}%`,
                  background: `linear-gradient(to top, ${b}, ${a})`,
                  animationDelay: `${(i % 9) * 0.08}s`,
                }}
              />
            ))}
          </div>
          <div className="pv-fade mt-3 rounded-md border border-white/10 bg-black/40 p-2 backdrop-blur">
            <span style={{ color: a }}>bp:</span> 128/84 · <span style={{ color: a }}>dx:</span> viral fever{' '}
            <span className="text-white/50">· src: voice@00:42</span>
          </div>
        </div>
      )}
    </div>
  )
}
