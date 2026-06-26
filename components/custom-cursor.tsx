"use client";

import * as React from "react";

// Elements that should trigger the cursor's "interactive" state.
const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, summary';

/**
 * Custom cursor — a brand purple→gold gradient ring that trails the pointer
 * with easing, plus a small precise dot at the true position. The ring
 * expands (and the dot tucks away) over interactive elements, and the ring
 * dips on press.
 *
 * Only activates on fine-pointer, non-reduced-motion devices; otherwise the
 * native cursor is left untouched.
 */
export function CustomCursor() {
  const dotRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Only bail on touch / coarse pointers. Under reduced-motion we still
    // show the cursor, but the ring snaps instead of trailing (the easing
    // trail is the only motion-sensitive part).
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Hide the native cursor only while ours is active.
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let visible = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      // Dot tracks the true position exactly.
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      // Without smoothing, keep the ring pinned to the pointer too.
      if (!smooth) {
        rx = tx;
        ry = ty;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      const interactive = !!(
        e.target instanceof Element && e.target.closest(INTERACTIVE)
      );
      ring.classList.toggle("is-hover", interactive);
      dot.classList.toggle("is-hover", interactive);
    };

    // Ring eases toward the pointer for a smooth trail.
    const loop = () => {
      rx += (tx - rx) * 0.2;
      ry += (ty - ry) * 0.2;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");
    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    if (smooth) loop();

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      root.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} aria-hidden className="cursor-ring" />
      <div ref={dotRef} aria-hidden className="cursor-dot" />
    </>
  );
}
