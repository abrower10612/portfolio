import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { GitHubIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";

type Project = {
  name: string;
  category: "Professional" | "Personal" | "Product";
  image: string;
  blurb: string;
  stack: string[];
  live?: string;
  repo?: string;
};

const PROJECTS: Project[] = [
  {
    name: "BambooHR",
    category: "Professional",
    image: "/projects/bamboohr.webp",
    blurb:
      "A leading HR platform used by tens of thousands of companies. As a key contributor to a company wide frontend modernization, I helped migrate the interface from a legacy PHP Twig engine to modern React, building clean, modular components and patterns the engineering team adopted across the codebase.",
    stack: ["React", "TypeScript", "JavaScript"],
    live: "https://www.bamboohr.com/",
  },
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
    name: "Kaveotech",
    category: "Professional",
    image: "/projects/kaveotech.webp",
    blurb:
      "The web development and digital marketing agency I founded and run, serving contractors and home services businesses. I design, build, and deploy full stack Next.js client sites on Vercel and handle everything from architecture to launch.",
    stack: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Vercel"],
    live: "https://kaveotech.com/",
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
    name: "Latter Day Leaders",
    category: "Product",
    image: "/projects/latter-day-leaders.webp",
    blurb:
      "A web application I designed and built for leaders in The Church of Jesus Christ of Latter Day Saints, helping them stay organized and focused on the people they serve.",
    stack: ["TypeScript", "React", "Node.js", "Express", "MongoDB"],
    live: "https://latterdayleaders.org/",
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
              <div className="relative aspect-16/10 overflow-hidden border-b border-border bg-muted">
                <Image
                  src={project.image}
                  alt={project.name}
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
                      project.category === "Personal"
                        ? "border-border text-muted-foreground"
                        : "border-brand/40 text-brand"
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

                {(project.live || project.repo) && (
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
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
