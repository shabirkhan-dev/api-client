"use client";

import { cn } from "@/shared/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  ariaLabel?: string;
}

export function Checkbox({ checked, onChange, className, ariaLabel }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-5 h-5 rounded-[var(--radius-sm)] border transition-all duration-150 flex items-center justify-center",
        checked
          ? "bg-ctp-lavender border-ctp-lavender"
          : "bg-transparent border-ctp-surface0/50 hover:border-ctp-overlay0/50",
        className
      )}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-ctp-crust"
        >
          <path
            d="M2 6L5 9L10 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
