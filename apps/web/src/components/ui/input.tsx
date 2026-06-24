import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={clsx(
        "flex h-8 w-full rounded-md border border-border bg-bg-card px-2.5 text-sm text-text",
        "placeholder:text-text-muted",
        "focus:outline-none focus:ring-2 focus:ring-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
