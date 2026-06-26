import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

import { CustomCursor } from "@/components/custom-cursor";

// Montserrat — headings + UI elements
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

// Inter — body copy. Pairs cleanly with Montserrat and stays highly
// legible down to small sizes (important for the 320px requirement).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://andrewbrower.dev"),
  title: "Andrew Brower | Full Stack Software Engineer",
  description:
    "Senior full stack software engineer specializing in React, Next.js, and TypeScript.",
};

// Applies the persisted (or system) theme before paint to avoid a
// flash of the wrong mode. No external theme library needed.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var s=window.matchMedia("(prefers-color-scheme: dark)").matches;var d=t==="dark"||((t==="system"||!t)&&s);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} ${inter.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <CustomCursor />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
