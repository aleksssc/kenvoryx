import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "mark" | "wordmark" | "lockup";
  className?: string;
  decorative?: boolean;
  preload?: boolean;
};

/**
 * Public-facing KenvoryX identity.
 * Legacy SentinelGrid asset names are deliberately left in the repository for
 * compatibility with already-shipped Windows installers and signing scripts.
 */
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
        <BrandLogo decorative preload={preload} className="h-9 w-9" />
        <span className="whitespace-nowrap text-[18px] font-semibold leading-none tracking-[-0.045em] text-zinc-100">
          Kenvory<span className="bg-gradient-to-br from-cyan-300 to-blue-500 bg-clip-text text-transparent">X</span>
        </span>
      </span>
    );
  }

  if (variant === "wordmark") {
    return (
      <span
        aria-hidden={decorative ? true : undefined}
        className={cn(
          "inline-flex shrink-0 items-center whitespace-nowrap text-[24px] font-semibold leading-none tracking-[-0.04em] text-zinc-100",
          className,
        )}
      >
        Kenvory<span className="bg-gradient-to-br from-cyan-300 to-blue-500 bg-clip-text text-transparent">X</span>
      </span>
    );
  }

  return (
    <Image
      src="/logos/kenvoryx-mark.svg"
      alt={decorative ? "" : "KenvoryX"}
      width={350}
      height={365}
      preload={preload}
      unoptimized
      className={cn("shrink-0 object-contain h-8 w-8", className)}
    />
  );
}
