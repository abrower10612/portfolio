"use client";

import * as React from "react";

// A small, varied set of gradient "fuzz balls". x/y are the base position
// as a fraction of the hero; ax/ay are the float amplitudes (px); sx/sy the
// float speeds (rad/s); phase offsets each blob's path.
type Blob = {
  size: string;
  x: number;
  y: number;
  bg: string;
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  phase: number;
};

const PURPLE = (a: number) =>
  `radial-gradient(circle, rgb(126 63 158 / ${a}), transparent 62%)`;
const GOLD = (a: number) =>
  `radial-gradient(circle, rgb(242 194 48 / ${a}), transparent 62%)`;
const MIX =
  "radial-gradient(circle, rgb(126 63 158 / 0.42), rgb(242 194 48 / 0.22) 45%, transparent 70%)";

// A handful of blobs — a couple large, a couple medium, a couple small.
const BLOBS: Blob[] = [
  { size: "58vmin", x: 0.18, y: 0.3, bg: PURPLE(0.45), ax: 60, ay: 46, sx: 0.13, sy: 0.1, phase: 0.0 },
  { size: "50vmin", x: 0.82, y: 0.68, bg: GOLD(0.4), ax: 56, ay: 66, sx: 0.11, sy: 0.14, phase: 1.2 },
  { size: "34vmin", x: 0.63, y: 0.18, bg: PURPLE(0.34), ax: 84, ay: 60, sx: 0.16, sy: 0.12, phase: 2.4 },
  { size: "30vmin", x: 0.32, y: 0.78, bg: GOLD(0.3), ax: 76, ay: 92, sx: 0.15, sy: 0.18, phase: 3.1 },
  { size: "22vmin", x: 0.5, y: 0.48, bg: MIX, ax: 100, ay: 86, sx: 0.2, sy: 0.16, phase: 4.0 },
  { size: "16vmin", x: 0.88, y: 0.33, bg: GOLD(0.34), ax: 96, ay: 84, sx: 0.22, sy: 0.19, phase: 5.2 },
];

const CLAMP = 220; // max wind displacement (px)

export function HeroBlobs() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const blobRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect reduced-motion: leave the blobs static.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Wind only where there's a real pointer.
    const windEnabled = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    // Per-blob wind state: offset (o) + velocity (v).
    const st = BLOBS.map(() => ({ ox: 0, oy: 0, vx: 0, vy: 0 }));
    let cx = -1e5;
    let cy = -1e5;
    let pcx = cx;
    let pcy = cy;
    let raf = 0;
    let last = 0;

    const onMove = (e: PointerEvent) => {
      cx = e.clientX;
      cy = e.clientY;
    };
    const onLeave = () => {
      cx = -1e5;
      cy = -1e5;
    };
    if (windEnabled) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    const loop = (now: number) => {
      const t = now / 1000;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;

      const rect = container.getBoundingClientRect();
      // Cursor speed → how hard the "wind" gusts this frame.
      const speed = Math.hypot(cx - pcx, cy - pcy);
      pcx = cx;
      pcy = cy;
      const gust = Math.min(speed / 16, 1.5);

      for (let i = 0; i < BLOBS.length; i++) {
        const b = BLOBS[i];
        const s = st[i];
        const el = blobRefs.current[i];
        if (!el) continue;

        // Autonomous float (Lissajous wander).
        const wx = Math.sin(t * b.sx + b.phase) * b.ax;
        const wy = Math.cos(t * b.sy + b.phase * 1.3) * b.ay;

        // Wind: push away from the cursor, scaled by proximity + gust.
        if (windEnabled && cx > -1e4) {
          const bx = rect.left + b.x * rect.width + wx;
          const by = rect.top + b.y * rect.height + wy;
          const dx = bx - cx;
          const dy = by - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const R = 340;
          if (dist < R) {
            const fall = 1 - dist / R;
            const force = fall * fall * (40 + 320 * gust);
            s.vx += (dx / dist) * force * dt;
            s.vy += (dy / dist) * force * dt;
          }
        }

        // Spring back to rest + damping, so they settle after a gust.
        s.vx += -6 * s.ox * dt;
        s.vy += -6 * s.oy * dt;
        s.vx *= 0.9;
        s.vy *= 0.9;
        s.ox = Math.max(-CLAMP, Math.min(CLAMP, s.ox + s.vx * dt));
        s.oy = Math.max(-CLAMP, Math.min(CLAMP, s.oy + s.vy * dt));

        el.style.transform = `translate(-50%, -50%) translate(${(
          wx + s.ox
        ).toFixed(2)}px, ${(wy + s.oy).toFixed(2)}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      if (windEnabled) {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
      }
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {BLOBS.map((b, i) => (
        <div
          key={i}
          ref={(el) => {
            blobRefs.current[i] = el;
          }}
          className="absolute rounded-full blur-3xl"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.x * 100}%`,
            top: `${b.y * 100}%`,
            background: b.bg,
            transform: "translate(-50%, -50%)",
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
