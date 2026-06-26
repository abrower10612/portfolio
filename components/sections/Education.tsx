import { Reveal } from "@/components/reveal";

const CERTIFICATES = [
  "Web Development",
  "Front End Development",
  "Back End Development",
];

export function Education() {
  return (
    <section
      id="education"
      className="scroll-mt-16 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
            Education
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Where I studied
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 max-w-3xl">
          <article className="rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <h3 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
Brigham Young University, Idaho
              </h3>
              <span className="shrink-0 font-heading text-sm text-muted-foreground">
                Class of 2021
              </span>
            </div>

            <p className="mt-1 font-heading text-sm font-medium text-brand">
              B.S. Applied Technology · 3.81 GPA
            </p>

            <div className="mt-4">
              <p className="font-heading text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Certificates
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {CERTIFICATES.map((cert) => (
                  <li
                    key={cert}
                    className="rounded-full border border-border bg-background px-3 py-1 font-heading text-sm font-medium"
                  >
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
