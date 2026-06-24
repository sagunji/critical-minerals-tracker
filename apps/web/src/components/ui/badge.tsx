import clsx from "clsx";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "success" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "border border-border bg-bg-card text-text",
  accent: "bg-accent text-white",
  success: "bg-[#d4edda] text-[#1e5631]",
  muted: "bg-bg-muted text-text-muted",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps };
