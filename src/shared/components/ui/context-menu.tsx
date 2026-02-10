"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

interface ContextMenuProps {
  children: React.ReactNode;
}

interface ContextMenuState {
  x: number;
  y: number;
  isOpen: boolean;
}

export function ContextMenu({ children }: ContextMenuProps) {
  const [menu, setMenu] = useState<ContextMenuState>({ x: 0, y: 0, isOpen: false });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate position relative to viewport
    let x = e.clientX;
    let y = e.clientY;

    // Ensure menu stays within viewport
    const menuWidth = 200;
    const menuHeight = 300;
    
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    setMenu({ x, y, isOpen: true });
  }, []);

  const closeMenu = useCallback(() => {
    setMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    
    if (menu.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", closeMenu, true);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", closeMenu, true);
    };
  }, [menu.isOpen, closeMenu]);

  return (
    <div ref={triggerRef} onContextMenu={handleContextMenu} className="w-full">
      {children}
      {menu.isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div
            ref={menuRef}
            style={{ left: menu.x, top: menu.y }}
            className="fixed z-50 min-w-[180px] py-1.5 rounded-xl glass-strong border border-ctp-surface0/30 shadow-2xl animate-scale-in"
          >
            {/* Content is provided via render prop pattern */}
          <ContextMenuProvider value={{ closeMenu }}>
              {children}
            </ContextMenuProvider>
          </div>
        </>
      )}
    </div>
  );
}

const ContextMenuContext = React.createContext<{ closeMenu: () => void } | null>(null);

function ContextMenuProvider({ children, value }: { children: React.ReactNode; value: { closeMenu: () => void } }) {
  return (
    <ContextMenuContext.Provider value={value}>
      {children}
    </ContextMenuContext.Provider>
  );
}

function useContextMenu() {
  const context = React.useContext(ContextMenuContext);
  if (!context) throw new Error("useContextMenu must be used within ContextMenu");
  return context;
}

// Standalone context menu that accepts items
interface ContextMenuItemsProps {
  items: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    danger?: boolean;
    disabled?: boolean;
    onClick: () => void;
  } | { type: "separator" }>;
  onClose: () => void;
}

export function ContextMenuItems({ items, onClose }: ContextMenuItemsProps) {
  return (
    <div className="py-1">
      {items.map((item, index) => {
        if ("type" in item && item.type === "separator") {
          return <div key={`sep-${index}`} className="my-1 h-px bg-ctp-surface0/30" />;
        }
        
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (!(item as { disabled?: boolean }).disabled) {
                (item as { onClick: () => void }).onClick();
                onClose();
              }
            }}
            disabled={(item as { disabled?: boolean }).disabled}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-colors",
              (item as { danger?: boolean }).danger
                ? "text-ctp-red hover:bg-ctp-red/10"
                : "text-ctp-subtext1 hover:bg-ctp-surface0/30 hover:text-ctp-text",
              (item as { disabled?: boolean }).disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {(item as { icon?: React.ReactNode }).icon && (
              <span className="shrink-0">{(item as { icon: React.ReactNode }).icon}</span>
            )}
            <span className="flex-1">{(item as { label: string }).label}</span>
            {(item as { shortcut?: string }).shortcut && (
              <span className="text-[10px] text-ctp-overlay0 ml-2">
                {(item as { shortcut: string }).shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

import React from "react";
