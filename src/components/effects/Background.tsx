/** Fixed ambient layers: drifting orbs, grid, noise and scanlines (all CSS, GPU-friendly). */
export function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="bg-grid absolute inset-0" />
      <div className="bg-noise absolute inset-0" />
      <div className="bg-scanlines absolute inset-0" />
    </div>
  )
}
