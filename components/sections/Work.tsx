import { Reveal } from "@/components/reveal";

type Role = {
  company: string;
  role: string;
  dates: string;
  description: string;
};

const ROLES: Role[] = [
  {
    company: "Kaveotech",
    role: "Owner & Founder",
    dates: "2025 to Present",
    description:
      "Founded and run a web development and digital marketing agency serving home services businesses. I build and deploy full stack Next.js client sites on Vercel, owning the whole lifecycle from architecture to production, and I manage the technical infrastructure like DNS, hosting, and domains across multiple client accounts.",
  },
  {
    company: "BambooHR",
    role: "Software Engineer II & Scrum Master",
    dates: "2024 to 2025",
    description:
      "Key contributor to a company wide initiative migrating the frontend from a legacy PHP Twig engine to modern React, building clean, modular components and patterns the engineering team adopted across the codebase. I also served as Scrum Master, running daily standups and leading two week sprints in Jira.",
  },
  {
    company: "TaxCredible",
    role: "Full Stack Software Engineer",
    dates: "2022 to 2024",
    description:
      "Hardened a production application by introducing TypeScript on the server to eliminate type errors, and added JWT authentication with a role based access system across both the API and UI layers. I owned peer reviews, unit testing, and debugging standards.",
  },
  {
    company: "Cocoa Accounting",
    role: "Full Stack Software Engineer",
    dates: "2021 to 2022",
    description:
      "Led a team of five engineers building a full stack gift card processing platform and companion mobile app in Next.js, TypeScript, React, Node, Express, and Firebase. I architected features end to end, from database schema design to the customer facing UI.",
  },
];

export function Work() {
  return (
    <section
      id="work"
      className="scroll-mt-16 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
            Work
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Experience
          </h2>
        </Reveal>

        {/* Vertical list of full-width cards */}
        <div className="mt-10 flex max-w-3xl flex-col gap-4 sm:gap-5">
          {ROLES.map((role, i) => (
            <Reveal
              key={role.company}
              delay={i * 0.08}
              className="rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6"
            >
              {/* Header row: company + date range. Stacks on the smallest screens. */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h3 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
                  {role.company}
                </h3>
                <span className="shrink-0 font-heading text-sm text-muted-foreground">
                  {role.dates}
                </span>
              </div>

              <p className="mt-1 font-heading text-sm font-medium text-brand">
                {role.role}
              </p>

              <p className="mt-3 text-sm text-pretty text-muted-foreground sm:text-base">
                {role.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
