"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = "light" | "dark" | "system";

/**
 * Light / Dark / System theme switcher.
 *
 * - The preference is stored in localStorage ("light" | "dark" | "system";
 *   default "system"). The matching inline script in app/layout.tsx applies
 *   it pre-paint so there is no flash.
 * - In "system" mode the resolved theme follows the OS and updates live when
 *   the OS preference changes while the page is open.
 * - State is read straight from the DOM/localStorage via useSyncExternalStore,
 *   which keeps it hydration-safe.
 */

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getStoredTheme(): Theme {
  try {
    const t = localStorage.getItem("theme");
    if (t === "light" || t === "dark" || t === "system") return t;
  } catch {
    // ignore storage errors (private mode, etc.)
  }
  return "system";
}

function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

function setTheme(theme: Theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // ignore storage errors
  }
  applyTheme(theme);
  // Notify any mounted toggles to re-read the preference.
  window.dispatchEvent(new Event("themechange"));
}

// Snapshot encodes both the preference and the resolved theme so the
// trigger icon (resolved) and the active radio item (preference) both react.
function subscribe(callback: () => void) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", callback);
  window.addEventListener("themechange", callback);
  mql.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("themechange", callback);
    mql.removeEventListener("change", callback);
  };
}

function getSnapshot() {
  const pref = getStoredTheme();
  const dark = pref === "dark" || (pref === "system" && systemPrefersDark());
  return `${pref}|${dark ? "dark" : "light"}`;
}

function getServerSnapshot() {
  return "system|light";
}

export function ThemeToggle() {
  const snapshot = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [pref, resolved] = snapshot.split("|") as [Theme, "light" | "dark"];

  // Keep the applied class in sync with the OS when in system mode (the
  // pre-paint script only runs once on load).
  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getStoredTheme() === "system") applyTheme("system");
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Change theme" />
        }
      >
        {resolved === "dark" ? <Moon /> : <Sun />}
        <span className="sr-only">Change theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={pref}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          <DropdownMenuRadioItem value="light">
            <Sun />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
