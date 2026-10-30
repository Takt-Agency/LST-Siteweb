import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared look for text inputs, selects and textareas. */
export function controlClass(invalid?: boolean) {
  return cn(
    "w-full rounded-md border bg-white px-4 py-3 text-base text-ink transition-colors outline-none placeholder:text-ink/35",
    "focus:border-ink focus-visible:outline-none",
    invalid ? "border-red-600" : "border-line hover:border-ink/40",
  );
}

/** Label + control + hint/error, wired with ids for accessibility. */
export function Field({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        {required ? (
          <span aria-hidden className="text-brand-yellow">
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (facultatif)</span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
