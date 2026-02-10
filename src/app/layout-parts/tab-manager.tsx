"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  ClockIcon,
  Delete01Icon,
  MoreHorizontalIcon,
  PinIcon,
  Search01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";

interface TabItem {
  id: string;
  type: "request" | "collection" | "workspace";
  title: string;
  subtitle?: string;
  method?: string;
  icon?: string;
  timestamp: number;
  pinned?: boolean;
}

const methodColors: Record<string, string> = {
  GET: "bg-ctp-green/20 text-ctp-green border-ctp-green/30",
  POST: "bg-ctp-blue/20 text-ctp-blue border-ctp-blue/30",
  PUT: "bg-ctp-yellow/20 text-ctp-yellow border-ctp-yellow/30",
  DELETE: "bg-ctp-red/20 text-ctp-red border-ctp-red/30",
  PATCH: "bg-ctp-mauve/20 text-ctp-mauve border-ctp-mauve/30",
};

export function TabManager() {
  const store = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Build tabs from history and active request
  const tabs = useMemo<TabItem[]>(() => {
    const items: TabItem[] = [];
    
    // Add active request if any
    if (store.activeRequestItemId && store.activeRequestName) {
      items.push({
        id: `req-${store.activeRequestItemId}`,
        type: "request",
        title: store.activeRequestName,
        subtitle: store.url,
        method: store.method,
        timestamp: Date.now(),
        pinned: true,
      });
    }
    
    // Add history items
    store.history.slice(0, 10).forEach((h, i) => {
      items.push({
        id: h.id,
        type: "request",
        title: h.url.split("/").pop() || h.url,
        subtitle: h.url,
        method: h.method,
        timestamp: h.timestamp,
      });
    });
    
    return items;
  }, [store.activeRequestItemId, store.activeRequestName, store.url, store.method, store.history]);

  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return tabs;
    const query = searchQuery.toLowerCase();
    return tabs.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.subtitle?.toLowerCase().includes(query) ||
        t.method?.toLowerCase().includes(query)
    );
  }, [tabs, searchQuery]);

  const pinnedTabs = useMemo(() => filteredTabs.filter((t) => t.pinned), [filteredTabs]);
  const recentTabs = useMemo(() => filteredTabs.filter((t) => !t.pinned), [filteredTabs]);

  const handleSelect = useCallback((tab: TabItem) => {
    if (tab.type === "request" && tab.method) {
      store.setMethod(tab.method as any);
      store.setUrl(tab.subtitle || "");
    }
    setActiveTabId(tab.id);
    setIsOpen(false);
  }, [store]);

  const handleClose = useCallback((e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    // Remove from history if it's a history item
    if (tabId.startsWith("hist-")) {
      // Would need to add removeHistoryItem to store
    }
  }, []);

  const formatTime = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tab Bar - Shows pinned and recent */}
      <div className="flex items-center gap-1">
        {/* Recent Tabs Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200",
            isOpen
              ? "bg-ctp-lavender/20 text-ctp-lavender"
              : "bg-ctp-surface0/20 text-ctp-subtext0 hover:bg-ctp-surface0/30 hover:text-ctp-text"
          )}
        >
          <HugeiconsIcon icon={ClockIcon} size={14} strokeWidth={1.5} />
          <span className="text-[12px] font-medium">Recent</span>
          {tabs.length > 0 && (
            <span className="text-[10px] bg-ctp-surface0/40 px-1.5 py-px rounded-full">
              {tabs.length}
            </span>
          )}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={12}
            className={cn("transition-transform duration-200", isOpen && "rotate-180")}
          />
        </button>

        {/* Quick Access Pinned Tabs */}
        {pinnedTabs.slice(0, 3).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleSelect(tab)}
            className={cn(
              "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-200 max-w-[160px]",
              activeTabId === tab.id
                ? "bg-ctp-lavender/15 text-ctp-lavender border border-ctp-lavender/20"
                : "bg-ctp-surface0/10 text-ctp-subtext1 hover:bg-ctp-surface0/20 hover:text-ctp-text border border-transparent"
            )}
          >
            {tab.method && (
              <span
                className={cn(
                  "text-[9px] font-bold px-1 py-px rounded border",
                  methodColors[tab.method] || "bg-ctp-overlay0/20 text-ctp-overlay0 border-ctp-overlay0/30"
                )}
              >
                {tab.method}
              </span>
            )}
            <span className="text-[11px] font-medium truncate">{tab.title}</span>
            <HugeiconsIcon icon={PinIcon} size={10} className="text-ctp-yellow shrink-0" />
          </button>
        ))}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown Panel */}
          <div className="absolute top-full left-0 mt-2 w-[380px] z-50">
            <div className="glass-strong rounded-xl border border-ctp-surface0/30 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-ctp-surface0/20">
                <span className="text-[12px] font-semibold text-ctp-text">Recent Activity</span>
                <button
                  onClick={() => store.clearHistory()}
                  className="text-[10px] text-ctp-overlay0 hover:text-ctp-red transition-colors flex items-center gap-1"
                >
                  <HugeiconsIcon icon={Delete01Icon} size={10} strokeWidth={1.5} />
                  Clear
                </button>
              </div>

              {/* Search */}
              <div className="px-3 py-2 border-b border-ctp-surface0/20">
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={12}
                    strokeWidth={1.5}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ctp-overlay0"
                  />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search recent..."
                    className="w-full pl-8 text-[11px] h-8"
                  />
                </div>
              </div>

              {/* Tabs List */}
              <div className="max-h-[320px] overflow-y-auto">
                {filteredTabs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-ctp-surface0/30 flex items-center justify-center mb-2">
                      <HugeiconsIcon
                        icon={ClockIcon}
                        size={18}
                        strokeWidth={1.5}
                        className="text-ctp-overlay0"
                      />
                    </div>
                    <p className="text-[11px] text-ctp-overlay0">
                      {searchQuery ? "No matches found" : "No recent activity"}
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    {/* Pinned Section */}
                    {pinnedTabs.length > 0 && (
                      <>
                        <div className="px-3 py-1 text-[9px] font-semibold text-ctp-overlay0/60 uppercase tracking-wider">
                          Pinned
                        </div>
                        {pinnedTabs.map((tab) => (
                          <TabItemRow
                            key={tab.id}
                            tab={tab}
                            isActive={activeTabId === tab.id}
                            onSelect={() => handleSelect(tab)}
                            onClose={(e) => handleClose(e, tab.id)}
                            formatTime={formatTime}
                          />
                        ))}
                      </>
                    )}

                    {/* Recent Section */}
                    {recentTabs.length > 0 && (
                      <>
                        <div className="px-3 py-1 text-[9px] font-semibold text-ctp-overlay0/60 uppercase tracking-wider">
                          Recent
                        </div>
                        {recentTabs.map((tab) => (
                          <TabItemRow
                            key={tab.id}
                            tab={tab}
                            isActive={activeTabId === tab.id}
                            onSelect={() => handleSelect(tab)}
                            onClose={(e) => handleClose(e, tab.id)}
                            formatTime={formatTime}
                          />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-3 py-2 border-t border-ctp-surface0/20 bg-ctp-mantle/30">
                <div className="flex items-center justify-between text-[10px] text-ctp-overlay0/60">
                  <span>{tabs.length} items</span>
                  <span className="flex items-center gap-1">
                    <Kbd className="text-[9px]">⌘</Kbd>
                    <Kbd className="text-[9px]">T</Kbd>
                    <span>for new</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Tab Item Row Component
interface TabItemRowProps {
  tab: TabItem;
  isActive: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent) => void;
  formatTime: (timestamp: number) => string;
}

import { Kbd } from "@/shared/components/ui";

function TabItemRow({ tab, isActive, onSelect, onClose, formatTime }: TabItemRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-150 group",
        isActive ? "bg-ctp-lavender/10" : "hover:bg-ctp-surface0/20"
      )}
    >
      {/* Method Badge */}
      {tab.method ? (
        <span
          className={cn(
            "text-[9px] font-bold px-1.5 py-px rounded border shrink-0",
            methodColors[tab.method] || "bg-ctp-overlay0/20 text-ctp-overlay0 border-ctp-overlay0/30"
          )}
        >
          {tab.method}
        </span>
      ) : (
        <div className="w-8 h-5 rounded bg-ctp-surface0/30 shrink-0" />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium text-ctp-text truncate">{tab.title}</span>
          {tab.pinned && (
            <HugeiconsIcon icon={PinIcon} size={10} className="text-ctp-yellow shrink-0" />
          )}
        </div>
        <span className="text-[10px] text-ctp-overlay0 truncate block">{tab.subtitle}</span>
      </div>

      {/* Time */}
      <span className="text-[10px] text-ctp-overlay0/50 shrink-0">{formatTime(tab.timestamp)}</span>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-ctp-surface0/30 text-ctp-overlay0 hover:text-ctp-red transition-all"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={1.5} />
      </button>
    </button>
  );
}
