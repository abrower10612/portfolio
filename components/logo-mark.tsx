import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logo mark. The artwork (gradient + navy "A", rounded corners) is baked
 * into /logo.png, so this just renders and sizes it.
 *
 * alt is empty by default: the mark is always paired with the "Andrew
 * Brower" wordmark, so labeling it would be redundant for screen readers.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={32}
      height={32}
      priority
      className={cn("size-8 shrink-0 rounded-md", className)}
    />
  );
}
