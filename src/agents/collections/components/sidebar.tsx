"use client";

import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Folder01Icon,
  Layers01Icon,
  Search01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { Button, PromptDialog } from "@/shared/components/ui";
import type { CollectionTreeNode } from "@/shared/hooks/use-collections";
import { cn } from "@/shared/lib/utils";
import { useWorkspaceContext } from "@/shared/providers/workspace-provider";
import { useAppStore } from "@/shared/stores/app-store";
import { CollectionTree } from "./collection-tree";

/** Recursively filter a tree, keeping nodes whose name matches the query */
function filterTree(nodes: CollectionTreeNode[], query: string): CollectionTreeNode[] {
  const lower = query.toLowerCase();
  return nodes
    .map((node) => {
      const nameMatch = node.name.toLowerCase().includes(lower);
      const methodMatch = node.method?.toLowerCase().includes(lower) ?? false;
      const filteredChildren = node.children ? filterTree(node.children, query) : undefined;
      const hasMatchingChildren = filteredChildren && filteredChildren.length > 0;

      if (nameMatch || methodMatch || hasMatchingChildren) {
        return {
          ...node,
          collapsed: false,
          children: hasMatchingChildren ? filteredChildren : node.children,
        };
      }
      return null;
    })
    .filter((n): n is CollectionTreeNode => n !== null);
}

interface SidebarSectionProps {
  title: string;
  icon: typeof Folder01Icon;
  defaultOpen?: boolean;
  count?: number;
  busy?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
  compactMode?: boolean;
}

function SidebarSection({
  title,
  icon,
  defaultOpen = true,
  count,
  busy,
  action,
  children,
  compactMode = false,
}: SidebarSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={compactMode ? "mb-0.5" : "mb-1"}>
      {/* Section Header */}
      <div 
        className={cn(
          "flex items-center justify-between transition-all duration-200 cursor-pointer select-none group rounded-lg",
          "hover:bg-ctp-surface0/30",
          compactMode 
            ? "px-2 py-1" 
            : "px-2.5 py-1.5"
        )}
        onClick={() => setOpen(!open)}
      >
        <div className={cn(
          "flex items-center min-w-0",
          compactMode ? "gap-1.5" : "gap-2"
        )}>
          <HugeiconsIcon
            icon={open ? ArrowDown01Icon : ArrowRight01Icon}
            size={compactMode ? 9 : 10}
            className="text-ctp-overlay0 shrink-0 transition-transform duration-200"
          />
          <HugeiconsIcon
            icon={icon}
            size={compactMode ? 11 : 12}
            strokeWidth={1.5}
            className="text-ctp-yellow shrink-0"
          />
          <span className={cn(
            "font-medium text-ctp-subtext1 truncate",
            compactMode ? "text-[11px]" : "text-[12px]"
          )}>
            {title}
          </span>
          {typeof count === "number" && count > 0 && (
            <span className={cn(
              "font-medium bg-ctp-surface0/40 text-ctp-overlay0 tabular-nums",
              compactMode 
                ? "text-[9px] px-1 py-px rounded" 
                : "text-[10px] px-1.5 py-px rounded"
            )}>
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {busy && (
            <span className={cn(
              "inline-block border-2 border-ctp-lavender/30 border-t-ctp-lavender rounded-full animate-spin",
              compactMode ? "w-3 h-3" : "w-3.5 h-3.5"
            )} />
          )}
          {action}
        </div>
      </div>

      {/* Section Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open 
            ? (compactMode ? "max-h-[600px] opacity-100 mt-0.5" : "max-h-[600px] opacity-100 mt-0.5") 
            : "max-h-0 opacity-0"
        )}
      >
        <div className={compactMode ? "px-1 py-0.5" : "px-1.5 py-1"}>{children}</div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, interceptorEnabled, interceptorStats, compactMode } = useAppStore();

  const { collections, collectionsLoading, collectionsBusy, collectionsCount, addCollection } =
    useWorkspaceContext();

  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCollections = useMemo(
    () => (searchQuery.trim() ? filterTree(collections, searchQuery.trim()) : collections),
    [collections, searchQuery],
  );

  return (
    <>
      <aside
        className={cn(
          "flex flex-col overflow-hidden transition-all duration-300 ease-out shrink-0 border-r border-ctp-surface0/10",
          sidebarOpen ? "w-[var(--sidebar-w)] opacity-100" : "w-0 opacity-0 pointer-events-none"
        )}
      >
        {sidebarOpen && (
          <div className="flex flex-col h-full animate-slide-in-left">
            {/* Sidebar Header - Compact */}
            <div className={cn(
              "flex items-center justify-between",
              compactMode ? "px-2.5 pt-2 pb-1" : "px-3 pt-3 pb-2"
            )}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center justify-center rounded-lg bg-ctp-lavender/10",
                  compactMode ? "w-6 h-6" : "w-7 h-7"
                )}>
                  <HugeiconsIcon
                    icon={Layers01Icon}
                    size={compactMode ? 13 : 14}
                    className="text-ctp-lavender"
                  />
                </div>
                <span className={cn(
                  "font-semibold text-ctp-text",
                  compactMode ? "text-[12px]" : "text-[13px]"
                )}>
                  Collections
                </span>
              </div>
            </div>

            {/* Search - Compact */}
            <div className={cn(
              compactMode ? "px-2 pb-1.5" : "px-3 pb-2"
            )}>
              <div className={cn(
                "flex items-center bg-ctp-surface0/10 border border-ctp-surface0/15 focus-within:border-ctp-lavender/30 focus-within:bg-ctp-surface0/20 transition-all duration-200",
                compactMode ? "h-7 gap-1.5 rounded-lg px-2" : "h-8 gap-2 rounded-lg px-2.5"
              )}>
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={compactMode ? 11 : 12}
                  className="text-ctp-overlay0/60 shrink-0"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  spellCheck={false}
                  className={cn(
                    "flex-1 bg-transparent text-ctp-text placeholder:text-ctp-overlay0/40 outline-none min-w-0",
                    compactMode ? "text-[11px]" : "text-[12px]"
                  )}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className={cn(
                      "text-ctp-overlay0 hover:text-ctp-text transition-colors shrink-0 hover:bg-ctp-surface0/30 rounded",
                      compactMode ? "p-0.5" : "p-0.5"
                    )}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={compactMode ? 9 : 10} />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className={cn(
              "flex-1 overflow-y-auto min-h-0",
              compactMode ? "px-1.5 pb-2" : "px-2 pb-2"
            )}>
              {/* Collections */}
              <SidebarSection
                title="All Collections"
                icon={Folder01Icon}
                defaultOpen
                count={collectionsCount}
                busy={collectionsBusy}
                compactMode={compactMode}
                action={
                  <Button 
                    variant="subtle" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreateCollectionOpen(true);
                    }}
                    className={compactMode ? "h-5 px-1.5 text-[10px]" : "h-6 px-2 text-[10px]"}
                  >
                    <HugeiconsIcon icon={Add01Icon} size={compactMode ? 10 : 11} />
                  </Button>
                }
              >
                {collectionsLoading ? (
                  <div className={cn(
                    "flex items-center justify-center",
                    compactMode ? "py-4" : "py-6"
                  )}>
                    <div className={cn(
                      "border-2 border-ctp-lavender/30 border-t-ctp-lavender rounded-full animate-spin",
                      compactMode ? "w-4 h-4" : "w-5 h-5"
                    )} />
                  </div>
                ) : (
                  <div className={cn(
                    "overflow-y-auto",
                    compactMode ? "max-h-[50vh] pr-0.5" : "max-h-[55vh] pr-0.5"
                  )}>
                    <CollectionTree collections={filteredCollections} />
                  </div>
                )}
              </SidebarSection>

              {/* Interceptor Stats - Only when enabled */}
              {interceptorEnabled && (
                <SidebarSection 
                  title="Interceptor" 
                  icon={Settings02Icon} 
                  defaultOpen={false}
                  compactMode={compactMode}
                >
                  <div className={cn(
                    "grid grid-cols-3 gap-1 bg-ctp-surface0/10 rounded-lg",
                    compactMode ? "p-1.5" : "p-2"
                  )}>
                    {(
                      [
                        { label: "In", value: interceptorStats.intercepted, color: "text-ctp-blue" },
                        { label: "Mod", value: interceptorStats.modified, color: "text-ctp-yellow" },
                        { label: "Block", value: interceptorStats.blocked, color: "text-ctp-red" },
                      ] as const
                    ).map((s) => (
                      <div
                        key={s.label}
                        className={cn(
                          "flex flex-col items-center justify-center rounded bg-ctp-surface0/20",
                          compactMode ? "py-1 px-0.5" : "py-1.5 px-1"
                        )}
                      >
                        <div className={cn(
                          "font-bold tabular-nums",
                          s.color,
                          compactMode ? "text-[11px]" : "text-[13px]"
                        )}>
                          {s.value}
                        </div>
                        <div className={cn(
                          "text-ctp-overlay0 uppercase tracking-wider font-medium",
                          compactMode ? "text-[8px]" : "text-[9px]"
                        )}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </SidebarSection>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Create collection prompt */}
      <PromptDialog
        open={createCollectionOpen}
        onClose={() => setCreateCollectionOpen(false)}
        onConfirm={async (name) => {
          await addCollection(name);
        }}
        title="New collection"
        placeholder="Collection name"
        confirmLabel="Create"
      />
    </>
  );
}
