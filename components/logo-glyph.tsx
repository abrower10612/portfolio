/**
 * Vector recreation of the "A" logo mark, traced from public/logo.png so
 * it matches the real glyph exactly (angular legs, upper-left slit, inner
 * chevron negative space). Inline SVG so it can be tinted with the brand
 * gradient and animated. Used as a large, faint backdrop in the hero; the
 * solid PNG (components/logo-mark.tsx) still drives the nav/footer.
 */
export function LogoGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 637"
      fill="none"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="logo-glyph-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7e3f9e" />
          <stop offset="100%" stopColor="#f2c230" />
        </linearGradient>
      </defs>
      <path
        fill="url(#logo-glyph-fill)"
        fillRule="evenodd"
        d="M314.4 64.3 303.8 83c-20.4 35.9-27.8 49-27.8 49.5q0 .7 48.8 85.5l31.5 54.5a3164 3164 0 0 1 30.4 52.5l49.3 85c4 6.9 9.8 16.8 13 22 12.8 21.2 14.2 24 12.1 24-.7 0-26.1-18.1-40.6-29l-32-23.4-59-43c-10.2-7.6-9.5-7.3-13.2-4.3l-13.2 9.7a1680 1680 0 0 0-30.1 21.7l-84.8 61.1c-6.2 4.5-11.5 8.2-11.8 8.2-.7 0 4.1-8.8 15.4-28a5277 5277 0 0 0 33.7-58 7022 7022 0 0 0 40.7-70l13.7-23.5c19.8-33.7 28.6-48.9 28.9-49.6.2-.4-1.1-3-2.9-6l-39.4-68.7c-1.6-3-.6-4.4-18 26.3l-24.5 43-38.5 67.5A32658 32658 0 0 1 84.9 466l-34 59.7A319 319 0 0 0 37 551.4c0 1.2 3.5 4.1 24.6 19.8 6.5 4.8 5.6 5 16.5-3L99 553l30.5-21.8 26-18.7A14825.7 14825.7 0 0 0 301 407.7c9-6.6 17.2-12.2 18.1-12.4s7.4 3.7 15.5 9.6l74.9 54.3A3099 3099 0 0 0 458 494a3144 3144 0 0 0 47.2 34l49.5 36c17.4 12.6 16 12.2 22.7 7.2 9.8-7.4 20.1-14.9 22.9-16.7 3.4-2.2 3.7-1.4-6.3-18.5l-36.5-63.5A36010 36010 0 0 0 461.3 304l-51.8-90.5c-3.4-6-24.2-42.6-46.3-81.1-22-38.6-40.7-71.4-41.3-72.8-1.8-4-3-3.2-7.5 4.7"
      />
    </svg>
  );
}
