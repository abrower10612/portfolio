import Image from "next/image";

import { Reveal } from "@/components/reveal";

export function About() {
  return (
    <section
      id="about"
      className="scroll-mt-16 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
        {/* Copy */}
        <Reveal>
          <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
            About
          </p>

          <p className="mt-6 max-w-2xl text-lg text-pretty text-foreground/90 sm:text-xl sm:leading-relaxed">
            I&apos;m a senior full stack software engineer based in Provo, Utah,
            with a strong foundation in TypeScript, React, and Next.js. Most
            recently I was a key contributor to a company wide frontend
            migration from legacy PHP Twig to modern React at BambooHR, where I
            also served as Scrum Master. Today I run Kaveotech, a web
            development agency I founded, where I design, build, and deploy full
            stack Next.js applications end to end. Before engineering, I spent
            several years in enterprise B2B sales, so I bring a practical
            understanding of how go to market teams operate to everything I
            build.
          </p>
        </Reveal>

        {/* Headshot */}
        <Reveal delay={0.1}>
          <Image
            src="/andrew-brower.png"
            alt="Andrew Brower"
            width={800}
            height={801}
            sizes="(min-width: 1024px) 320px, 280px"
            className="h-auto w-full max-w-xs rounded-2xl border border-border shadow-sm"
          />
        </Reveal>
      </div>
    </section>
  );
}
