"use client";

import * as React from "react";
import { ArrowDown, Download } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoGlyph } from "@/components/logo-glyph";
import { HeroBlobs } from "@/components/hero-blobs";

export function Hero() {
  const ref = React.useRef<HTMLElement>(null);

  // Cursor parallax + spotlight. Pointer position is written to CSS vars on
  // the section (--px/--py for parallax, --mx/--my for the spotlight) and
  // consumed by the decorative layers. Skipped on touch / reduced-motion.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    let raf = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      el.style.setProperty("--px", px.toFixed(3));
      el.style.setProperty("--py", py.toFixed(3));
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      px = 0;
      py = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative isolate flex min-h-svh scroll-mt-16 items-center overflow-hidden px-4 pt-24 pb-16 sm:px-6 lg:px-8"
    >
      {/* ===== Decorative animated background ===== */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Autonomously floating gradient blobs, pushed by the cursor's "wind" */}
        <HeroBlobs />

        {/* Logo glyph — near layer (stronger parallax) + fade-in */}
        <div
          className="hero-parallax absolute inset-0 flex items-center justify-end"
          style={{
            transform:
              "translate3d(calc(var(--px, 0) * -46px), calc(var(--py, 0) * -46px), 0)",
          }}
        >
          {/* Base opacity sits on the wrapper; the glyph fades 0→1 inside it. */}
          <div className="mr-[2%] opacity-[0.07] dark:opacity-[0.12]">
            <LogoGlyph className="hero-fade-in hero-drift-alt h-[78vmin] max-h-[680px] w-auto" />
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex max-w-2xl flex-col items-start gap-6">
          <span
            className="hero-reveal rounded-full border border-border px-3 py-1 font-heading text-xs font-medium tracking-wide text-brand uppercase"
            style={{ animationDelay: "0.05s" }}
          >
            Senior Full Stack Engineer · Available for new roles
          </span>

          <h1
            className="hero-reveal font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "0.15s" }}
          >
            I build fast, modern web applications from idea to production.
          </h1>

          <p
            className="hero-reveal max-w-prose text-base text-pretty text-muted-foreground sm:text-lg"
            style={{ animationDelay: "0.28s" }}
          >
            Senior full stack software engineer specializing in React, Next.js,
            and TypeScript. I recently helped modernize the frontend at
            BambooHR, and today I ship production Next.js applications end to
            end. Before engineering, I spent years in enterprise B2B sales, so
            I understand how businesses actually use the software I build.
          </p>

          {/* Two CTAs, side by side. They stack on the narrowest screens. */}
          <div
            className="hero-reveal flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row sm:items-center"
            style={{ animationDelay: "0.4s" }}
          >
            {/* Primary CTA → contact section (with hover sheen) */}
            <a
              href="#contact"
              className={buttonVariants({
                size: "lg",
                className: "hero-cta-sheen w-full sm:w-auto",
              })}
            >
              Get in touch
            </a>
            {/* Secondary CTA → work section */}
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              nativeButton={false}
              render={<a href="#work" />}
            >
              View my work
            </Button>
            {/* Tertiary CTA → résumé download */}
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              nativeButton={false}
              render={<a href="/andrew-brower-resume.pdf" download />}
            >
              <Download />
              Résumé
            </Button>
          </div>
        </div>
      </div>

      {/* ===== Scroll cue (aligned to the shared left gutter) ===== */}
      <div className="absolute inset-x-0 bottom-6 z-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <a
            href="#about"
            className={cn(
              "hero-reveal inline-flex flex-col items-start gap-1 font-heading text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-brand"
            )}
            style={{ animationDelay: "0.6s" }}
            aria-label="Scroll to explore"
          >
            Explore
            <ArrowDown className="hero-bounce size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
