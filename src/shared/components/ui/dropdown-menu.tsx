"use client";

import React, { useState, useRef, useEffect, createContext, useContext, useCallback } from "react";
import { cn } from "@/shared/lib/utils";

// Context for dropdown state
interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within DropdownMenu");
  }
  return context;
}

// Simple Dropdown Menu Component (functional API)
interface SimpleDropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function SimpleDropdownMenu({ trigger, children, align = "end", className }: SimpleDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, close }}>
      <div ref={containerRef} className={cn("relative inline-block", className)}>
        <div onClick={toggleMenu} className="cursor-pointer inline-flex">
          {trigger}
        </div>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />
            <div
              className={cn(
                "absolute z-50 min-w-[180px] py-1.5 rounded-xl",
                "bg-ctp-mantle border border-ctp-surface0/30 shadow-2xl",
                "animate-scale-in origin-top",
                align === "end" ? "right-0" : "left-0",
                "top-full mt-1"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </>
        )}
      </div>
    </DropdownContext.Provider>
  );
}

// Item Component
interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DropdownItem({ 
  children, 
  onClick, 
  icon, 
  shortcut, 
  danger, 
  disabled,
  className 
}: DropdownItemProps) {
  const { close } = useDropdown();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    
    if (onClick) {
      onClick();
    }
    close();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-colors outline-none",
        "hover:bg-ctp-surface0/30",
        danger
          ? "text-ctp-red hover:bg-ctp-red/10"
          : "text-ctp-subtext1 hover:text-ctp-text",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
        className
      )}
    >
      {icon && <span className="shrink-0 w-4 flex items-center justify-center">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && <span className="text-[10px] text-ctp-overlay0 ml-2">{shortcut}</span>}
    </button>
  );
}

// Separator Component
export function DropdownSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-ctp-surface0/30 mx-2", className)} />;
}

// Label Component
export function DropdownLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-3 py-1.5 text-[10px] font-semibold text-ctp-overlay0 uppercase tracking-wider", className)}>
      {children}
    </div>
  );
}

// Compound component API for more complex use cases
interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, close }}>
      <div ref={containerRef} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// Trigger for compound API
interface DropdownTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function DropdownTrigger({ children, asChild }: DropdownTriggerProps) {
  const { isOpen, setIsOpen } = useDropdown();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick} className="inline-flex">
      {children}
    </button>
  );
}

// Content for compound API
interface DropdownContentProps {
  children: React.ReactNode;
  align?: "start" | "end";
}

export function DropdownContent({ children, align = "end" }: DropdownContentProps) {
  const { isOpen, close } = useDropdown();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => close()} />
      <div
        className={cn(
          "absolute z-50 min-w-[180px] py-1.5 rounded-xl",
          "bg-ctp-mantle border border-ctp-surface0/30 shadow-2xl",
          "animate-scale-in origin-top",
          align === "end" ? "right-0" : "left-0",
          "top-full mt-1"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
}
