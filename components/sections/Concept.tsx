import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

const STACK = ["Next.js", "TypeScript", "React", "Tailwind CSS"];

export function Concept() {
  return (
    <section
      id="concept"
      className="scroll-mt-16 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
            Concept
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            LeadMagic Concept
          </h2>
          <p className="mt-4 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            A focused product concept exploring how I would improve a B2B data
            enrichment platform&apos;s list enrichment flow, from uploading a
            CSV and estimating credits to running enrichments in parallel and
            reviewing the results.
          </p>

          <ul className="mt-6 flex flex-wrap gap-1.5">
            {STACK.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-border bg-muted px-2.5 py-0.5 font-heading text-xs font-medium text-foreground/80"
              >
                {tech}
              </li>
            ))}
          </ul>

          <a
            href="https://leadmagic.andrewbrower.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "lg", className: "mt-7" })}
          >
            Explore the live demo <ArrowUpRight className="size-4" />
          </a>
        </Reveal>

        {/* Browser-framed screenshot */}
        <Reveal delay={0.1} className="mt-12">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              <div className="ml-3 hidden truncate rounded-md bg-muted px-3 py-1 font-heading text-xs text-muted-foreground sm:block">
                leadmagic.andrewbrower.dev
              </div>
            </div>
            <Image
              src="/concepts/leadmagic.webp"
              alt="LeadMagic concept dashboard, a bulk list enrichment view"
              width={1800}
              height={1125}
              sizes="(min-width: 1024px) 1100px, 100vw"
              className="w-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
