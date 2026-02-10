"use client";

import {
  CommandIcon,
  LeftToRightListBulletIcon,
  Settings01Icon,
  Shield01Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Kbd, SettingsModal, StatusDot, UserMenu } from "@/shared/components/ui";
import { WorkspaceSwitcher } from "@/shared/components/ui/workspace-switcher";
import { cn } from "@/shared/lib/utils";
import { useWorkspaceContext } from "@/shared/providers/workspace-provider";
import { useAppStore } from "@/shared/stores/app-store";
import { TabManager } from "./tab-manager";

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

export function Header({ onOpenCommandPalette }: HeaderProps) {
  const {
    sidebarOpen,
    toggleSidebar,
    compactMode,
    setCompactMode,
    interceptorEnabled,
    setInterceptorEnabled,
    interceptorMode,
    setInterceptorMode,
    activeEnv,
    envs,
    setActiveEnv,
  } = useAppStore();

  const { activeWorkspace } = useWorkspaceContext();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"profile" | "workspaces" | "members" | "invites" | "appearance" | "shortcuts">("workspaces");

  // Keyboard shortcut for settings (Cmd/Ctrl + ,)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setSettingsOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleToggleInterceptor = useCallback(() => {
    setInterceptorEnabled(!interceptorEnabled);
  }, [interceptorEnabled, setInterceptorEnabled]);

  const openSettings = useCallback((tab?: typeof settingsTab) => {
    if (tab) setSettingsTab(tab);
    setSettingsOpen(true);
  }, []);

  // Get available environments
  const availableEnvs = Object.keys(envs.scoped);

  return (
    <>
      {/* Floating Dock Header */}
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-40 px-3 transition-all duration-200",
          compactMode ? "pt-1.5" : "pt-2"
        )}
      >
        <div className="max-w-[1800px] mx-auto">
          <div 
            className={cn(
              "flex items-center justify-between bg-gradient-to-b from-ctp-mantle/95 to-ctp-crust/95 backdrop-blur-xl backdrop-saturate-150 border border-ctp-surface0/20 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-200",
              compactMode 
                ? "h-[var(--header-h)] px-2 pl-3 rounded-xl" 
                : "h-[var(--header-h)] px-3 pl-4 rounded-2xl"
            )}
          >
            {/* Left: Sidebar toggle + Workspace + Tab Manager */}
            <div className={cn(
              "flex items-center",
              compactMode ? "gap-1.5" : "gap-3"
            )}>
              <button
                type="button"
                onClick={toggleSidebar}
                className={cn(
                  "flex items-center justify-center rounded-lg transition-all duration-200",
                  "text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0/30",
                  "active:scale-95",
                  compactMode ? "w-7 h-7" : "w-8 h-8"
                )}
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <HugeiconsIcon
                  icon={sidebarOpen ? SidebarLeft01Icon : SidebarRight01Icon}
                  size={compactMode ? 14 : 16}
                  strokeWidth={1.5}
                />
              </button>

              <div className="w-px h-4 bg-ctp-surface0/30" />

              {/* Workspace switcher */}
              <WorkspaceSwitcher 
                variant="header" 
                onOpenSettings={() => openSettings("workspaces")} 
              />

              {/* Divider */}
              <div className="w-px h-4 bg-ctp-surface0/30 hidden sm:block" />

              {/* Tab Manager - Recent Activity */}
              <div className="hidden md:block">
                <TabManager />
              </div>
            </div>

            {/* Center: Environment Selector */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-ctp-surface0/10 border border-ctp-surface0/20">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  activeEnv === "production" ? "bg-ctp-red animate-pulse" : 
                  activeEnv === "staging" ? "bg-ctp-yellow" : "bg-ctp-green"
                )} />
                <select
                  value={activeEnv}
                  onChange={(e) => setActiveEnv(e.target.value)}
                  className="bg-transparent text-[11px] font-medium text-ctp-subtext1 outline-none cursor-pointer"
                >
                  {availableEnvs.map((env) => (
                    <option key={env} value={env} className="bg-ctp-base text-ctp-text">
                      {env.charAt(0).toUpperCase() + env.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: Actions */}
            <div className={cn(
              "flex items-center",
              compactMode ? "gap-0.5" : "gap-1"
            )}>
              {/* Command Palette */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onOpenCommandPalette}
                className={cn(
                  compactMode ? "gap-1 px-2 h-7" : "gap-2 px-2.5 h-8"
                )}
              >
                <HugeiconsIcon icon={CommandIcon} size={compactMode ? 13 : 14} strokeWidth={1.5} />
                {!compactMode && <Kbd className="text-[10px]">⌘K</Kbd>}
              </Button>

              {/* Interceptor Toggle */}
              <button
                type="button"
                onClick={handleToggleInterceptor}
                className={cn(
                  "flex items-center rounded-lg font-medium transition-all duration-200",
                  compactMode 
                    ? "gap-1.5 px-2 py-1 text-[11px]" 
                    : "gap-2 px-2.5 py-1.5 text-[11px]",
                  interceptorEnabled
                    ? "bg-ctp-red/10 text-ctp-red border border-ctp-red/20"
                    : "text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/20"
                )}
              >
                <HugeiconsIcon icon={Shield01Icon} size={compactMode ? 12 : 13} strokeWidth={1.5} />
                {!compactMode && (
                  <span className="hidden sm:inline">{interceptorEnabled ? "On" : "Off"}</span>
                )}
                <StatusDot 
                  color={interceptorEnabled ? "red" : "muted"} 
                  pulse={interceptorEnabled} 
                  size={compactMode ? "sm" : "md"}
                />
              </button>

              {interceptorEnabled && !compactMode && (
                <select
                  value={interceptorMode}
                  onChange={(e) => setInterceptorMode(e.target.value as "request" | "response" | "both")}
                  className="h-7 px-2 text-[10px] font-medium rounded-lg border border-ctp-surface0/40 bg-ctp-mantle/50 text-ctp-subtext0 outline-none cursor-pointer"
                >
                  <option value="request" className="bg-ctp-base">Req</option>
                  <option value="response" className="bg-ctp-base">Res</option>
                  <option value="both" className="bg-ctp-base">Both</option>
                </select>
              )}

              <div className="w-px h-4 bg-ctp-surface0/30 mx-0.5" />

              {/* Compact Mode Toggle */}
              <button
                type="button"
                onClick={() => setCompactMode(!compactMode)}
                className={cn(
                  "flex items-center justify-center rounded-lg transition-all duration-200",
                  compactMode
                    ? "bg-ctp-lavender/20 text-ctp-lavender"
                    : "text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/30",
                  "active:scale-95",
                  compactMode ? "w-7 h-7" : "w-8 h-8"
                )}
                aria-label={compactMode ? "Disable compact mode" : "Enable compact mode"}
                title={compactMode ? "Compact mode on" : "Compact mode off"}
              >
                <HugeiconsIcon icon={LeftToRightListBulletIcon} size={compactMode ? 14 : 15} strokeWidth={1.5} />
              </button>

              {/* Settings button */}
              <button
                type="button"
                onClick={() => openSettings()}
                className={cn(
                  "flex items-center justify-center rounded-lg transition-all duration-200",
                  "text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/30",
                  "active:scale-95",
                  compactMode ? "w-7 h-7" : "w-8 h-8"
                )}
                aria-label="Open settings"
                title="Settings (⌘,)"
              >
                <HugeiconsIcon icon={Settings01Icon} size={compactMode ? 14 : 15} strokeWidth={1.5} />
              </button>

              {/* User Menu */}
              <UserMenu onOpenSettings={() => openSettings("profile")} />
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        initialTab={settingsTab} 
      />
    </>
  );
}
