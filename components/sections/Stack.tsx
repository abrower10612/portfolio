import { Reveal } from "@/components/reveal";

// The technologies shown as pills. Ordered roughly by prominence.
const STACK = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "Vue.js",
  "React Native",
  "MongoDB",
  "MySQL",
  "Firebase",
  "Vercel",
  "Docker",
  "Git",
  "Jira",
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
            <li key={tech}>
              <Reveal delay={i * 0.04}>
                <div className="flex h-12 items-center justify-center rounded-full border border-border bg-card px-4 text-center font-heading text-sm font-medium text-card-foreground">
                  {tech}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
