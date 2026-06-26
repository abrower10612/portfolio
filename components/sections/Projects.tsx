import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";

// Inline GitHub mark (lucide dropped its brand icons).
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.61 8.2 11.17.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.31-5.47-5.84 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 3-.4c1.02 0 2.05.13 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.66 1.64.24 2.86.12 3.16.77.83 1.24 1.88 1.24 3.17 0 4.54-2.81 5.54-5.49 5.83.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .31.21.68.83.56A12.3 12.3 0 0 0 24 12.29C24 5.78 18.63.5 12 .5Z" />
    </svg>
  );
}

type Project = {
  name: string;
  category: "Professional" | "Personal";
  image: string;
  blurb: string;
  stack: string[];
  live?: string;
  repo?: string;
};

const PROJECTS: Project[] = [
  {
    name: "TaxCredible",
    category: "Professional",
    image: "/projects/taxcredible.webp",
    blurb:
      "A tax credit platform trusted by hundreds of CPA firms. I introduced TypeScript across the application server, added JWT authentication with a role based access system, and built role aware interfaces on the frontend.",
    stack: ["TypeScript", "Vue", "Express", "Node.js", "AWS", "MySQL", "Docker", "GitLab"],
    live: "https://www.taxcredible.com/",
  },
  {
    name: "Cocoa Gift Cards",
    category: "Professional",
    image: "/projects/cocoa-gift-cards.webp",
    blurb:
      "A gift card platform that lets businesses sell and manage gift cards with no processing fees. I helped lead a team of five building it end to end, from database schema to the customer facing UI, alongside a companion mobile app.",
    stack: ["TypeScript", "React", "Recoil", "Node.js", "Express", "Java", "Android", "Firebase"],
    live: "https://www.cocoagiftcards.com/",
  },
  {
    name: "Cocoa Tickets",
    category: "Professional",
    image: "/projects/cocoa-tickets.webp",
    blurb:
      "An event and ticketing platform with customizable ticket types, onsite redemption, and attendance tracking. I built full stack features across the web app and a companion mobile app.",
    stack: ["TypeScript", "React", "Recoil", "Node.js", "Express", "Java", "Android", "Firebase"],
    live: "https://www.cocoatickets.com/",
  },
  {
    name: "Dice Roller",
    category: "Personal",
    image: "/projects/dice-roller.webp",
    blurb:
      "A small Flutter app where you choose how many dice to roll and let them fly. A quick exploration of Dart and Flutter.",
    stack: ["Dart", "Flutter"],
    live: "https://dice-roller-bvd3.onrender.com/",
    repo: "https://github.com/abrower10612/flutter-dice-roller",
  },
  {
    name: "Task Tracker",
    category: "Personal",
    image: "/projects/task-tracker.webp",
    blurb:
      "A task tracker I built to explore Flutter and Dart on the frontend with a Python and Django backend.",
    stack: ["Dart", "Flutter", "Python", "Django"],
    live: "https://flutter-task-tracker.onrender.com/",
    repo: "https://github.com/abrower10612/flutter-task-tracker",
  },
  {
    name: "Drawing Queens",
    category: "Personal",
    image: "/projects/drawing-queens.webp",
    blurb:
      "A for fun app that uses the Deck of Cards API to keep drawing two cards until it pulls the queen of every suit. Built in React.",
    stack: ["React"],
    live: "https://drawing-queens-react.onrender.com/",
    repo: "https://github.com/abrower10612/drawing-queens-react",
  },
];

export function Projects() {
  return (
    <section
      id="projects"
      className="scroll-mt-16 bg-muted/40 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
            Projects
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Things I&apos;ve built
          </h2>
          <p className="mt-4 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            A mix of production products and personal builds, from platforms
            serving hundreds of firms to small apps I made to learn something
            new.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {PROJECTS.map((project, i) => (
            <Reveal
              key={project.name}
              delay={(i % 2) * 0.08}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              {/* Screenshot */}
              <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted">
                <Image
                  src={project.image}
                  alt={`${project.name} screenshot`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-heading text-lg font-semibold tracking-tight">
                    {project.name}
                  </h3>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 font-heading text-[11px] font-medium tracking-wide uppercase",
                      project.category === "Professional"
                        ? "border-brand/40 text-brand"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {project.category}
                  </span>
                </div>

                <p className="mt-2 flex-1 text-sm text-pretty text-muted-foreground">
                  {project.blurb}
                </p>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 font-heading text-xs font-medium text-foreground/80"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center gap-5">
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-heading text-sm font-medium text-foreground transition-colors hover:text-brand"
                    >
                      Live site <ArrowUpRight className="size-4" />
                    </a>
                  )}
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-heading text-sm font-medium text-foreground transition-colors hover:text-brand"
                    >
                      <GitHubIcon className="size-4" /> Code
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
