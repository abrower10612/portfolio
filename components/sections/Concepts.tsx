import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/reveal";

type Concept = {
  name: string;
  image: string;
  blurb: string;
  stack: string[];
  live?: string;
};

const CONCEPTS: Concept[] = [
  {
    name: "LeadMagic Concept",
    image: "/concepts/leadmagic.webp",
    blurb:
      "A focused product concept exploring how I would improve a B2B data enrichment platform's list enrichment flow, from uploading a CSV and estimating credits to running enrichments in parallel and reviewing the results.",
    stack: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
    live: "https://leadmagic.andrewbrower.dev/",
  },
  {
    name: "Tremendous Concept",
    image: "/concepts/tremendous.webp",
    blurb:
      "A concept reimagining the dashboard for a business rewards and payouts platform. It adds something the real product does not have: a contacts system that lets you save recipients once and reuse them when sending gift cards.",
    stack: ["React", "Ruby on Rails", "Railway"],
    live: "https://tremendous.andrewbrower.dev/",
  },
];

export function Concepts() {
  return (
    <section
      id="concepts"
      className="scroll-mt-16 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
            Concepts
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Things I&apos;m exploring
          </h2>
          <p className="mt-4 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            Self initiated concepts where I prototype product ideas and the
            improvements I would make to the tools I use.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {CONCEPTS.map((concept, i) => (
            <Reveal
              key={concept.name}
              delay={(i % 2) * 0.08}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              {/* Screenshot */}
              <div className="relative aspect-16/10 overflow-hidden border-b border-border bg-muted">
                <Image
                  src={concept.image}
                  alt={concept.name}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  {concept.name}
                </h3>

                <p className="mt-2 flex-1 text-sm text-pretty text-muted-foreground">
                  {concept.blurb}
                </p>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {concept.stack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 font-heading text-xs font-medium text-foreground/80"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>

                {concept.live && (
                  <div className="mt-5 flex items-center gap-5">
                    <a
                      href={concept.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-heading text-sm font-medium text-foreground transition-colors hover:text-brand"
                    >
                      Live demo <ArrowUpRight className="size-4" />
                    </a>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
