"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Gem, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Bot } from "@/components/game/bot";
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
const JEWEL_TARGET = 20; // exactly this many, spread down the page
const PICKUP_PAD = 6; // generous pickup box
const FLOOR_INSET = 8; // keeps the boots (and their exhaust) inside the page
const LAND_SQUASH_V = 260; // impact speed that earns a squash on landing

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
 * that many equal bands and the most interesting surface in each one gets a
 * jewel; bands with nothing in them (the page has a few 500px+ gaps) are made up
 * by picking whichever remaining surface sits furthest from every jewel so far.
 */
function buildJewels(platforms: Platform[], docHeight: number): Jewel[] {
  if (!platforms.length) return [];

  const chosen: Platform[] = [];
  const used = new Set<Platform>();
  const band = docHeight / JEWEL_TARGET;

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

type Level = { platforms: Platform[]; jewels: Jewel[]; docHeight: number };

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
  const [won, setWon] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(true);
  const [elapsed, setElapsed] = React.useState(0);

  const playerRef = React.useRef<HTMLDivElement>(null);
  const touchRef = React.useRef<HTMLDivElement>(null);
  const platformsRef = React.useRef<Platform[]>(level.platforms);
  const docHeightRef = React.useRef(level.docHeight);
  const jewelsRef = React.useRef<Jewel[]>(level.jewels);
  const collectedRef = React.useRef<Set<number>>(new Set());
  const wonRef = React.useRef(false);
  const startedAtRef = React.useRef(0);

  const { jewels, docHeight } = level;

  // Input is a plain state bag so any source — keys, or the touch pad below —
  // can drive the same simulation.
  const input = React.useRef({ axis: 0, jumpHeld: false, jumpBuffer: 0, down: false });

  // Last-written sprite attributes, so we only touch the DOM when they change.
  const visual = React.useRef({ face: "right", state: "idle" });

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
  }, [isTouch, won]);

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
    if (won) return;
    const id = window.setInterval(
      () => setElapsed((performance.now() - startedAtRef.current) / 1000),
      250
    );
    return () => window.clearInterval(id);
  }, [won]);

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
      const frozen = wonRef.current;

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

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      while (acc >= STEP) {
        step(STEP);
        acc -= STEP;
      }

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
      if (!wonRef.current) {
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
          if (collectedRef.current.size === js.length && js.length > 0) {
            wonRef.current = true;
            setWon(true);
            setElapsed((performance.now() - startedAtRef.current) / 1000);
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
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const restart = () => {
    collectedRef.current = new Set();
    setCollected(new Set());
    wonRef.current = false;
    setWon(false);
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

        <div
          ref={playerRef}
          className="game-player absolute top-0 left-0"
          style={{ width: PLAYER_W, height: PLAYER_H }}
          data-state="idle"
          data-face="right"
        >
          <Bot />
        </div>
      </div>

      {/* Touch input surface — listeners are attached in an effect above. */}
      {isTouch && !won && <div ref={touchRef} className="fixed inset-0 z-50 touch-none" />}

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

      {showHelp && !won && (
        <div className="pointer-events-none fixed inset-x-4 bottom-6 z-60 mx-auto max-w-md rounded-xl border border-border bg-card/95 p-4 text-center shadow-lg backdrop-blur">
          <p className="font-heading text-sm font-semibold">
            Collect all {total} jewels on your way down
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

      {won && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="game-win w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-xl">
            <Trophy className="mx-auto size-8 text-brand" />
            <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight">
              All {total} collected
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              You cleared the whole page in {elapsed.toFixed(1)} seconds.
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
