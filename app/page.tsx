import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Stack } from "@/components/sections/Stack";
import { Work } from "@/components/sections/Work";
import { Projects } from "@/components/sections/Projects";
import { Education } from "@/components/sections/Education";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

// Single scrollable one-pager. Sections render in order; the fixed Nav
// sits above the flow and Footer closes it out.
export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <About />
        <Stack />
        <Work />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
