import type { IconType } from "react-icons";
import {
  SiDocker,
  SiExpress,
  SiFirebase,
  SiGit,
  SiJira,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiTypescript,
  SiVercel,
  SiVuedotjs,
} from "react-icons/si";

import { Reveal } from "@/components/reveal";

type Tech = { name: string; Icon: IconType };

// Ordered roughly by prominence. React Native reuses the React mark.
const STACK: Tech[] = [
  { name: "TypeScript", Icon: SiTypescript },
  { name: "JavaScript", Icon: SiJavascript },
  { name: "React", Icon: SiReact },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "Node.js", Icon: SiNodedotjs },
  { name: "Express", Icon: SiExpress },
  { name: "Vue.js", Icon: SiVuedotjs },
  { name: "React Native", Icon: SiReact },
  { name: "MongoDB", Icon: SiMongodb },
  { name: "MySQL", Icon: SiMysql },
  { name: "Firebase", Icon: SiFirebase },
  { name: "Vercel", Icon: SiVercel },
  { name: "Docker", Icon: SiDocker },
  { name: "Git", Icon: SiGit },
  { name: "Jira", Icon: SiJira },
];

export function Stack() {
  return (
    <section
      id="stack"
      className="scroll-mt-16 bg-muted/40 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
            Stack
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            The tools I build with
          </h2>
          <p className="mt-4 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            The languages, frameworks, and platforms I reach for to ship
            production software.
          </p>
        </Reveal>

        {/* Responsive pill grid: 2 cols (mobile) → 3 (tablet) → 5 (desktop) */}
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {STACK.map((tech, i) => (
            <li key={tech.name}>
              <Reveal delay={i * 0.04}>
                <div className="flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 font-heading text-sm font-medium text-card-foreground">
                  <tech.Icon aria-hidden className="size-4 shrink-0" />
                  {tech.name}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
