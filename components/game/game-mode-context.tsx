"use client";

import * as React from "react";

type GameModeValue = {
  active: boolean;
  toggle: () => void;
  exit: () => void;
};

const GameModeContext = React.createContext<GameModeValue | null>(null);

/**
 * Holds the single "is the game running" flag. Lives above both the Nav (which
 * owns the toggle) and the game layer (which owns the simulation) so neither
 * has to know about the other.
 */
export function GameModeProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = React.useState(false);

  const value = React.useMemo<GameModeValue>(() => {
    // The flag goes on <html> here, in the click, rather than in the game's own
    // effect. Its CSS forces every scroll reveal visible and untransformed, and
    // the level has to be measured *after* that — a reveal still sitting at
    // translateY(24px) would put its platform 24px below the text you can see.
    const enter = () => {
      document.documentElement.dataset.gameActive = "true";
      setActive(true);
    };
    const leave = () => {
      delete document.documentElement.dataset.gameActive;
      setActive(false);
    };

    return {
      active,
      toggle: () => (active ? leave() : enter()),
      exit: leave,
    };
  }, [active]);

  return (
    <GameModeContext.Provider value={value}>{children}</GameModeContext.Provider>
  );
}

export function useGameMode() {
  const ctx = React.useContext(GameModeContext);
  if (!ctx) throw new Error("useGameMode must be used inside GameModeProvider");
  return ctx;
}
