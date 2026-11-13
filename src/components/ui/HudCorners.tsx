/** HUD-style corner brackets. Parent needs `relative` (and `group` to grow them on hover). */
export function HudCorners() {
  return (
    <span aria-hidden="true">
      <span className="hud-c hud-tl" />
      <span className="hud-c hud-tr" />
      <span className="hud-c hud-bl" />
      <span className="hud-c hud-br" />
    </span>
  )
}
