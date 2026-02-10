"use client";

import { useCallback, useMemo, useState } from "react";
import { Copy01Icon, Delete02Icon, Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { Badge, Button, GlassPanel } from "@/shared/components/ui";
import { cn, formatBytes } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import type { ResponseTab } from "../types";
import { CodeBlock, SyntaxHighlight } from "./syntax-highlight";

const IC = 14;

const tabs: { id: ResponseTab; label: string }[] = [
  { id: "body", label: "Body" },
  { id: "headers", label: "Headers" },
  { id: "cookies", label: "Cookies" },
  { id: "timeline", label: "Timeline" },
];

const timelinePhases = [
  { label: "DNS Lookup", pct: 10, color: "bg-ctp-teal" },
  { label: "TCP Connect", pct: 20, color: "bg-ctp-blue" },
  { label: "TLS Handshake", pct: 20, color: "bg-ctp-sapphire" },
  { label: "Time to First Byte", pct: 30, color: "bg-ctp-lavender" },
  { label: "Content Download", pct: 20, color: "bg-ctp-mauve" },
] as const;

function getStatusVariant(status: number): "success" | "warning" | "peach" | "danger" {
  if (status < 300) return "success";
  if (status < 400) return "warning";
  if (status < 500) return "peach";
  return "danger";
}

function detectLanguage(contentType: string): "json" | "xml" | "html" | "text" {
  if (contentType.includes("application/json")) return "json";
  if (contentType.includes("application/xml") || contentType.includes("text/xml")) return "xml";
  if (contentType.includes("text/html")) return "html";
  return "text";
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-32 gap-[var(--space-sm)]">
      <div className="w-12 h-12 rounded-full bg-ctp-surface0/30 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ctp-overlay0/50">
          <path d="M9 12H15M12 9V15M3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 10.8181 20.7672 9.64778 20.3149 8.55585C19.8626 7.46392 19.1997 6.47177 18.364 5.63604C17.5282 4.80031 16.5361 4.13738 15.4442 3.68508C14.3522 3.23279 13.1819 3 12 3C10.8181 3 9.64778 3.23279 8.55585 3.68508C7.46392 4.13738 6.47177 4.80031 5.63604 5.63604C4.80031 6.47177 4.13738 7.46392 3.68508 8.55585C3.23279 9.64778 3 10.8181 3 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-[11px] text-ctp-overlay0/50 text-center select-none">{message}</p>
    </div>
  );
}

export function ResponsePanel() {
  const { lastResponse, setLastResponse } = useAppStore();
  const [activeTab, setActiveTab] = useState<ResponseTab>("body");

  const handleCopy = useCallback(async () => {
    if (!lastResponse) return;
    await navigator.clipboard.writeText(lastResponse.body);
    toast.success("Copied to clipboard");
  }, [lastResponse]);

  const handleDownload = useCallback(() => {
    if (!lastResponse) return;
    const blob = new Blob([lastResponse.body], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Response downloaded");
  }, [lastResponse]);

  const handleClear = useCallback(() => setLastResponse(null), [setLastResponse]);

  const timeline = lastResponse
    ? timelinePhases.map((phase) => ({
        ...phase,
        ms: Math.max(0.1, lastResponse.time * (phase.pct / 100)),
      }))
    : [];

  const headerEntries = lastResponse ? Object.entries(lastResponse.headers) : [];

  const responseLanguage = useMemo(() => {
    if (!lastResponse) return "text";
    const contentType = lastResponse.headers["content-type"] || lastResponse.headers["Content-Type"] || "";
    return detectLanguage(String(contentType));
  }, [lastResponse]);

  return (
    <GlassPanel noPadding className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-[var(--space-lg)] pt-[var(--space-lg)] pb-[var(--space-md)] shrink-0">
        <div className="flex items-center gap-[var(--space-sm)] min-w-0 flex-wrap">
          {lastResponse ? (
            <>
              <Badge
                variant={getStatusVariant(lastResponse.status)}
                className="font-mono tabular-nums"
              >
                {lastResponse.status} {lastResponse.statusText}
              </Badge>
              <Badge className="font-mono tabular-nums">{lastResponse.time}ms</Badge>
              <Badge className="font-mono tabular-nums">{formatBytes(lastResponse.size)}</Badge>
              {lastResponse.isMock && <Badge variant="mauve">MOCK</Badge>}
            </>
          ) : (
            <span className="text-[12px] text-ctp-overlay0/60 select-none">No response yet</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-px shrink-0">
          <Button
            variant="subtle"
            size="xs"
            onClick={handleCopy}
            disabled={!lastResponse}
            aria-label="Copy response"
          >
            <HugeiconsIcon icon={Copy01Icon} size={IC} strokeWidth={1.5} />
          </Button>
          <Button
            variant="subtle"
            size="xs"
            onClick={handleDownload}
            disabled={!lastResponse}
            aria-label="Download response"
          >
            <HugeiconsIcon icon={Download01Icon} size={IC} strokeWidth={1.5} />
          </Button>
          <Button
            variant="subtle"
            size="xs"
            onClick={handleClear}
            disabled={!lastResponse}
            aria-label="Clear response"
          >
            <HugeiconsIcon icon={Delete02Icon} size={IC} strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="shrink-0 px-[var(--space-lg)] pb-[var(--space-md)]">
        <div className="flex items-center gap-px p-1 rounded-[var(--radius-lg)] bg-ctp-mantle/35 border border-ctp-surface0/15">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-center px-[var(--space-md)] py-[var(--space-sm)] text-[12px] font-medium rounded-[var(--radius-sm)] transition-all duration-150 cursor-pointer select-none",
                  isActive
                    ? "text-ctp-text bg-ctp-surface0/55 shadow-sm"
                    : "text-ctp-overlay0 hover:text-ctp-subtext1 hover:bg-ctp-surface0/20",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-[var(--space-lg)] h-px bg-ctp-surface0/18" />

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-[var(--space-lg)] min-h-0">
        {/* Body with Syntax Highlighting */}
        {activeTab === "body" && (
          <div className="h-full">
            {lastResponse?.body ? (
              <div className="h-full bg-ctp-mantle/50 border border-ctp-surface0/20 rounded-[var(--radius-md)] p-[var(--space-lg)] overflow-auto">
                <CodeBlock
                  code={lastResponse.body}
                  language={responseLanguage}
                  showLineNumbers
                />
              </div>
            ) : (
              <EmptyState message="Send a request to see the response body" />
            )}
          </div>
        )}

        {/* Headers */}
        {activeTab === "headers" && (
          <div>
            {headerEntries.length > 0 ? (
              <div className="space-y-px">
                {headerEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start gap-[var(--space-lg)] px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-sm)] hover:bg-ctp-surface0/12 transition-colors duration-100"
                  >
                    <span className="text-[12px] font-mono font-medium text-ctp-lavender/70 shrink-0 min-w-36 select-all">
                      {key}
                    </span>
                    <span className="text-[12px] font-mono text-ctp-subtext0 break-all select-all">
                      {String(value)}
                    </span>
                  </div>
                ))}
                <div className="pt-[var(--space-md)] px-[var(--space-md)]">
                  <span className="text-[10px] text-ctp-overlay0/50 tabular-nums">
                    {headerEntries.length} header
                    {headerEntries.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ) : (
              <EmptyState
                message={
                  lastResponse ? "No headers in response" : "Send a request to see response headers"
                }
              />
            )}
          </div>
        )}

        {/* Cookies */}
        {activeTab === "cookies" && (
          <div>
            {lastResponse?.headers["set-cookie"] ? (
              <div className="bg-ctp-mantle/50 border border-ctp-surface0/20 rounded-[var(--radius-md)] p-[var(--space-lg)] overflow-auto">
                <CodeBlock
                  code={String(lastResponse.headers["set-cookie"])}
                  language="text"
                  showLineNumbers={false}
                />
              </div>
            ) : (
              <EmptyState
                message={lastResponse ? "No cookies in response" : "Send a request to see cookies"}
              />
            )}
          </div>
        )}

        {/* Timeline */}
        {activeTab === "timeline" && (
          <div>
            {lastResponse ? (
              <div className="space-y-[var(--space-xl)]">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-ctp-overlay0 uppercase tracking-widest font-semibold">
                    Total Time
                  </span>
                  <span className="text-[15px] font-mono font-bold text-ctp-text tabular-nums">
                    {lastResponse.time}ms
                  </span>
                </div>

                {/* Phase Breakdown */}
                <div className="space-y-[var(--space-lg)]">
                  {timeline.map((phase) => {
                    const widthPct = Math.min(100, (phase.ms / lastResponse.time) * 100);
                    return (
                      <div key={phase.label} className="space-y-[var(--space-xs)]">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-ctp-subtext0 font-medium">
                            {phase.label}
                          </span>
                          <span className="text-[12px] font-mono text-ctp-overlay1 tabular-nums">
                            {phase.ms.toFixed(1)}ms
                          </span>
                        </div>

                        <div className="h-2 bg-ctp-surface0/20 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700 ease-out opacity-70",
                              phase.color,
                            )}
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-x-[var(--space-lg)] gap-y-[var(--space-sm)] pt-[var(--space-md)] border-t border-ctp-surface0/15">
                  {timeline.map((phase) => (
                    <div key={phase.label} className="flex items-center gap-[var(--space-xs)]">
                      <div className={cn("w-2.5 h-2.5 rounded-full opacity-70", phase.color)} />
                      <span className="text-[11px] text-ctp-overlay0">{phase.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="Send a request to see the timing breakdown" />
            )}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
