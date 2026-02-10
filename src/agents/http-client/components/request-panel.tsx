"use client";

import { useState } from "react";
import { GlassPanel, LabelText, Textarea } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import type { RequestTab } from "../types";
import { AuthTabs } from "./auth-tabs";
import { KeyValueEditor } from "./key-value-editor";

const tabs: { id: RequestTab; label: string }[] = [
  { id: "params", label: "Params" },
  { id: "headers", label: "Headers" },
  { id: "body", label: "Body" },
  { id: "auth", label: "Auth" },
  { id: "tests", label: "Scripts" },
];

export function RequestPanel() {
  const [activeTab, setActiveTab] = useState<RequestTab>("params");
  const store = useAppStore();

  return (
    <GlassPanel noPadding className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Tab Bar */}
      <div className="shrink-0 px-[var(--space-lg)] pt-[var(--space-lg)] pb-[var(--space-md)]">
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
        {/* Query Parameters - New Key-Value Editor */}
        {activeTab === "params" && (
          <div className="space-y-[var(--space-md)]">
            <div className="flex items-center justify-between">
              <LabelText>Query Parameters</LabelText>
              <span className="text-[10px] text-ctp-overlay0/60 font-mono">
                {store.params.filter(p => p.enabled && p.key).length} active
              </span>
            </div>
            <KeyValueEditor
              items={store.params}
              onChange={store.setParams}
              keyPlaceholder="page"
              valuePlaceholder="1"
              showEnabledToggle
            />
          </div>
        )}

        {/* Headers - New Key-Value Editor */}
        {activeTab === "headers" && (
          <div className="space-y-[var(--space-md)]">
            <div className="flex items-center justify-between">
              <LabelText>Request Headers</LabelText>
              <span className="text-[10px] text-ctp-overlay0/60 font-mono">
                {store.headers.filter(h => h.enabled && h.key).length} active
              </span>
            </div>
            <KeyValueEditor
              items={store.headers}
              onChange={store.setHeaders}
              keyPlaceholder="Content-Type"
              valuePlaceholder="application/json"
              showEnabledToggle
            />
          </div>
        )}

        {/* Body */}
        {activeTab === "body" && (
          <div className="space-y-[var(--space-md)]">
            <div className="flex items-center justify-between">
              <LabelText>Request Body</LabelText>
              <span className="text-[10px] text-ctp-overlay0/60 font-mono">JSON / Text</span>
            </div>
            <Textarea
              value={store.bodyText}
              onChange={(e) => store.setBodyText(e.target.value)}
              placeholder={'{\n  "name": "Example",\n  "version": 1,\n  "active": true\n}'}
              className="min-h-55 font-mono"
              spellCheck={false}
            />
          </div>
        )}

        {/* Auth - New AuthTabs Component */}
        {activeTab === "auth" && (
          <AuthTabs />
        )}

        {/* Scripts / Tests */}
        {activeTab === "tests" && (
          <div className="space-y-[var(--space-xl)]">
            <div className="space-y-[var(--space-md)]">
              <div className="flex items-center justify-between">
                <LabelText>Pre-request Script</LabelText>
                <span className="text-[10px] text-ctp-overlay0/60 font-mono">JavaScript</span>
              </div>
              <Textarea
                value={store.preRequestScript}
                onChange={(e) => store.setPreRequestScript(e.target.value)}
                placeholder="// Runs before the request is sent&#10;pm.environment.set('token', 'abc123');"
                className="min-h-25 font-mono"
                spellCheck={false}
              />
            </div>

            <div className="space-y-[var(--space-md)]">
              <div className="flex items-center justify-between">
                <LabelText>Test Script</LabelText>
                <span className="text-[10px] text-ctp-overlay0/60 font-mono">JavaScript</span>
              </div>
              <Textarea
                value={store.testScript}
                onChange={(e) => store.setTestScript(e.target.value)}
                placeholder={
                  "// Runs after the response is received\npm.test('status is 200', () => {\n  pm.response.to.have.status(200);\n});"
                }
                className="min-h-25 font-mono"
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
