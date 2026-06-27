import { Mail, Phone } from "lucide-react";

import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";

const SECONDARY_LINK =
  "inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 font-heading text-sm font-medium text-paper transition-colors hover:border-white/35 hover:bg-white/5";

export function Contact() {
  return (
    <section
      id="contact"
      className="scroll-mt-16 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          {/* Bold gradient CTA panel — pops on both the light and dark canvas */}
          <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#15273f] via-[#1d2348] to-[#2c1c4c] p-8 text-paper shadow-2xl sm:p-12 lg:p-16">
            {/* Aurora glows */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
            >
              <div
                className="hero-drift-alt absolute top-[-35%] left-[-8%] h-[60vmin] w-[60vmin] rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgb(126 63 158 / 0.55), transparent 60%)",
                }}
              />
              <div
                className="hero-drift-alt absolute right-[-6%] bottom-[-45%] h-[55vmin] w-[55vmin] rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgb(242 194 48 / 0.4), transparent 60%)",
                }}
              />
            </div>

            <p className="font-heading text-sm font-semibold tracking-wide text-gold uppercase">
              Contact
            </p>
            <h2 className="mt-3 max-w-2xl font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Let&apos;s build something together
            </h2>
            <p className="mt-4 max-w-xl text-base text-pretty text-paper/70 sm:text-lg">
              I&apos;m open to senior full stack and Next.js engineering roles.
              Email is the fastest way to reach me, and I&apos;ll get back to
              you quickly.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {/* Primary CTA */}
              <a
                href="mailto:contact@andrewbrower.dev"
                className="hero-cta-sheen inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 font-heading text-sm font-semibold text-navy transition-colors hover:bg-gold/90"
              >
                <Mail className="size-4" /> Email me
              </a>
              <a href="tel:+13853067019" className={SECONDARY_LINK}>
                <Phone className="size-4" /> (385) 306 7019
              </a>
              <a
                href="https://www.linkedin.com/in/andrewbrower91/"
                target="_blank"
                rel="noopener noreferrer"
                className={SECONDARY_LINK}
              >
                <LinkedInIcon className="size-4" /> LinkedIn
              </a>
              <a
                href="https://github.com/abrower10612"
                target="_blank"
                rel="noopener noreferrer"
                className={SECONDARY_LINK}
              >
                <GitHubIcon className="size-4" /> GitHub
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
