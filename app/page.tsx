import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Stack } from "@/components/sections/Stack";
import { Work } from "@/components/sections/Work";
import { Projects } from "@/components/sections/Projects";
import { Concepts } from "@/components/sections/Concepts";
import { Education } from "@/components/sections/Education";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { GameModeProvider } from "@/components/game/game-mode-context";
import { GameMode } from "@/components/game/game-mode";

// Single scrollable one-pager. Sections render in order; the fixed Nav
// sits above the flow and Footer closes it out. The GameMode provider wraps
// everything so the Nav toggle and the game layer share one flag.
export default function Home() {
  return (
    <GameModeProvider>
      <Nav />
      <main className="flex-1">
        <Hero />
        <About />
        <Stack />
        <Work />
        <Projects />
        <Concepts />
        <Education />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <GameMode />
    </GameModeProvider>
  );
}
