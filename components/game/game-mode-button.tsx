"use client";

import { Gamepad2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGameMode } from "@/components/game/game-mode-context";

/**
 * Nav entry point. Labeled button from `sm` up, icon-only below it — the same
 * shape the CTA / hamburger pair already uses in the header.
 */
export function GameModeButton() {
  const { active, toggle } = useGameMode();
  const label = active ? "Exit game" : "Game mode";

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="hidden sm:inline-flex"
        aria-pressed={active}
        onClick={toggle}
      >
        {active ? <X /> : <Gamepad2 />}
        {label}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        aria-label={label}
        aria-pressed={active}
        onClick={toggle}
      >
        {active ? <X /> : <Gamepad2 />}
      </Button>
    </>
  );
}
