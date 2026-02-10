"use client";

import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";

interface SyntaxHighlightProps {
  code: string;
  language?: "json" | "xml" | "html" | "text";
  className?: string;
}

// Token types for syntax highlighting
interface Token {
  type: "string" | "number" | "boolean" | "null" | "key" | "punctuation" | "text";
  value: string;
}

function tokenizeJSON(json: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < json.length) {
    const char = json[i];

    // Whitespace
    if (/\s/.test(char)) {
      tokens.push({ type: "text", value: char });
      i++;
      continue;
    }

    // String
    if (char === '"') {
      let value = '"';
      i++;
      while (i < json.length && json[i] !== '"') {
        if (json[i] === '\\' && i + 1 < json.length) {
          value += json[i] + json[i + 1];
          i += 2;
        } else {
          value += json[i];
          i++;
        }
      }
      if (i < json.length) {
        value += '"';
        i++;
      }
      
      // Check if this is a key (followed by :)
      const nextNonSpace = json.slice(i).match(/^\s*:/);
      tokens.push({ type: nextNonSpace ? "key" : "string", value });
      continue;
    }

    // Number
    if (/[-\d]/.test(char)) {
      let value = char;
      i++;
      while (i < json.length && /[\d.eE+-]/.test(json[i])) {
        value += json[i];
        i++;
      }
      tokens.push({ type: "number", value });
      continue;
    }

    // Boolean
    if (json.slice(i, i + 4) === "true" || json.slice(i, i + 5) === "false") {
      const isTrue = json.slice(i, i + 4) === "true";
      const value = isTrue ? "true" : "false";
      tokens.push({ type: "boolean", value });
      i += value.length;
      continue;
    }

    // Null
    if (json.slice(i, i + 4) === "null") {
      tokens.push({ type: "null", value: "null" });
      i += 4;
      continue;
    }

    // Punctuation
    if (/[{}[\]:,]/.test(char)) {
      tokens.push({ type: "punctuation", value: char });
      i++;
      continue;
    }

    // Unknown character
    tokens.push({ type: "text", value: char });
    i++;
  }

  return tokens;
}

function tokenizeXML(xml: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(<\/?[\w-]+)|([\w-]+=)|("[^"]*")|(>)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(xml)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: xml.slice(lastIndex, match.index) });
    }

    const [fullMatch, tag, attr, string, close] = match;

    if (tag) {
      tokens.push({ type: "key", value: fullMatch });
    } else if (attr) {
      tokens.push({ type: "key", value: attr.slice(0, -1) });
      tokens.push({ type: "punctuation", value: "=" });
    } else if (string) {
      tokens.push({ type: "string", value: fullMatch });
    } else if (close) {
      tokens.push({ type: "punctuation", value: fullMatch });
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < xml.length) {
    tokens.push({ type: "text", value: xml.slice(lastIndex) });
  }

  return tokens;
}

const tokenStyles: Record<Token["type"], string> = {
  string: "text-ctp-green",
  number: "text-ctp-peach",
  boolean: "text-ctp-mauve",
  null: "text-ctp-overlay0",
  key: "text-ctp-lavender",
  punctuation: "text-ctp-overlay0",
  text: "text-ctp-subtext1",
};

export function SyntaxHighlight({ code, language = "json", className }: SyntaxHighlightProps) {
  const tokens = useMemo(() => {
    if (language === "json") {
      try {
        // Format JSON first
        const formatted = JSON.stringify(JSON.parse(code), null, 2);
        return tokenizeJSON(formatted);
      } catch {
        // If invalid JSON, just return as text
        return [{ type: "text" as const, value: code }];
      }
    }
    if (language === "xml" || language === "html") {
      return tokenizeXML(code);
    }
    return [{ type: "text" as const, value: code }];
  }, [code, language]);

  return (
    <code className={cn("font-mono text-[12px] leading-[1.7] whitespace-pre", className)}>
      {tokens.map((token, index) => (
        <span key={index} className={tokenStyles[token.type]}>
          {token.value}
        </span>
      ))}
    </code>
  );
}

// Simple line numbers component
interface LineNumbersProps {
  code: string;
  className?: string;
}

export function LineNumbers({ code, className }: LineNumbersProps) {
  const lines = code.split("\n").length;

  return (
    <div className={cn("select-none text-right pr-4", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="text-[12px] leading-[1.7] text-ctp-overlay0/40 font-mono tabular-nums"
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}

// Full code block with line numbers
interface CodeBlockProps extends SyntaxHighlightProps {
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language, showLineNumbers = true, className }: CodeBlockProps) {
  const formattedCode = useMemo(() => {
    if (language === "json") {
      try {
        return JSON.stringify(JSON.parse(code), null, 2);
      } catch {
        return code;
      }
    }
    return code;
  }, [code, language]);

  return (
    <div className={cn("flex overflow-auto", className)}>
      {showLineNumbers && (
        <LineNumbers code={formattedCode} className="shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <SyntaxHighlight code={formattedCode} language={language} />
      </div>
    </div>
  );
}
