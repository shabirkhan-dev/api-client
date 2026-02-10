"use client";

import { useState } from "react";
import { Input, LabelText } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import type { AuthType } from "../types";

const authTabs: { id: AuthType; label: string; description: string }[] = [
  { id: "none", label: "No Auth", description: "No authentication required" },
  { id: "bearer", label: "Bearer Token", description: "Bearer token authentication" },
  { id: "basic", label: "Basic Auth", description: "Username and password" },
  { id: "apikey", label: "API Key", description: "API key in header or query" },
];

export function AuthTabs() {
  const store = useAppStore();
  const [activeTab, setActiveTab] = useState<AuthType>(store.authType);

  const handleTabChange = (tab: AuthType) => {
    setActiveTab(tab);
    store.setAuthType(tab);
  };

  return (
    <div className="space-y-[var(--space-lg)]">
      {/* Auth Type Selector */}
      <div className="space-y-[var(--space-sm)]">
        <LabelText>Type</LabelText>
        <div className="grid grid-cols-2 gap-2">
          {authTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-col items-start p-3 rounded-[var(--radius-md)] border text-left transition-all duration-200",
                activeTab === tab.id
                  ? "bg-ctp-surface0/40 border-ctp-lavender/40 shadow-sm"
                  : "bg-ctp-mantle/30 border-ctp-surface0/20 hover:bg-ctp-surface0/20 hover:border-ctp-surface0/30"
              )}
            >
              <span className={cn(
                "text-[12px] font-medium",
                activeTab === tab.id ? "text-ctp-lavender" : "text-ctp-text"
              )}>
                {tab.label}
              </span>
              <span className="text-[10px] text-ctp-overlay0 mt-0.5">
                {tab.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Auth Configuration */}
      <div className="space-y-[var(--space-md)]">
        {activeTab === "none" && (
          <div className="flex items-center justify-center py-8 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-ctp-surface0/30 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ctp-overlay0">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12L12 16L16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[12px] text-ctp-overlay0">
                No authentication will be sent with the request
              </p>
            </div>
          </div>
        )}

        {activeTab === "bearer" && (
          <div className="space-y-[var(--space-sm)]">
            <LabelText>Token</LabelText>
            <Input
              type="password"
              value={store.authBearerToken}
              onChange={(e) => store.setAuthBearerToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full font-mono"
              spellCheck={false}
            />
            <p className="text-[10px] text-ctp-overlay0/70">
              Will be sent as: <code className="text-ctp-lavender/70 font-mono bg-ctp-surface0/20 px-1 py-px rounded">Authorization: Bearer {'<token>'}</code>
            </p>
          </div>
        )}

        {activeTab === "basic" && (
          <div className="space-y-[var(--space-md)]">
            <div className="space-y-[var(--space-sm)]">
              <LabelText>Username</LabelText>
              <Input
                value={store.authBasicUsername}
                onChange={(e) => store.setAuthBasicUsername(e.target.value)}
                placeholder="username"
                className="w-full"
                spellCheck={false}
              />
            </div>
            <div className="space-y-[var(--space-sm)]">
              <LabelText>Password</LabelText>
              <Input
                type="password"
                value={store.authBasicPassword}
                onChange={(e) => store.setAuthBasicPassword(e.target.value)}
                placeholder="password"
                className="w-full"
                spellCheck={false}
              />
            </div>
            <p className="text-[10px] text-ctp-overlay0/70">
              Will be sent as Base64 encoded credentials in the Authorization header
            </p>
          </div>
        )}

        {activeTab === "apikey" && (
          <div className="space-y-[var(--space-md)]">
            <div className="flex gap-[var(--space-md)]">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="apikey-header"
                  name="apikey-in"
                  checked={store.authApiKeyIn === "header"}
                  onChange={() => store.setAuthApiKeyIn("header")}
                  className="accent-ctp-lavender"
                />
                <label htmlFor="apikey-header" className="text-[12px] text-ctp-subtext1 cursor-pointer">
                  Header
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="apikey-query"
                  name="apikey-in"
                  checked={store.authApiKeyIn === "query"}
                  onChange={() => store.setAuthApiKeyIn("query")}
                  className="accent-ctp-lavender"
                />
                <label htmlFor="apikey-query" className="text-[12px] text-ctp-subtext1 cursor-pointer">
                  Query Param
                </label>
              </div>
            </div>
            <div className="space-y-[var(--space-sm)]">
              <LabelText>Key</LabelText>
              <Input
                value={store.authApiKeyKey}
                onChange={(e) => store.setAuthApiKeyKey(e.target.value)}
                placeholder="X-API-Key"
                className="w-full font-mono"
                spellCheck={false}
              />
            </div>
            <div className="space-y-[var(--space-sm)]">
              <LabelText>Value</LabelText>
              <Input
                type="password"
                value={store.authApiKeyValue}
                onChange={(e) => store.setAuthApiKeyValue(e.target.value)}
                placeholder="your-api-key"
                className="w-full font-mono"
                spellCheck={false}
              />
            </div>
            <p className="text-[10px] text-ctp-overlay0/70">
              {store.authApiKeyIn === "header" 
                ? `Will be sent as a header: ${store.authApiKeyKey || '<key>'}: ${store.authApiKeyValue ? '<value>' : '<value>'}`
                : `Will be appended as query parameter: ?${store.authApiKeyKey || '<key>'}=${store.authApiKeyValue ? '<value>' : '<value>'}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
