/**
 * The player character: a small friendly robot with a visor face, detached
 * hands and rocket boots. Drawn larger than the 20×20 hitbox and anchored to
 * its feet, so boots and antennae never affect the physics.
 *
 * Every moving part is animated in CSS off `data-state` / `data-face` on the
 * wrapping `.game-player` element (see globals.css) — the simulation writes
 * those two attributes only when they change.
 */
export function Bot() {
  return (
    <svg className="game-bot" viewBox="0 0 32 34" aria-hidden focusable="false">
      {/* rocket exhaust — lit only while airborne */}
      <g className="bot-thrust">
        <ellipse cx="11.5" cy="31.5" rx="2.4" ry="3.6" />
        <ellipse cx="20.5" cy="31.5" rx="2.4" ry="3.6" />
      </g>

      <g className="bot-lean">
        {/* antennae */}
        <g className="bot-antenna">
          <path d="M11.5 6 L9 1.8" />
          <path d="M20.5 6 L23 1.8" />
          <circle className="bot-antenna-tip" cx="9" cy="1.7" r="1.5" />
          <circle className="bot-antenna-tip" cx="23" cy="1.7" r="1.5" />
        </g>

        {/* boots */}
        <rect className="bot-foot bot-foot-l" x="7" y="24" width="7.5" height="6" rx="2.6" />
        <rect className="bot-foot bot-foot-r" x="17.5" y="24" width="7.5" height="6" rx="2.6" />

        {/* detached hands, clear of the shell on both sides */}
        <circle className="bot-hand bot-hand-l" cx="3" cy="17" r="2.7" />
        <circle className="bot-hand bot-hand-r" cx="29" cy="17" r="2.7" />

        <g className="bot-body">
          {/* shell */}
          <rect className="bot-shell" x="5.5" y="4.5" width="21" height="20.5" rx="8.5" />

          {/* visor */}
          <rect className="bot-visor" x="8.2" y="8.6" width="15.6" height="10.4" rx="5" />
          <g className="bot-eyes">
            <circle cx="12.8" cy="13.8" r="2.1" />
            <circle cx="19.2" cy="13.8" r="2.1" />
          </g>
        </g>
      </g>
    </svg>
  );
}
