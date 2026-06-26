"use client";

import { Menu } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogoMark } from "@/components/logo-mark";
import { ThemeToggle } from "@/components/theme-toggle";

// Anchor links shown in the mobile menu. Hero is intentionally omitted
// (the logo / top of page serves that role).
const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Stack", href: "#stack" },
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Concept", href: "#concept" },
  { label: "Education", href: "#education" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
] as const;

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: logo mark + site name */}
        <a href="#" className="flex min-w-0 items-center gap-2.5">
          <LogoMark />
          {/* TODO(content): final site name / wordmark */}
          <span className="truncate font-heading text-base font-semibold tracking-tight sm:text-lg">
            Andrew Brower
          </span>
        </a>

        {/* Right: theme toggle is always visible; CTA on desktop, hamburger on mobile */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          {/* Desktop CTA — anchors to the contact section */}
          <Button
            size="lg"
            className="hidden md:inline-flex"
            nativeButton={false}
            render={<a href="#contact" />}
          >
            Get in touch
          </Button>

          {/* Mobile menu — collapses the CTA + links into a sheet */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 gap-0">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5">
                  <LogoMark />
                  <span className="font-heading">Andrew Brower</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    nativeButton={false}
                    render={
                      <a
                        href={link.href}
                        className="rounded-md px-2 py-3 font-heading text-base font-medium text-foreground transition-colors hover:bg-muted"
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </div>

              <div className="mt-4 px-4">
                <SheetClose
                  nativeButton={false}
                  render={
                    <a
                      href="#contact"
                      className={buttonVariants({ size: "lg", className: "w-full" })}
                    />
                  }
                >
                  Get in touch
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
