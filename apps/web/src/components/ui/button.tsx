import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "ghost" | "accent";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: "border border-border bg-bg-card text-text hover:bg-bg-muted",
  ghost: "text-text hover:bg-bg-muted",
  accent: "bg-accent text-white hover:bg-accent-hover",
};

function Button({ className, variant = "default", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Button };
export type { ButtonProps };
