/**
 * The robot's ship. It comes in nose-down, grinds along the hero badge throwing
 * sparks, then tumbles to the bottom of the page and waits there to be patched
 * up and flown home.
 *
 * Like the robot, every state (engine burn, scrape sparks, repair sparks, launch
 * rumble) is CSS driven off a single `data-rocket` attribute on the wrapper.
 */
export function Rocket() {
  return (
    <svg className="game-rocket" viewBox="0 0 36 64" aria-hidden focusable="false">
      <defs>
        <linearGradient id="rk-hull" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.42" stopColor="#f2f5fb" />
          <stop offset="1" stopColor="#b9c3d6" />
        </linearGradient>
        <linearGradient id="rk-nose" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#ffd964" />
          <stop offset="1" stopColor="#d99b18" />
        </linearGradient>
        <radialGradient id="rk-glass" cx="0.36" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#8fd8ff" />
          <stop offset="0.55" stopColor="#2b6ea8" />
          <stop offset="1" stopColor="#101726" />
        </radialGradient>
      </defs>

      {/* engine burn — entry and launch only */}
      <g className="rocket-flame">
        <ellipse cx="18" cy="60" rx="5.6" ry="10" />
        <ellipse className="rocket-flame-core" cx="18" cy="58" rx="2.7" ry="6" />
      </g>

      <g className="rocket-frame">
        {/* fins */}
        <path className="rocket-fin" d="M9.5 38 L1 53 L9.5 49 Z" />
        <path className="rocket-fin" d="M26.5 38 L35 53 L26.5 49 Z" />

        {/* exhaust bell */}
        <path className="rocket-nozzle" d="M11 49 H25 L27 55 H9 Z" />

        {/* hull */}
        <path
          className="rocket-hull"
          d="M18 1.5 C25.5 11 27.5 23 27.5 33 L27.5 47 C27.5 50 23.5 51.5 18 51.5 C12.5 51.5 8.5 50 8.5 47 L8.5 33 C8.5 23 10.5 11 18 1.5 Z"
        />
        {/* nose cone */}
        <path
          className="rocket-nose"
          d="M18 1.5 C22.8 7.6 25.4 14.4 26.6 20.5 L9.4 20.5 C10.6 14.4 13.2 7.6 18 1.5 Z"
        />
        {/* porthole */}
        <circle className="rocket-window-ring" cx="18" cy="29" r="6.4" />
        <circle className="rocket-glass" cx="18" cy="29" r="5.2" />
        <circle className="rocket-glint" cx="16" cy="27" r="1.7" />

        {/* panel line + rivets */}
        <path className="rocket-stripe" d="M9.6 41.5 H26.4" />
        <g className="rocket-rivets">
          <circle cx="12" cy="45.5" r="0.85" />
          <circle cx="18" cy="45.5" r="0.85" />
          <circle cx="24" cy="45.5" r="0.85" />
        </g>
      </g>

      {/* sparks thrown from the nose, which is the corner grinding along the
          badge once the ship is over on its side */}
      <g className="rocket-scrape">
        <circle cx="26.5" cy="6" r="1.7" />
        <circle cx="29" cy="12" r="1.3" />
        <circle cx="24" cy="3" r="1.4" />
        <circle cx="30.5" cy="18" r="1.6" />
        <circle cx="28" cy="9" r="1.1" />
      </g>

      {/* sparks while being repaired */}
      <g className="rocket-sparks">
        <circle cx="7.5" cy="33" r="1.6" />
        <circle cx="28.5" cy="27" r="1.4" />
        <circle cx="9.5" cy="45" r="1.3" />
        <circle cx="27" cy="44" r="1.5" />
      </g>
    </svg>
  );
}
