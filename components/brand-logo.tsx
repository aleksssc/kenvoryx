import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "mark" | "wordmark" | "lockup";
  className?: string;
  decorative?: boolean;
  preload?: boolean;
};

export function BrandLogo({
  variant = "mark",
  className,
  decorative = false,
  preload = false,
}: BrandLogoProps) {
  if (variant === "lockup") {
    return (
      <span
        aria-hidden={decorative ? true : undefined}
        className={cn("inline-flex shrink-0 items-center gap-2.5", className)}
      >
        <BrandLogo decorative preload={preload} className="h-9 w-8" />
        <span className="whitespace-nowrap text-[18px] font-semibold leading-none tracking-[-0.04em] text-zinc-100">
          Ken<span className="font-normal text-zinc-400">voryx</span>
        </span>
      </span>
    );
  }

  if (variant === "wordmark") {
    return (
      <span
        aria-hidden={decorative ? true : undefined}
        className={cn("inline-flex shrink-0 items-center whitespace-nowrap text-[24px] font-semibold leading-none tracking-[-0.04em] text-zinc-100", className)}
      >
        Kenvoryx
      </span>
    );
  }

  const isMark = variant === "mark";

  return (
    <Image
      src={`/logos/sentinelgrid-${variant}.svg`}
      alt={decorative ? "" : "Kenvoryx"}
      width={isMark ? 320 : 800}
      height={isMark ? 384 : 160}
      preload={preload}
      unoptimized
      className={cn(
        "shrink-0 object-contain",
        isMark ? "h-8 w-8" : "h-auto w-36",
        className,
      )}
    />
  );
}
