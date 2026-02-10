"use client";

import { useCallback, useMemo, useState } from "react";
import { ClockIcon, Delete01Icon, PinIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Input } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";

interface RequestHistoryDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const methodColors: Record<string, string> = {
  GET: "text-ctp-green",
  POST: "text-ctp-blue",
  PUT: "text-ctp-yellow",
  DELETE: "text-ctp-red",
  PATCH: "text-ctp-mauve",
  HEAD: "text-ctp-teal",
  OPTIONS: "text-ctp-sapphire",
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RequestHistoryDropdown({ isOpen, onClose }: RequestHistoryDropdownProps) {
  const store = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return store.history;
    const query = searchQuery.toLowerCase();
    return store.history.filter(
      (item) =>
        item.url.toLowerCase().includes(query) ||
        item.method.toLowerCase().includes(query)
    );
  }, [store.history, searchQuery]);

  const groupedHistory = useMemo(() => {
    const groups: { label: string; items: typeof filteredHistory }[] = [];
    const now = Date.now();
    const today: typeof filteredHistory = [];
    const yesterday: typeof filteredHistory = [];
    const thisWeek: typeof filteredHistory = [];
    const older: typeof filteredHistory = [];

    for (const item of filteredHistory) {
      const age = now - item.timestamp;
      const day = 24 * 60 * 60 * 1000;

      if (age < day) {
        today.push(item);
      } else if (age < 2 * day) {
        yesterday.push(item);
      } else if (age < 7 * day) {
        thisWeek.push(item);
      } else {
        older.push(item);
      }
    }

    if (today.length) groups.push({ label: "Today", items: today });
    if (yesterday.length) groups.push({ label: "Yesterday", items: yesterday });
    if (thisWeek.length) groups.push({ label: "This Week", items: thisWeek });
    if (older.length) groups.push({ label: "Older", items: older });

    return groups;
  }, [filteredHistory]);

  const handleSelect = useCallback(
    (item: (typeof store.history)[0]) => {
      store.setMethod(item.method);
      store.setUrl(item.url);
      onClose();
    },
    [store, onClose]
  );

  const handleClear = useCallback(() => {
    store.clearHistory();
  }, [store]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className="absolute top-full left-0 right-0 mt-2 z-50">
        <div className="glass-strong rounded-[var(--radius-xl)] border border-ctp-surface0/30 shadow-2xl overflow-hidden max-h-[400px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ctp-surface0/20">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={ClockIcon}
                size={16}
                strokeWidth={1.5}
                className="text-ctp-lavender"
              />
              <span className="text-[13px] font-medium text-ctp-text">
                Request History
              </span>
            </div>
            {store.history.length > 0 && (
              <button
                onClick={handleClear}
                className="text-[11px] text-ctp-overlay0 hover:text-ctp-red transition-colors flex items-center gap-1"
              >
                <HugeiconsIcon icon={Delete01Icon} size={12} strokeWidth={1.5} />
                Clear
              </button>
            )}
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-ctp-surface0/20">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ctp-overlay0"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-9 text-[12px]"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {groupedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-ctp-surface0/30 flex items-center justify-center mb-3">
                  <HugeiconsIcon
                    icon={ClockIcon}
                    size={18}
                    strokeWidth={1.5}
                    className="text-ctp-overlay0"
                  />
                </div>
                <p className="text-[12px] text-ctp-overlay0">
                  {searchQuery ? "No matching requests found" : "No request history yet"}
                </p>
              </div>
            ) : (
              <div className="py-2">
                {groupedHistory.map((group) => (
                  <div key={group.label}>
                    <div className="px-4 py-1.5 text-[10px] font-medium text-ctp-overlay0/60 uppercase tracking-wider">
                      {group.label}
                    </div>
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150",
                          hoveredId === item.id
                            ? "bg-ctp-surface0/30"
                            : "hover:bg-ctp-surface0/20"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[11px] font-bold font-mono w-14 shrink-0",
                            methodColors[item.method] || "text-ctp-overlay0"
                          )}
                        >
                          {item.method}
                        </span>
                        <span className="flex-1 text-[12px] text-ctp-subtext1 truncate font-mono">
                          {item.url}
                        </span>
                        <span className="text-[10px] text-ctp-overlay0/50 shrink-0">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-ctp-surface0/20 bg-ctp-mantle/20">
            <p className="text-[10px] text-ctp-overlay0/50 text-center">
              {store.history.length} request{store.history.length !== 1 ? "s" : ""} in history
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
