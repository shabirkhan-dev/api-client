"use client";

import { useCallback } from "react";
import { AddIcon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Checkbox, Input } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import type { KeyValuePair } from "../types";

interface KeyValueEditorProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  showEnabledToggle?: boolean;
}

export function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  showEnabledToggle = true,
}: KeyValueEditorProps) {
  const addItem = useCallback(() => {
    onChange([
      ...items,
      { id: crypto.randomUUID(), key: "", value: "", enabled: true },
    ]);
  }, [items, onChange]);

  const removeItem = useCallback((id: string) => {
    onChange(items.filter((item) => item.id !== id));
  }, [items, onChange]);

  const updateItem = useCallback((id: string, updates: Partial<KeyValuePair>) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, [items, onChange]);

  return (
    <div className="space-y-[var(--space-sm)]">
      {/* Header Row */}
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-[var(--space-sm)] px-[var(--space-sm)]">
        {showEnabledToggle && (
          <span className="text-[10px] text-ctp-overlay0/60 font-medium uppercase tracking-wider w-6"></span>
        )}
        <span className="text-[10px] text-ctp-overlay0/60 font-medium uppercase tracking-wider">
          Key
        </span>
        <span className="text-[10px] text-ctp-overlay0/60 font-medium uppercase tracking-wider">
          Value
        </span>
        <span className="w-8"></span>
      </div>

      {/* Items */}
      <div className="space-y-[var(--space-xs)]">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "grid grid-cols-[auto_1fr_1fr_auto] gap-[var(--space-sm)] items-center p-[var(--space-sm)] rounded-[var(--radius-md)] transition-all duration-150",
              item.enabled
                ? "bg-ctp-mantle/30 border border-ctp-surface0/10"
                : "bg-ctp-mantle/20 border border-ctp-surface0/5 opacity-50"
            )}
          >
            {showEnabledToggle && (
              <Checkbox
                checked={item.enabled}
                onChange={(checked) => updateItem(item.id, { enabled: checked })}
                className="w-6"
              />
            )}
            <Input
              value={item.key}
              onChange={(e) => updateItem(item.id, { key: e.target.value })}
              placeholder={keyPlaceholder}
              className={cn(
                "w-full font-mono text-[12px]",
                !item.enabled && "opacity-50"
              )}
              spellCheck={false}
            />
            <Input
              value={item.value}
              onChange={(e) => updateItem(item.id, { value: e.target.value })}
              placeholder={valuePlaceholder}
              className={cn(
                "w-full font-mono text-[12px]",
                !item.enabled && "opacity-50"
              )}
              spellCheck={false}
            />
            <Button
              variant="subtle"
              size="xs"
              onClick={() => removeItem(item.id)}
              aria-label="Remove"
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            >
              <HugeiconsIcon icon={Delete01Icon} size={14} strokeWidth={1.5} />
            </Button>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={addItem}
        className="w-full mt-[var(--space-sm)] border-dashed border-ctp-surface0/30 hover:border-ctp-lavender/30"
      >
        <HugeiconsIcon icon={AddIcon} size={14} strokeWidth={1.5} />
        <span className="ml-1.5">Add</span>
      </Button>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-[11px] text-ctp-overlay0/50">
            No items yet. Click Add to create one.
          </p>
        </div>
      )}
    </div>
  );
}
