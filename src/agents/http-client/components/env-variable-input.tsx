"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

interface EnvVariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

// Parse text to identify environment variables {{variable}}
interface Segment {
  type: "text" | "variable";
  value: string;
}

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    // Add the variable
    segments.push({ type: "variable", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

// Get the environment variable name from {{name}}
function getVariableName(value: string): string {
  return value.slice(2, -2).trim();
}

export function EnvVariableInput({
  value,
  onChange,
  placeholder,
  className,
  multiline = false,
  rows = 3,
}: EnvVariableInputProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const segments = useMemo(() => parseSegments(value), [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(e.target.value);
      setCursorPosition(e.target.selectionStart);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "{" && e.shiftKey) {
        // Auto-complete {{
        e.preventDefault();
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newValue = value.slice(0, start) + "{{}}" + value.slice(end);
        onChange(newValue);
        // Position cursor between the braces
        setTimeout(() => {
          target.setSelectionRange(start + 2, start + 2);
        }, 0);
      }
    },
    [value, onChange]
  );

  // Mirror div for displaying highlighted content
  const HighlightContent = () => (
    <>
      {segments.length === 0 ? (
        <span className="text-ctp-overlay0/40">{placeholder}</span>
      ) : (
        segments.map((segment, index) => (
          <span
            key={index}
            className={cn(
              segment.type === "variable" &&
                "text-ctp-lavender bg-ctp-lavender/10 px-0.5 rounded"
            )}
          >
            {segment.value}
          </span>
        ))
      )}
    </>
  );

  if (multiline) {
    return (
      <div className={cn("relative", className)}>
        {/* Highlight layer */}
        <div
          className={cn(
            "absolute inset-0 p-[var(--space-sm)] font-mono text-[12px] leading-[1.6] pointer-events-none whitespace-pre-wrap break-all overflow-hidden",
            isFocused ? "text-transparent" : "text-ctp-text"
          )}
          aria-hidden="true"
        >
          <HighlightContent />
        </div>
        {/* Input layer */}
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ""}
          rows={rows}
          spellCheck={false}
          className={cn(
            "w-full bg-transparent font-mono text-[12px] leading-[1.6] resize-none",
            "border border-ctp-surface0/30 rounded-[var(--radius-md)] p-[var(--space-sm)]",
            "focus:border-ctp-lavender/40 focus:ring-2 focus:ring-ctp-lavender/10 focus:outline-none",
            isFocused ? "text-ctp-text" : "text-transparent caret-ctp-lavender"
          )}
          style={{ minHeight: `${rows * 1.6}em` }}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Highlight layer */}
      <div
        className={cn(
          "absolute inset-0 px-3 flex items-center font-mono text-[13px] pointer-events-none whitespace-nowrap overflow-hidden",
          isFocused ? "text-transparent" : "text-ctp-text"
        )}
        aria-hidden="true"
      >
        <HighlightContent />
      </div>
      {/* Input layer */}
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused ? placeholder : ""}
        spellCheck={false}
        autoComplete="off"
        className={cn(
          "w-full h-full bg-transparent font-mono text-[13px] px-3 outline-none",
          isFocused ? "text-ctp-text" : "text-transparent caret-ctp-lavender"
        )}
      />
    </div>
  );
}
