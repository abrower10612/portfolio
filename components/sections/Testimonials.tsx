import { Reveal } from "@/components/reveal";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Andrew strives to understand the big picture and has a talent for seeing potential gaps in specs or implementations. When he began regularly proposing reusable, modular solutions to make the product better, I knew he was truly thinking like a senior.",
    name: "Brian Reeve",
    role: "Platform Business Technology Director",
  },
  {
    quote:
      "He switched with ease between front and back end development and grew immeasurably over the year, easily earning his move to senior full stack developer. He produced high quality code with equally high quality documentation.",
    name: "Stephen Jones",
    role: "Principal Front End Developer",
  },
  {
    quote:
      "Andrew demonstrated exceptional skills in full stack development, consistently producing well designed, efficient, and scalable solutions. I always had full confidence in his ability to refine my designs to perfection.",
    name: "Jesse Johnson",
    role: "Lead UX Designer",
  },
  {
    quote:
      "Andrew has an incredible drive to learn new technologies and do quality work, and he naturally develops a deep understanding of a platform's inner workings. It's a joy to work with him, and he connects with everyone across teams and disciplines.",
    name: "Robert Towell",
    role: "Senior Full Stack Engineer",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-16 bg-muted/40 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
            Testimonials
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            What colleagues say
          </h2>
          <p className="mt-4 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            A few words from managers, teammates, and collaborators I have
            worked with over the years.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {TESTIMONIALS.map((testimonial, i) => (
            <Reveal
              key={testimonial.name}
              delay={(i % 2) * 0.08}
              className="flex flex-col rounded-xl border border-border bg-card p-6 sm:p-7"
            >
              <span
                aria-hidden
                className="font-heading text-5xl leading-none text-brand/50"
              >
                &ldquo;
              </span>
              <blockquote className="mt-1 flex-1 text-pretty text-foreground/90">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-5">
                <p className="font-heading font-semibold tracking-tight">
                  {testimonial.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
