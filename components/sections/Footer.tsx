import { LogoMark } from "@/components/logo-mark";
import { Reveal } from "@/components/reveal";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
      <Reveal className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 text-left sm:flex-row sm:items-center sm:justify-between">
        {/* Left: logo mark + name/title */}
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <div className="flex flex-col">
            <span className="font-heading text-sm font-semibold tracking-tight">
              Andrew Brower
            </span>
            <span className="text-xs text-muted-foreground">
              Full Stack Software Engineer
            </span>
          </div>
        </div>

        {/* Right: copyright. TODO(content): finalize copy / auto-year if desired. */}
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Andrew Brower. All rights reserved.
        </p>
      </Reveal>
    </footer>
  );
}
