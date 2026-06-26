import { Reveal } from "@/components/reveal";

export function Contact() {
  return (
    <section
      id="contact"
      className="scroll-mt-16 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
            Contact
          </p>

          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Let&apos;s build something together
          </h2>

          <p className="mt-4 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            I&apos;m open to senior full stack and Next.js engineering roles.
            Email is the fastest way to reach me, and I&apos;ll get back to you
            quickly.
          </p>
        </Reveal>

        {/* Contact links — stack on mobile, inline on larger screens */}
        <Reveal
          delay={0.1}
          className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-8"
        >
          <a
            href="mailto:contact@andrewbrower.dev"
            className="font-heading text-base font-medium text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
          >
            contact@andrewbrower.dev
          </a>
          <a
            href="tel:+13853067019"
            className="font-heading text-base font-medium text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
          >
            (385) 306 7019
          </a>
          <a
            href="https://www.linkedin.com/in/andrewbrower91/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-heading text-base font-medium text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
          >
            LinkedIn
          </a>
        </Reveal>
      </div>
    </section>
  );
}
