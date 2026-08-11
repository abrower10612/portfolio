"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Gem, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bot } from "@/components/game/bot";
import { Rocket } from "@/components/game/rocket";
import { useGameMode } from "@/components/game/game-mode-context";

/* =========================================================================
   Tuning. The numbers come from measuring the real page: the tallest gap
   between platforms is ~580px, so the jump apex has to beat it.
   ========================================================================= */

const PLAYER_W = 20;
const PLAYER_H = 20;

const GRAVITY = 820; // px/s² — low, so arcs are long and floaty
const FAST_FALL = 2500; // holding "down" in the air commits to the drop
const JUMP_V = 1010; // ≈620px apex, ~1.2s to the top
const JUMP_CUT = 320; // releasing early clips the rise
const MAX_FALL = 1600;

const MAX_RUN = 470;
const ACCEL = 2400;
const FRICTION = 2000;

const COYOTE = 0.1; // grace period to still jump after walking off
const JUMP_BUFFER = 0.12; // pressing jump just before landing still fires
const DROP_THROUGH = 0.3; // seconds the dropped-from platform stays disabled

const JEWEL = 20;
/** The page is always cut into this many bands, one jewel per band. */
const JEWEL_SPREAD = 20;
/**
 * How many of those bands actually get a jewel. Development takes only the
 * first, so the whole story (crash → collect → repair → launch) can be replayed
 * in seconds; production wants the full set.
 */
const JEWEL_TARGET = process.env.NODE_ENV === "development" ? 1 : JEWEL_SPREAD;
const PICKUP_PAD = 6; // generous pickup box
const FLOOR_INSET = 8; // keeps the boots (and their exhaust) inside the page
const LAND_SQUASH_V = 260; // impact speed that earns a squash on landing

/* ---- the rocket, and the story beats it plays out ---- */
const ROCKET_W = 36;
const ROCKET_H = 64;
const ENTRY_TIME = 0.58; // streaking in, nose down
const ENTRY_DX = 330; // horizontal ground covered on the way in
const ENTRY_ROT = 142; // nose pointing down-and-right along the descent
const IMPACT_ROT = 116; // slams onto its side
const SLIDE_ROT = 98; // settles flat as it grinds along
const SLIDE_FRICTION = 250; // px/s² — slow enough to reach the far end
const SLIDE_SETTLE = 340; // px of travel to finish rotating flat over
const INTRO_MIN = 1.9; // hand over control no earlier than this
const SMOKE_EVERY = 0.055; // seconds between trail puffs
const SMOKE_COUNT = 26; // pooled puff elements
const SMOKE_DRIFT = 150; // px a puff travels against the ship's heading
const ROCKET_FALL_G = 3000;
const ROCKET_FALL_MAX = 5200;
const CRASHED_ROT = 74; // degrees — lying against the footer
const REPAIR_TIME = 1.9; // sparks and straightening up
const BOARD_TIME = 0.4; // robot hops in
const LIFTOFF_AT = 0.75; // rumble, then go
const LAUNCH_G = 2800;

/**
 * Elements whose painted box IS the surface — chips, badges, buttons, media.
 * Everything else standable is found by walking text nodes, so no tag whitelist
 * can leave a piece of copy out.
 */
const BOX_SELECTOR = "button,a,li,span,div,img,video,canvas";
/** Replaced elements always paint their whole box. */
const REPLACED = ["IMG", "VIDEO", "CANVAS"];
/** Text that never renders as page copy. */
const NON_COPY = ["SCRIPT", "STYLE", "NOSCRIPT", "TITLE", "TEMPLATE"];
/** Tags that read as a "landmark" and so deserve a jewel. */
const JEWEL_PRIORITY = ["H1", "H2", "H3", "IMG", "BUTTON", "A"];

/**
 * A platform is one surface of one node. `node` is either an element whose box
 * is painted, or a text node; `i` is which of that node's rects this is, since
 * a run of copy has one rect per rendered line.
 */
type Platform = { node: Node; i: number; x: number; y: number; w: number; tag: string };
type Jewel = { node: Node; i: number; x: number; y: number };

/** Just wider than the player, so even a short chip or link is standable. */
const MIN_PLATFORM_W = 24;
/** Boxes at or under this height read as chips/buttons rather than containers. */
const MAX_CHIP_H = 56;

/**
 * Does this element paint a surface of its own? Images, chips, badges and
 * buttons fill or outline their whole box, so all of it is visibly standable.
 * Bare text does not — its box stretches to the container, most of which is
 * empty space.
 */
function isBoxed(el: Element, cs: CSSStyleDeclaration): boolean {
  if (REPLACED.includes(el.tagName)) return true;
  const bg = cs.backgroundColor;
  const filled = !!bg && bg !== "transparent" && !/^rgba\(0,\s*0,\s*0,\s*0\)$/.test(bg);
  const bordered = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none";
  return filled || bordered;
}

/**
 * The surfaces of one node: a painted element gives its border box, a text node
 * gives one rect per rendered line, tight to the glyphs — so nobody stands on
 * the blank end of a ragged line.
 */
function surfacesOf(node: Node): DOMRect[] {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return [(node as Element).getBoundingClientRect()];
  }
  const range = document.createRange();
  range.selectNode(node);
  return Array.from(range.getClientRects());
}

/**
 * A chip is a painted box drawn tight around a single line of content — a tag,
 * a badge, a button. Its own box is the surface, so the text inside it should
 * not add a second ledge a few px lower. Anything taller is a *container*: it
 * keeps its top edge as a ledge, but the copy inside it still counts too.
 */
function isChip(el: Element, cs: CSSStyleDeclaration): boolean {
  return isBoxed(el, cs) && el.getBoundingClientRect().height <= MAX_CHIP_H;
}

function hasChipAncestor(from: Element | null): boolean {
  for (let p = from; p; p = p.parentElement) {
    if (p.matches(BOX_SELECTOR) && isChip(p, getComputedStyle(p))) return true;
  }
  return false;
}

/** Is this element's copy actually rendered where the player could reach it? */
function isVisible(el: Element | null): el is Element {
  if (!el) return false;
  if (NON_COPY.includes(el.tagName)) return false;
  if (el.closest("[data-game-ui]") || el.closest("header")) return false;
  // Decorative layers (the hero's gradient blobs, the big logo glyph) are
  // painted boxes too, and would otherwise become huge invisible ledges.
  if (el.closest('[aria-hidden="true"]')) return false;
  const cs = getComputedStyle(el);
  if (cs.position === "fixed" || cs.position === "sticky") return false;
  if (cs.display === "none" || cs.visibility === "hidden") return false;
  if (parseFloat(cs.opacity) === 0) return false;
  return true;
}

/**
 * Snapshot every surface that can be stood on, in document coordinates. Only
 * the top edge matters for landing — platforms are one-way, so the player
 * always rises through them and only lands on top.
 */
function collectPlatforms(): Platform[] {
  const out: Platform[] = [];
  const seen = new Set<string>();

  const push = (node: Node, tag: string) => {
    surfacesOf(node).forEach((r, i) => {
      if (r.width < MIN_PLATFORM_W || r.height < 8) return;

      // Two nodes can describe the same ledge; keep it once.
      const key = `${Math.round(r.left)}:${Math.round(r.top)}:${Math.round(r.width)}`;
      if (seen.has(key)) return;
      seen.add(key);

      out.push({
        node,
        i,
        tag,
        x: r.left + window.scrollX,
        y: r.top + window.scrollY,
        w: r.width,
      });
    });
  };

  // Painted boxes first, so they win the de-dupe over the text inside them.
  for (const el of document.querySelectorAll(BOX_SELECTOR)) {
    if (!isVisible(el)) continue;
    if (!isBoxed(el, getComputedStyle(el))) continue;
    if (hasChipAncestor(el.parentElement)) continue;
    push(el, el.tagName);
  }

  // Then every run of visible copy, whatever tag it happens to live in —
  // blockquote, h4, a bare div, anything.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      (n.nodeValue || "").trim().length >= 2
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const parent = n.parentElement;
    if (!isVisible(parent)) continue;
    if (hasChipAncestor(parent)) continue;
    push(n, parent.tagName);
  }

  return out.sort((a, b) => a.y - b.y);
}

/** Re-measure known platforms in place, so a resize keeps jewel identity. */
function remeasure(platforms: Platform[]): Platform[] {
  const cache = new Map<Node, DOMRect[]>();
  const out: Platform[] = [];

  for (const p of platforms) {
    if (!p.node.isConnected) continue;
    let rects = cache.get(p.node);
    if (!rects) {
      rects = surfacesOf(p.node);
      cache.set(p.node, rects);
    }
    const r = rects[p.i];
    if (!r || r.width < MIN_PLATFORM_W) continue;
    out.push({ ...p, x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width });
  }

  return out.sort((a, b) => a.y - b.y);
}

/** Headings, buttons and images beat body copy; wider surfaces beat narrow. */
function jewelScore(p: Platform): number {
  return (JEWEL_PRIORITY.includes(p.tag) ? 1000 : 0) + Math.min(p.w, 400);
}

/**
 * Place exactly JEWEL_TARGET jewels, spread down the page. The page is cut into
 * JEWEL_SPREAD equal bands and the most interesting surface in the first
 * JEWEL_TARGET of them gets a jewel; empty bands (the page has a few 500px+
 * gaps) are made up by picking whichever remaining surface sits furthest from
 * every jewel so far.
 */
function buildJewels(platforms: Platform[], docHeight: number): Jewel[] {
  if (!platforms.length) return [];

  const chosen: Platform[] = [];
  const used = new Set<Platform>();
  const band = docHeight / JEWEL_SPREAD;

  for (let b = 0; b < JEWEL_TARGET; b++) {
    const lo = b * band;
    const hi = lo + band;
    let best: Platform | null = null;
    for (const p of platforms) {
      if (used.has(p) || p.y < lo || p.y >= hi) continue;
      if (!best || jewelScore(p) > jewelScore(best)) best = p;
    }
    if (best) {
      chosen.push(best);
      used.add(best);
    }
  }

  // Top up for any empty band, keeping the spacing as wide as possible.
  while (chosen.length < JEWEL_TARGET && chosen.length < platforms.length) {
    let best: Platform | null = null;
    let bestGap = -1;
    for (const p of platforms) {
      if (used.has(p)) continue;
      let gap = Infinity;
      for (const c of chosen) gap = Math.min(gap, Math.abs(c.y - p.y));
      if (gap > bestGap || (gap === bestGap && best && jewelScore(p) > jewelScore(best))) {
        bestGap = gap;
        best = p;
      }
    }
    if (!best) break;
    chosen.push(best);
    used.add(best);
  }

  return chosen.sort((a, b) => a.y - b.y).map(jewelOn);
}

function jewelOn(p: Platform): Jewel {
  return { node: p.node, i: p.i, x: p.x + p.w / 2 - JEWEL / 2, y: p.y - JEWEL - 8 };
}

/** Follow a jewel to wherever its surface moved, so a resize keeps its state. */
function repositionJewels(jewels: Jewel[], platforms: Platform[]): Jewel[] {
  return jewels.map((j) => {
    const p = platforms.find((q) => q.node === j.node && q.i === j.i);
    return p ? jewelOn(p) : j;
  });
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Mounts the simulation only while game mode is on, so it costs nothing off. */
export function GameMode() {
  const { active, exit } = useGameMode();
  if (!active) return null;
  return <GameRunner onExit={exit} />;
}

/**
 * Status banners sit top-left, under the fixed header and opposite the score
 * chips — the rocket is parked at the bottom centre, so anything along the
 * bottom edge would cover it exactly when you are trying to reach it.
 */
const BANNER =
  "pointer-events-none fixed top-20 left-4 z-60 max-w-xs rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur sm:left-6 lg:left-8";

type Level = { platforms: Platform[]; jewels: Jewel[]; docHeight: number };

/**
 * intro  — the ship crash-lands, the robot bails out, the ship falls away
 * play   — collect the jewels
 * repair — all jewels in hand and back at the ship: patch it up
 * launch — climb in and go
 * won    — the overlay
 */
type Phase = "intro" | "play" | "repair" | "launch" | "won";
type RocketMode = "fly" | "slide" | "fall" | "parked" | "repair" | "launch";

type RocketState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  mode: RocketMode;
};
type StoryState = {
  t: number;
  poppedOut: boolean;
  parkX: number;
  floorY: number;
  slideFrom: number;
  smokeT: number;
  smokeAt: number;
  lastX: number;
  lastY: number;
  boardX: number;
};

/**
 * The ship is positioned by the bottom-centre of its box, which is also its
 * rotation pivot — so once it is tipped onto its side, its hull swings below
 * that point. This returns how far below the pivot its lowest corner ends up at
 * a given rotation, so it can be made to rest *on* a surface rather than sink
 * into it. Silhouette corners are the hull box plus the fin tips.
 */
const ROCKET_CORNERS: [number, number][] = [
  [-9.5, -(ROCKET_H - 1.5)], // nose, left
  [9.5, -(ROCKET_H - 1.5)], // nose, right
  [-9.5, -(ROCKET_H - 51.5)], // tail, left
  [9.5, -(ROCKET_H - 51.5)], // tail, right
  [-17, -(ROCKET_H - 53)], // fin tips
  [17, -(ROCKET_H - 53)],
];

/**
 * Where a point on the ship's artwork actually is on the page, given that the
 * ship is rotated about the bottom-centre of its box. Used to emit smoke from
 * the engine bell and sparks from the nose wherever they happen to be pointing.
 */
function rocketPoint(r: RocketState, lx: number, ly: number): [number, number] {
  const th = (r.rot * Math.PI) / 180;
  const sin = Math.sin(th);
  const cos = Math.cos(th);
  const dx = lx - ROCKET_W / 2;
  const dy = ly - ROCKET_H;
  return [r.x + ROCKET_W / 2 + dx * cos - dy * sin, r.y + dx * sin + dy * cos];
}

function rocketDrop(rot: number): number {
  const th = (rot * Math.PI) / 180;
  const sin = Math.sin(th);
  const cos = Math.cos(th);
  let low = -Infinity;
  for (const [dx, dy] of ROCKET_CORNERS) low = Math.max(low, dx * sin + dy * cos);
  return low;
}

/** Puts the ship back at the top of its entrance, ready to crash in again. */
function resetStory(
  r: RocketState,
  st: StoryState,
  startX: number,
  docWidth: number,
  floorY: number
) {
  r.x = Math.max(4, startX - ENTRY_DX);
  r.y = 2;
  r.vx = ENTRY_DX / ENTRY_TIME;
  r.vy = 0;
  r.rot = ENTRY_ROT;
  r.mode = "fly";
  st.t = 0;
  st.poppedOut = false;
  st.slideFrom = 0;
  st.smokeT = 0;
  st.lastX = r.x;
  st.lastY = r.y;
  // Parked dead centre at the bottom, so it is easy to find on the way back.
  st.parkX = Math.max(8, (docWidth - ROCKET_W) / 2);
  st.floorY = floorY;
}

function GameRunner({ onExit }: { onExit: () => void }) {
  // The level is measured once, lazily, on the first render of the running
  // game. This only ever renders after a click, so layout is settled.
  const [level, setLevel] = React.useState<Level>(() => {
    const platforms = collectPlatforms();
    return {
      platforms,
      jewels: buildJewels(platforms, document.documentElement.scrollHeight),
      docHeight: document.documentElement.scrollHeight,
    };
  });
  const isTouch = React.useMemo(
    () => window.matchMedia("(pointer: coarse)").matches,
    []
  );

  const [collected, setCollected] = React.useState<Set<number>>(new Set());
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [showHelp, setShowHelp] = React.useState(true);
  const [elapsed, setElapsed] = React.useState(0);

  const playerRef = React.useRef<HTMLDivElement>(null);
  const rocketRef = React.useRef<HTMLDivElement>(null);
  const touchRef = React.useRef<HTMLDivElement>(null);
  const platformsRef = React.useRef<Platform[]>(level.platforms);
  const docHeightRef = React.useRef(level.docHeight);
  const jewelsRef = React.useRef<Jewel[]>(level.jewels);
  const collectedRef = React.useRef<Set<number>>(new Set());
  const startedAtRef = React.useRef(0);

  // The phase lives in a ref as well, because the simulation reads it every
  // frame and must not wait for a re-render.
  const phaseRef = React.useRef<Phase>("intro");
  const goPhase = React.useCallback((next: Phase) => {
    phaseRef.current = next;
    story.current.t = 0;
    setPhase(next);
  }, []);

  const { jewels, docHeight } = level;

  // Input is a plain state bag so any source — keys, or the touch pad below —
  // can drive the same simulation.
  const input = React.useRef({ axis: 0, jumpHeld: false, jumpBuffer: 0, down: false });

  // Last-written sprite attributes, so we only touch the DOM when they change.
  const visual = React.useRef({ face: "right", state: "idle", hidden: false, rocket: "" });

  // The ship. `y` is its base, like the player's feet.
  const rocket = React.useRef<RocketState>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rot: ENTRY_ROT,
    mode: "fly",
  });
  const story = React.useRef<StoryState>({
    t: 0,
    poppedOut: false,
    parkX: 0,
    floorY: 0,
    slideFrom: 0,
    smokeT: 0,
    smokeAt: 0,
    lastX: 0,
    lastY: 0,
    boardX: 0,
  });
  const smokeRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // `y` is the player's FEET, so landing is just "did the feet cross a ledge".
  const sim = React.useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    grounded: false,
    coyote: 0,
    standing: -1,
    dropIgnore: -1,
    dropTimer: 0,
    squash: 0,
  });

  // Keep the simulation's copies in step with the measured level.
  React.useEffect(() => {
    platformsRef.current = level.platforms;
    jewelsRef.current = level.jewels;
    docHeightRef.current = level.docHeight;
  }, [level]);

  /* ---------------- session setup ---------------- */
  React.useEffect(() => {
    // Spawn on the topmost platform — the hero's availability badge.
    const start = platformsRef.current[0];
    if (start) {
      sim.current.x = start.x + 10;
      sim.current.y = start.y;
    }

    resetStory(
      rocket.current,
      story.current,
      start ? start.x : 0,
      document.documentElement.clientWidth,
      docHeightRef.current - FLOOR_INSET
    );
    startedAtRef.current = performance.now();
    window.scrollTo({ top: 0, behavior: "instant" });

    // Per-frame scrolling fights the site's smooth-scroll, and dragging across
    // the page would otherwise select every paragraph on the way down.
    // `data-game-active` is set by the provider on click, before this mounts, so
    // the level is measured with reveals already forced visible. Re-assert it
    // rather than clean it up: it belongs to the provider, and deleting it here
    // would strand the level 24px off its content the moment this effect
    // re-runs (which Strict Mode does on every mount in development).
    const root = document.documentElement;
    const prevScroll = root.style.scrollBehavior;
    const prevSelect = document.body.style.userSelect;
    root.style.scrollBehavior = "auto";
    root.dataset.gameActive = "true";
    document.body.style.userSelect = "none";

    return () => {
      root.style.scrollBehavior = prevScroll;
      document.body.style.userSelect = prevSelect;
    };
  }, []);

  /* ---------------- keyboard ---------------- */
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onExit();
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          input.current.axis = -1;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          input.current.axis = 1;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          input.current.down = true;
          break;
        case " ":
        case "ArrowUp":
        case "w":
        case "W":
          input.current.jumpHeld = true;
          input.current.jumpBuffer = JUMP_BUFFER;
          break;
        default:
          return;
      }
      e.preventDefault();
      setShowHelp(false);
    };

    const up = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          if (input.current.axis < 0) input.current.axis = 0;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (input.current.axis > 0) input.current.axis = 0;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          input.current.down = false;
          break;
        case " ":
        case "ArrowUp":
        case "w":
        case "W":
          input.current.jumpHeld = false;
          break;
      }
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onExit]);

  /* ---------------- touch ----------------
     One finger does everything: horizontal displacement from where the finger
     landed acts as a stick, an upward flick jumps, a downward drag fast-falls,
     and a quick tap hops. The origin re-bases on long drags so you
     never run out of screen. */
  React.useEffect(() => {
    const pad = touchRef.current;
    if (!pad) return;

    const g = { id: -1, ox: 0, oy: 0, t: 0, moved: 0, jumped: false };
    let tapTimer = 0;

    const onDown = (e: PointerEvent) => {
      pad.setPointerCapture(e.pointerId);
      g.id = e.pointerId;
      g.ox = e.clientX;
      g.oy = e.clientY;
      g.t = performance.now();
      g.moved = 0;
      g.jumped = false;
      setShowHelp(false);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== g.id) return;

      let dx = e.clientX - g.ox;
      const dy = e.clientY - g.oy;
      g.moved = Math.max(g.moved, Math.hypot(dx, dy));

      if (Math.abs(dx) > REBASE) {
        g.ox = e.clientX - Math.sign(dx) * REBASE;
        dx = Math.sign(dx) * REBASE;
      }

      const mag = Math.abs(dx);
      input.current.axis =
        mag < DEADZONE
          ? 0
          : Math.sign(dx) * Math.min(1, (mag - DEADZONE) / (FULL_TILT - DEADZONE));

      // Flick up to jump; letting the finger fall back re-arms it.
      if (dy < -FLICK_UP && !g.jumped) {
        input.current.jumpHeld = true;
        input.current.jumpBuffer = JUMP_BUFFER;
        g.jumped = true;
      } else if (dy > -10 && g.jumped) {
        input.current.jumpHeld = false;
        g.jumped = false;
      }

      input.current.down = dy > DRAG_DOWN;
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== g.id) return;

      // A quick stab with no real movement is a hop.
      if (performance.now() - g.t < TAP_MS && g.moved < TAP_SLOP) {
        input.current.jumpBuffer = JUMP_BUFFER;
        input.current.jumpHeld = true;
        tapTimer = window.setTimeout(() => {
          input.current.jumpHeld = false;
        }, 140);
      } else {
        input.current.jumpHeld = false;
      }

      input.current.axis = 0;
      input.current.down = false;
      g.id = -1;
    };

    pad.addEventListener("pointerdown", onDown);
    pad.addEventListener("pointermove", onMove);
    pad.addEventListener("pointerup", onUp);
    pad.addEventListener("pointercancel", onUp);
    return () => {
      window.clearTimeout(tapTimer);
      pad.removeEventListener("pointerdown", onDown);
      pad.removeEventListener("pointermove", onMove);
      pad.removeEventListener("pointerup", onUp);
      pad.removeEventListener("pointercancel", onUp);
    };
  }, [isTouch, phase]);

  /* ---------------- resize ---------------- */
  React.useEffect(() => {
    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const platforms = remeasure(platformsRef.current);
        setLevel({
          platforms,
          // Jewels follow their surface, so collected ones stay collected.
          jewels: repositionJewels(jewelsRef.current, platforms),
          docHeight: document.documentElement.scrollHeight,
        });
      }, 200);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* ---------------- timer ---------------- */
  React.useEffect(() => {
    if (phase !== "play") return;
    const id = window.setInterval(
      () => setElapsed((performance.now() - startedAtRef.current) / 1000),
      250
    );
    return () => window.clearInterval(id);
  }, [phase]);

  /* ---------------- simulation ---------------- */
  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const STEP = 1 / 120;

    const step = (dt: number) => {
      const s = sim.current;
      const inp = input.current;
      const plats = platformsRef.current;
      const frozen = phaseRef.current !== "play";

      // ---- horizontal ----
      const target = frozen ? 0 : inp.axis * MAX_RUN;
      if (target !== 0) {
        s.vx += Math.sign(target - s.vx) * ACCEL * dt;
        if (Math.abs(s.vx) > Math.abs(target)) s.vx = target;
      } else if (s.vx !== 0) {
        const drop = FRICTION * dt;
        s.vx = Math.abs(s.vx) <= drop ? 0 : s.vx - Math.sign(s.vx) * drop;
      }

      // ---- jump / drop-through ----
      if (!frozen) {
        inp.jumpBuffer = Math.max(0, inp.jumpBuffer - dt);
        if (inp.jumpBuffer > 0 && (s.grounded || s.coyote > 0)) {
          if (inp.down && s.grounded && s.standing >= 0) {
            // Down + jump falls through the platform you're standing on.
            s.dropIgnore = s.standing;
            s.dropTimer = DROP_THROUGH;
            s.grounded = false;
            s.standing = -1;
            s.y += 1;
          } else {
            s.vy = -JUMP_V;
            s.grounded = false;
            s.coyote = 0;
            s.standing = -1;
          }
          inp.jumpBuffer = 0;
        }
        if (!inp.jumpHeld && s.vy < -JUMP_CUT) s.vy = -JUMP_CUT;
      }

      // ---- gravity ----
      const g = !s.grounded && inp.down && !frozen ? FAST_FALL : GRAVITY;
      s.vy = Math.min(MAX_FALL, s.vy + g * dt);
      s.coyote = s.grounded ? COYOTE : Math.max(0, s.coyote - dt);
      s.dropTimer = Math.max(0, s.dropTimer - dt);
      if (s.dropTimer === 0) s.dropIgnore = -1;

      // ---- vertical move + one-way landing (feet cross a top edge) ----
      const prevFeet = s.y;
      s.y += s.vy * dt;
      const nextFeet = s.y;

      if (s.vy >= 0) {
        let landed = -1;
        let landY = Infinity;
        for (let i = 0; i < plats.length; i++) {
          if (i === s.dropIgnore) continue;
          const p = plats[i];
          if (prevFeet <= p.y + 1 && nextFeet >= p.y) {
            if (s.x + PLAYER_W > p.x + 2 && s.x < p.x + p.w - 2 && p.y < landY) {
              landY = p.y;
              landed = i;
            }
          }
        }
        if (landed >= 0) {
          if (!s.grounded) s.squash = 1;
          s.y = landY;
          s.vy = 0;
          s.grounded = true;
          s.standing = landed;
        } else {
          s.grounded = false;
        }
      } else {
        s.grounded = false;
      }

      // ---- horizontal move. No side collisions, so you can never wedge. ----
      s.x = clamp(s.x + s.vx * dt, 0, document.documentElement.clientWidth - PLAYER_W);

      // The bottom of the footer is solid ground, not a pit — otherwise falling
      // down a gutter strands the player somewhere they can't jump out of.
      const floor = docHeightRef.current - FLOOR_INSET;
      if (s.y >= floor) {
        // Only a real impact squashes. Resting here still accrues a frame of
        // gravity and gets re-caught every tick, which would otherwise pin the
        // squash at 1 and leave the robot permanently flattened.
        if (!s.grounded && s.vy > LAND_SQUASH_V) s.squash = 1;
        s.y = floor;
        s.vy = 0;
        s.grounded = true;
        s.standing = -1; // nothing to drop through down here
      }
      // Bonk on the very top of the page instead of sticking to it.
      if (s.y < PLAYER_H) {
        s.y = PLAYER_H;
        if (s.vy < 0) s.vy = 0;
      }
      s.squash = Math.max(0, s.squash - dt * 6);
    };

    /**
     * The scripted beats. Runs on real frame time (not the fixed physics step)
     * and only ever moves the ship — the robot stays under the simulation, so it
     * lands on the badge and falls to the footer using the same physics as play.
     */
    const tellStory = (dt: number) => {
      const s = sim.current;
      const r = rocket.current;
      const st = story.current;
      const t = st.t;

      // A puff of smoke, placed in page space so it hangs where it was made
      // rather than riding along with the ship.
      const puff = (x: number, y: number, size: number, dx: number, dy: number) => {
        const el = smokeRefs.current[st.smokeAt % SMOKE_COUNT];
        st.smokeAt++;
        if (!el) return;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        // `transform` places it; the animation drifts it with the individual
        // `translate` property so the two never fight.
        el.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
        el.animate(
          [
            { opacity: 0.55, scale: "0.4", translate: "0px 0px" },
            { opacity: 0, scale: "1.5", translate: `${dx}px ${dy}px` },
          ],
          { duration: 1100, easing: "ease-out", fill: "forwards" }
        );
      };

      // Trailing smoke. Each puff is thrown *against* the ship's current
      // heading, so it streams away from the source however the ship is moving:
      // left while it slides right, upward while it falls.
      const travelX = dt > 0 ? (r.x - st.lastX) / dt : 0;
      const travelY = dt > 0 ? (r.y - st.lastY) / dt : 0;
      st.lastX = r.x;
      st.lastY = r.y;

      if (r.mode === "fly" || r.mode === "fall" || r.mode === "slide") {
        st.smokeT += dt;
        if (st.smokeT >= SMOKE_EVERY) {
          st.smokeT = 0;
          // Out of the engine bell, wherever the ship happens to be pointing.
          const [ex, ey] = rocketPoint(r, ROCKET_W / 2, 56);
          const speed = Math.hypot(travelX, travelY) || 1;
          const spread = ((st.smokeAt * 53) % 19) - 9;
          const jitter = ((st.smokeAt * 37) % 11) - 5;
          puff(
            ex + jitter,
            ey + jitter,
            13 + (st.smokeAt % 3) * 4,
            (-travelX / speed) * SMOKE_DRIFT + spread,
            (-travelY / speed) * SMOKE_DRIFT * 0.6 - 20 + spread * 0.5
          );
        }
      }

      // The ship's fall is independent of phase so it can finish during play.
      if (r.mode === "fall") {
        r.vy = Math.min(ROCKET_FALL_MAX, r.vy + ROCKET_FALL_G * dt);
        r.y += r.vy * dt;
        r.rot += 120 * dt;
        // Carries its momentum off the ledge, then drifts to the parking spot.
        r.x += r.vx * dt;
        r.vx *= Math.max(0, 1 - dt * 1.9);
        r.x += (st.parkX - r.x) * Math.min(1, dt * 1.1);
        if (r.y >= st.floorY - rocketDrop(CRASHED_ROT)) {
          r.rot = CRASHED_ROT;
          r.y = st.floorY - rocketDrop(CRASHED_ROT);
          r.vy = 0;
          r.vx = 0;
          r.x = st.parkX;
          r.mode = "parked";
          for (let i = 0; i < 5; i++) {
            puff(r.x + 2 + i * 9, st.floorY - 10 - (i % 2) * 8, 22, -70 + i * 26, -52 - (i % 2) * 12);
          }
        }
      }

      switch (phaseRef.current) {
        case "intro": {
          const start = platformsRef.current[0];
          const badgeY = start ? start.y : 200;
          const badgeX = start ? start.x : 0;

          const badgeW = start ? start.w : 300;
          // Comes down nose-first from the upper left at a constant clip, hits
          // the badge, and keeps that speed into the slide — no stall at the
          // moment of contact.
          const runOff = badgeX + Math.max(90, badgeW - ROCKET_W * 0.7);

          if (r.mode === "fly") {
            const k = Math.min(1, t / ENTRY_TIME);
            r.x += r.vx * dt;
            r.rot = ENTRY_ROT - (ENTRY_ROT - IMPACT_ROT) * k;
            // Falls faster and faster on the way in.
            const touchdown = badgeY - rocketDrop(IMPACT_ROT);
            r.y = 2 + (touchdown - 2) * k * k;

            if (k >= 1) {
              // Contact. Sparks, a burst of smoke, and the robot bails out
              // immediately while the ship keeps grinding along.
              r.y = touchdown;
              r.rot = IMPACT_ROT;
              r.mode = "slide";
              st.slideFrom = r.x;
              st.poppedOut = true;
              s.x = r.x;
              s.y = badgeY - 4;
              s.vy = -455;
              s.vx = 80;
              s.grounded = false;
              s.squash = 0;
              const [nx, ny] = rocketPoint(r, ROCKET_W / 2, 6);
              for (let i = 0; i < 6; i++) {
                puff(nx - 10 + i * 6, ny - (i % 3) * 8, 17 + (i % 2) * 6, -80 - i * 14, -44 - i * 6);
              }
            }
          } else if (r.mode === "slide") {
            // Momentum from the crash, bleeding off against the badge.
            r.x += r.vx * dt;
            r.vx = Math.max(0, r.vx - SLIDE_FRICTION * dt);
            const settled = Math.min(1, (r.x - st.slideFrom) / SLIDE_SETTLE);
            r.rot = IMPACT_ROT + (SLIDE_ROT - IMPACT_ROT) * settled;
            r.y = badgeY - rocketDrop(r.rot);

            // Over the end of the badge (or out of steam): down it goes.
            if (r.x >= runOff || r.vx <= 6) {
              r.mode = "fall";
              r.vy = 70;
            }
          }

          if (t > INTRO_MIN && s.grounded) goPhase("play");
          break;
        }

        case "repair": {
          // Straighten the ship up while the sparks fly.
          const k = Math.min(1, t / (REPAIR_TIME * 0.75));
          r.rot = CRASHED_ROT * (1 - k * k);
          // Stays planted on the footer as it straightens up.
          r.y = st.floorY - rocketDrop(r.rot);
          r.mode = "repair";
          if (t > REPAIR_TIME) {
            r.rot = 0;
            r.mode = "launch";
            goPhase("launch");
          }
          break;
        }

        case "launch": {
          if (t < BOARD_TIME) {
            // A little hop across to the hatch.
            const k = t / BOARD_TIME;
            const hatch = r.x + (ROCKET_W - PLAYER_W) / 2;
            s.x = st.boardX + (hatch - st.boardX) * k;
            s.y = st.floorY - Math.sin(k * Math.PI) * 28;
            s.vx = 0;
            s.vy = 0;
          }
          if (t > LIFTOFF_AT) {
            r.vy -= LAUNCH_G * dt;
            r.y += r.vy * dt;
            // The robot is aboard and hidden, and deliberately left standing at
            // the footer — so the camera holds still and the ship flies out of
            // frame, rather than the view chasing it back up the whole page.
            if (r.y < window.scrollY - ROCKET_H * 3) goPhase("won");
          }
          break;
        }
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      acc += dt;
      last = now;
      while (acc >= STEP) {
        step(STEP);
        acc -= STEP;
      }

      story.current.t += dt;
      tellStory(dt);

      const s = sim.current;
      const top = s.y - PLAYER_H;

      // ---- camera: the page itself scrolls to keep the player in a band ----
      const vh = window.innerHeight;
      const screenY = top - window.scrollY;
      const bandTop = vh * 0.32;
      const bandBottom = vh * 0.58;
      let want = window.scrollY;
      if (screenY < bandTop) want = top - bandTop;
      else if (screenY > bandBottom) want = top - bandBottom;
      want = clamp(want, 0, docHeightRef.current - vh);
      if (Math.abs(want - window.scrollY) > 0.5) window.scrollTo(0, want);

      // ---- pickups ----
      if (phaseRef.current === "play") {
        const picked: number[] = [];
        const js = jewelsRef.current;
        for (let i = 0; i < js.length; i++) {
          if (collectedRef.current.has(i)) continue;
          const j = js[i];
          if (
            s.x + PLAYER_W > j.x - PICKUP_PAD &&
            s.x < j.x + JEWEL + PICKUP_PAD &&
            s.y > j.y - PICKUP_PAD &&
            top < j.y + JEWEL + PICKUP_PAD
          ) {
            picked.push(i);
          }
        }
        if (picked.length) {
          picked.forEach((i) => collectedRef.current.add(i));
          setCollected(new Set(collectedRef.current));
        }

        // Every jewel in hand and standing at the ship: start the repair.
        const r = rocket.current;
        const done = js.length > 0 && collectedRef.current.size === js.length;
        if (done && r.mode === "parked") {
          const reach = 16;
          if (
            s.x + PLAYER_W > r.x - reach &&
            s.x < r.x + ROCKET_W + reach &&
            s.y > r.y - ROCKET_H &&
            top < r.y + reach
          ) {
            setElapsed((performance.now() - startedAtRef.current) / 1000);
            s.vx = 0;
            s.x = r.x - PLAYER_W - 4;
            story.current.boardX = s.x;
            r.mode = "repair";
            goPhase("repair");
          }
        }
      }

      // Squash-stretch rides on scaleY from the feet, so landing never needs a
      // layout change.
      const el = playerRef.current;
      if (el) {
        const sx = 1 + s.squash * 0.28;
        const sy = 1 - s.squash * 0.32;
        el.style.transform =
          `translate3d(${s.x.toFixed(1)}px, ${(s.y - PLAYER_H).toFixed(1)}px, 0)` +
          ` scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;

        // The robot's limbs, lean, blink and rocket boots are CSS animations
        // keyed off these two attributes. Written only on change, so the
        // running/idle cycles aren't restarted every frame.
        const v = visual.current;
        const face = s.vx > 25 ? "right" : s.vx < -25 ? "left" : v.face;
        const state = !s.grounded ? "air" : Math.abs(s.vx) > 30 ? "run" : "idle";
        if (face !== v.face) {
          v.face = face;
          el.dataset.face = face;
        }
        if (state !== v.state) {
          v.state = state;
          el.dataset.state = state;
        }

        // Hidden before it bails out of the ship, and again once it climbs in.
        const ph = phaseRef.current;
        const hidden =
          (ph === "intro" && !story.current.poppedOut) ||
          (ph === "launch" && story.current.t > BOARD_TIME) ||
          ph === "won";
        if (hidden !== v.hidden) {
          v.hidden = hidden;
          if (hidden) el.dataset.hidden = "true";
          else delete el.dataset.hidden;
        }
      }

      const rk = rocketRef.current;
      if (rk) {
        const r = rocket.current;
        rk.style.transform =
          `translate3d(${r.x.toFixed(1)}px, ${(r.y - ROCKET_H).toFixed(1)}px, 0)` +
          ` rotate(${r.rot.toFixed(1)}deg)`;
        if (r.mode !== visual.current.rocket) {
          visual.current.rocket = r.mode;
          rk.dataset.rocket = r.mode;
        }
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [goPhase]);

  const restart = () => {
    collectedRef.current = new Set();
    setCollected(new Set());
    const platforms = remeasure(platformsRef.current);
    setLevel({
      platforms,
      jewels: repositionJewels(jewelsRef.current, platforms),
      docHeight: document.documentElement.scrollHeight,
    });
    const start = platforms[0];
    Object.assign(sim.current, {
      x: start ? start.x + 10 : 0,
      y: start ? start.y : 0,
      vx: 0,
      vy: 0,
        grounded: false,
      coyote: 0,
      standing: -1,
      dropIgnore: -1,
      dropTimer: 0,
      squash: 0,
    });
    // Replay the crash landing from the top.
    resetStory(
      rocket.current,
      story.current,
      start ? start.x : 0,
      document.documentElement.clientWidth,
      docHeightRef.current - FLOOR_INSET
    );
    goPhase("intro");
    startedAtRef.current = performance.now();
    setElapsed(0);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const total = jewels.length;
  const score = collected.size;

  return createPortal(
    <div data-game-ui>
      {/* Sprites live in document coordinates, so page scroll moves them for free. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-40 overflow-hidden"
        style={{ height: docHeight }}
        aria-hidden
      >
        {jewels.map((j, i) => (
          <div
            key={i}
            className="game-jewel absolute top-0 left-0"
            data-collected={collected.has(i) ? "true" : undefined}
            style={{
              transform: `translate3d(${j.x}px, ${j.y}px, 0)`,
              width: JEWEL,
              height: JEWEL,
              animationDelay: `${(i % 5) * 0.16}s`,
            }}
          />
        ))}

        {Array.from({ length: SMOKE_COUNT }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              smokeRefs.current[i] = el;
            }}
            className="game-smoke absolute top-0 left-0"
          />
        ))}

        <div
          ref={rocketRef}
          className="game-rocket-holder absolute top-0 left-0"
          style={{ width: ROCKET_W, height: ROCKET_H }}
          data-rocket="fly"
        >
          <Rocket />
        </div>

        <div
          ref={playerRef}
          className="game-player absolute top-0 left-0"
          style={{ width: PLAYER_W, height: PLAYER_H }}
          data-state="idle"
          data-face="right"
          data-hidden="true"
        >
          <Bot />
        </div>
      </div>

      {/* Touch input surface — listeners are attached in an effect above. */}
      {isTouch && phase === "play" && (
        <div ref={touchRef} className="fixed inset-0 z-50 touch-none" />
      )}

      {/* HUD */}
      <div className="fixed top-20 right-4 z-60 flex items-center gap-2 sm:right-6 lg:right-8">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 font-heading text-sm font-semibold tabular-nums backdrop-blur">
          <Gem className="size-4 text-brand" />
          {score}
          <span className="text-muted-foreground">/ {total}</span>
        </div>
        <div className="rounded-full border border-border bg-card/90 px-3 py-1.5 font-heading text-sm tabular-nums text-muted-foreground backdrop-blur">
          {elapsed.toFixed(1)}s
        </div>
      </div>

      {showHelp && phase === "play" && score < total && (
        <div className="pointer-events-none fixed inset-x-4 bottom-6 z-60 mx-auto max-w-md rounded-xl border border-border bg-card/95 p-4 text-center shadow-lg backdrop-blur">
          <p className="font-heading text-sm font-semibold">
            {total === 1
              ? "Collect the jewel, then get back to the rocket"
              : `Collect all ${total} jewels on your way down`}
          </p>
          <p className="mt-1.5 text-sm text-pretty text-muted-foreground">
            {isTouch ? (
              <>
                Drag sideways to move, flick up to jump, drag down to fall
                faster. Gravity is low, so you can jump back up.
              </>
            ) : (
              <>
                <kbd>←</kbd> <kbd>→</kbd> move · <kbd>Space</kbd> jump · <kbd>↓</kbd> fall
                faster · <kbd>↓</kbd>+<kbd>Space</kbd> drop through · <kbd>Esc</kbd> exits.
                Gravity is low, so you can jump back up.
              </>
            )}
          </p>
        </div>
      )}

      {phase === "intro" && (
        <div className={BANNER}>
          <p className="font-heading text-sm font-semibold">Incoming…</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            A little robot just crash-landed on this page.
          </p>
        </div>
      )}

      {phase === "play" && total > 0 && score === total && (
        <div className={cn(BANNER, "border-brand/40")}>
          <p className="font-heading text-sm font-semibold text-brand">
            {total === 1 ? "Jewel collected" : `All ${total} jewels collected`}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Now get back down to your rocket at the bottom of the page.
          </p>
        </div>
      )}

      {(phase === "repair" || phase === "launch") && (
        <div className={BANNER}>
          <p className="font-heading text-sm font-semibold">
            {phase === "repair" ? "Patching her up…" : "Off he goes"}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {phase === "repair"
              ? "Every jewel accounted for."
              : "Thanks for the jewels."}
          </p>
        </div>
      )}

      {phase === "won" && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="game-win w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-xl">
            <Trophy className="mx-auto size-8 text-brand" />
            <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight">
              He made it home
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {total === 1 ? "Jewel" : `All ${total} jewels`} collected and the
              rocket fixed in {elapsed.toFixed(1)} seconds.
            </p>
            <div className="mt-5 flex justify-center gap-2.5">
              <Button size="lg" onClick={restart}>
                Play again
              </Button>
              <Button size="lg" variant="outline" onClick={onExit}>
                Back to the site
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

/* Touch gesture thresholds, in CSS px. */
const DEADZONE = 14;
const FULL_TILT = 62;
const REBASE = 90;
const FLICK_UP = 34;
const DRAG_DOWN = 46;
const TAP_MS = 220;
const TAP_SLOP = 12;
