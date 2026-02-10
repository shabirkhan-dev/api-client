"use client";

import {
  Add01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  ClockIcon,
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  FileExportIcon,
  FileImportIcon,
  PlayIcon,
  Search01Icon,
  Settings02Icon,
  Shield01Icon,
  SquareIcon,
  Target02Icon,
  TrafficLightIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  ConfirmDialog,
  GlassPanel,
  Input,
  PromptDialog,
  Textarea,
} from "@/shared/components/ui";
import {
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
} from "@/shared/components/ui/dropdown-menu";
import { generateId } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import { useMockServer, type MockRequest, type ProxyLogEntry, type ProxyRule } from "../use-mock-server";

const methodColors: Record<string, string> = {
  GET: "bg-ctp-green/20 text-ctp-green border-ctp-green/30",
  POST: "bg-ctp-blue/20 text-ctp-blue border-ctp-blue/30",
  PUT: "bg-ctp-yellow/20 text-ctp-yellow border-ctp-yellow/30",
  DELETE: "bg-ctp-red/20 text-ctp-red border-ctp-red/30",
  PATCH: "bg-ctp-mauve/20 text-ctp-mauve border-ctp-mauve/30",
};

const actionColors: Record<string, string> = {
  redirect: "text-ctp-blue",
  modify: "text-ctp-yellow",
  block: "text-ctp-red",
  delay: "text-ctp-peach",
  mock: "text-ctp-mauve",
};

export function MockServerPanel() {
  const { mockRoutes, addMockRoute, removeMockRoute, setMockRoutes } = useAppStore();
  const {
    isRunning,
    baseUrl,
    requests,
    proxyRules,
    proxyLogs,
    proxyStats,
    proxyEnabled,
    startServer,
    stopServer,
    clearRequests,
    setBaseUrl,
    addProxyRule,
    updateProxyRule,
    removeProxyRule,
    toggleProxy,
    clearProxyLogs,
  } = useMockServer(mockRoutes);

  const [activeTab, setActiveTab] = useState<"routes" | "proxy" | "logs">("routes");
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logs based on search
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return proxyLogs;
    const query = searchQuery.toLowerCase();
    return proxyLogs.filter(
      (log) =>
        log.url.toLowerCase().includes(query) ||
        log.method.toLowerCase().includes(query) ||
        log.ruleName?.toLowerCase().includes(query)
    );
  }, [proxyLogs, searchQuery]);

  const handleAddRoute = () => {
    addMockRoute({
      id: generateId("mock"),
      path: "/api/example",
      status: 200,
      latency: 100,
      contentType: "application/json",
      body: JSON.stringify({ message: "Hello from mock server!" }, null, 2),
      condition: "",
    });
  };

  const updateRoute = (id: string, field: string, value: string | number) => {
    setMockRoutes(mockRoutes.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const copyEndpoint = (path: string) => {
    const fullUrl = `${baseUrl}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedEndpoint(path);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden">
      {/* Server Control Panel */}
      <GlassPanel className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                  isRunning
                    ? "bg-ctp-green/15 shadow-[0_0_12px_rgba(166,227,161,0.3)]"
                    : "bg-ctp-surface0/30"
                )}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    isRunning ? "bg-ctp-green animate-pulse" : "bg-ctp-overlay0"
                  )}
                />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-ctp-text">
                  {isRunning ? "Server Running" : "Server Stopped"}
                </div>
                <div className="text-[11px] text-ctp-overlay0 flex items-center gap-2">
                  <span className="font-mono">{baseUrl}</span>
                  <span className="text-ctp-surface0">|</span>
                  <span>{mockRoutes.length} routes</span>
                  {proxyEnabled && (
                    <>
                      <span className="text-ctp-surface0">|</span>
                      <span className="text-ctp-lavender">{proxyRules.length} proxy rules</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Base URL Input */}
            <div className="flex items-center gap-2 bg-ctp-surface0/20 rounded-lg px-3 py-2">
              <span className="text-[11px] text-ctp-overlay0">Base URL:</span>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:3001"
                className="w-40 text-[11px] font-mono bg-transparent border-0 p-0 focus:ring-0"
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {/* Proxy Toggle */}
            <button
              type="button"
              onClick={toggleProxy}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                proxyEnabled
                  ? "bg-ctp-lavender/15 text-ctp-lavender border border-ctp-lavender/30"
                  : "bg-ctp-surface0/20 text-ctp-subtext0 hover:bg-ctp-surface0/30"
              )}
            >
              <HugeiconsIcon icon={TrafficLightIcon} size={14} />
              <span className="text-[11px] font-medium">Proxy</span>
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  proxyEnabled ? "bg-ctp-lavender" : "bg-ctp-overlay0"
                )}
              />
            </button>

            {/* Start/Stop */}
            {isRunning ? (
              <Button variant="danger" size="sm" onClick={stopServer}>
                <HugeiconsIcon icon={SquareIcon} size={13} />
                Stop
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={startServer}>
                <HugeiconsIcon icon={PlayIcon} size={13} />
                Start
              </Button>
            )}
          </div>
        </div>

        {/* Proxy Stats */}
        {proxyEnabled && (
          <div className="mt-4 pt-4 border-t border-ctp-surface0/15">
            <div className="grid grid-cols-5 gap-3">
              <StatCard label="Total" value={proxyStats.totalRequests} color="default" />
              <StatCard label="Modified" value={proxyStats.modified} color="yellow" />
              <StatCard label="Blocked" value={proxyStats.blocked} color="red" />
              <StatCard label="Redirected" value={proxyStats.redirected} color="blue" />
              <StatCard label="Mocked" value={proxyStats.mocked} color="mauve" />
            </div>
          </div>
        )}
      </GlassPanel>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 px-1">
        <TabButton
          active={activeTab === "routes"}
          onClick={() => setActiveTab("routes")}
          icon={Target02Icon}
          label="Routes"
          count={mockRoutes.length}
        />
        <TabButton
          active={activeTab === "proxy"}
          onClick={() => setActiveTab("proxy")}
          icon={Shield01Icon}
          label="Proxy Rules"
          count={proxyRules.length}
          highlight={proxyEnabled}
        />
        <TabButton
          active={activeTab === "logs"}
          onClick={() => setActiveTab("logs")}
          icon={ClockIcon}
          label="Logs"
          count={proxyLogs.length + requests.length}
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeTab === "routes" && (
          <RoutesTab
            routes={mockRoutes}
            onAdd={handleAddRoute}
            onRemove={removeMockRoute}
            onUpdate={updateRoute}
            onCopy={copyEndpoint}
            copiedEndpoint={copiedEndpoint}
            baseUrl={baseUrl}
          />
        )}

        {activeTab === "proxy" && (
          <ProxyTab
            rules={proxyRules}
            onAdd={addProxyRule}
            onRemove={removeProxyRule}
            onUpdate={updateProxyRule}
          />
        )}

        {activeTab === "logs" && (
          <LogsTab
            logs={filteredLogs}
            requests={requests}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={clearProxyLogs}
          />
        )}
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Target02Icon;
  label: string;
  count: number;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-200",
        active
          ? "bg-ctp-lavender/15 text-ctp-lavender"
          : "text-ctp-subtext0 hover:bg-ctp-surface0/20 hover:text-ctp-text",
        highlight && !active && "text-ctp-lavender/70"
      )}
    >
      <HugeiconsIcon icon={icon} size={14} />
      <span>{label}</span>
      {count > 0 && (
        <span
          className={cn(
            "px-1.5 py-px rounded text-[10px]",
            active ? "bg-ctp-lavender/20" : "bg-ctp-surface0/30"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Routes Tab
function RoutesTab({
  routes,
  onAdd,
  onRemove,
  onUpdate,
  onCopy,
  copiedEndpoint,
  baseUrl,
}: {
  routes: Array<{
    id: string;
    path: string;
    status: number;
    latency: number;
    contentType: string;
    body: string;
    condition?: string;
  }>;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onCopy: (path: string) => void;
  copiedEndpoint: string | null;
  baseUrl: string;
}) {
  return (
    <div className="flex gap-3 h-full">
      {/* Routes List */}
      <GlassPanel className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-semibold text-ctp-text">Mock Routes</div>
          <Button variant="secondary" size="sm" onClick={onAdd}>
            <HugeiconsIcon icon={Add01Icon} size={13} />
            Add Route
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onRemove={() => onRemove(route.id)}
              onUpdate={(field, value) => onUpdate(route.id, field, value)}
              onCopy={() => onCopy(route.path)}
              copied={copiedEndpoint === route.path}
              baseUrl={baseUrl}
            />
          ))}
          {routes.length === 0 && (
            <EmptyState
              icon={Target02Icon}
              title="No mock routes"
              description="Create routes to mock API responses"
            />
          )}
        </div>
      </GlassPanel>
    </div>
  );
}

// Route Card Component
function RouteCard({
  route,
  onRemove,
  onUpdate,
  onCopy,
  copied,
  baseUrl,
}: {
  route: {
    id: string;
    path: string;
    status: number;
    latency: number;
    contentType: string;
    body: string;
    condition?: string;
  };
  onRemove: () => void;
  onUpdate: (field: string, value: string | number) => void;
  onCopy: () => void;
  copied: boolean;
  baseUrl: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-ctp-mantle/40 rounded-lg border border-ctp-surface0/20 overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-ctp-surface0/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <HugeiconsIcon
          icon={expanded ? ArrowRight01Icon : ArrowRight01Icon}
          size={12}
          className={cn("text-ctp-overlay0 transition-transform", expanded && "rotate-90")}
        />

        <span
          className={cn(
            "text-[11px] font-mono font-semibold w-10",
            route.status >= 200 && route.status < 300
              ? "text-ctp-green"
              : route.status >= 400
              ? "text-ctp-red"
              : "text-ctp-yellow"
          )}
        >
          {route.status}
        </span>

        <span className="text-[12px] font-mono text-ctp-text flex-1 truncate">{route.path}</span>

        <span className="text-[10px] text-ctp-overlay0">{route.latency}ms</span>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className="p-1.5 rounded-md text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/30 transition-colors"
            title="Copy endpoint"
          >
            <HugeiconsIcon icon={copied ? Cancel01Icon : Copy01Icon} size={12} className={cn(copied && "text-ctp-green")} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 rounded-md text-ctp-overlay0 hover:text-ctp-red hover:bg-ctp-red/10 transition-colors"
            title="Delete"
          >
            <HugeiconsIcon icon={Delete02Icon} size={12} />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-ctp-surface0/10 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Path</label>
              <Input
                value={route.path}
                onChange={(e) => onUpdate("path", e.target.value)}
                className="text-[11px] font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Status</label>
              <Input
                type="number"
                value={route.status}
                onChange={(e) => onUpdate("status", Number(e.target.value))}
                className="text-[11px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Latency (ms)</label>
              <Input
                type="number"
                value={route.latency}
                onChange={(e) => onUpdate("latency", Number(e.target.value))}
                className="text-[11px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Content-Type</label>
            <Input
              value={route.contentType}
              onChange={(e) => onUpdate("contentType", e.target.value)}
              className="text-[11px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Response Body</label>
            <Textarea
              value={route.body}
              onChange={(e) => onUpdate("body", e.target.value)}
              className="h-24 text-[11px] font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Condition (Regex)</label>
            <Input
              value={route.condition || ""}
              onChange={(e) => onUpdate("condition", e.target.value)}
              className="text-[11px]"
              placeholder="Optional matching pattern"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Proxy Tab
function ProxyTab({
  rules,
  onAdd,
  onRemove,
  onUpdate,
}: {
  rules: ProxyRule[];
  onAdd: (rule: Omit<ProxyRule, "id">) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ProxyRule>) => void;
}) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="flex gap-3 h-full">
      <GlassPanel className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-semibold text-ctp-text">HTTP Proxy Rules</div>
            <div className="text-[11px] text-ctp-overlay0">
              Intercept and modify requests without browser
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowAddDialog(true)}>
            <HugeiconsIcon icon={Add01Icon} size={13} />
            Add Rule
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {rules.map((rule) => (
            <ProxyRuleCard
              key={rule.id}
              rule={rule}
              onRemove={() => onRemove(rule.id)}
              onUpdate={(updates) => onUpdate(rule.id, updates)}
            />
          ))}
          {rules.length === 0 && (
            <EmptyState
              icon={Shield01Icon}
              title="No proxy rules"
              description="Add rules to intercept and modify HTTP traffic"
            />
          )}
        </div>
      </GlassPanel>

      <ProxyRuleDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} onConfirm={onAdd} />
    </div>
  );
}

// Proxy Rule Card
function ProxyRuleCard({
  rule,
  onRemove,
  onUpdate,
}: {
  rule: ProxyRule;
  onRemove: () => void;
  onUpdate: (updates: Partial<ProxyRule>) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "bg-ctp-mantle/40 rounded-lg border overflow-hidden transition-all",
        rule.enabled ? "border-ctp-surface0/20" : "border-ctp-surface0/10 opacity-60"
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-ctp-surface0/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <Checkbox
          checked={rule.enabled}
          onChange={(checked) => onUpdate({ enabled: checked })}
          onClick={(e) => e.stopPropagation()}
        />

        <span
          className={cn(
            "text-[10px] uppercase font-semibold px-2 py-0.5 rounded border",
            actionColors[rule.action],
            "bg-opacity-10 border-opacity-30"
          )}
        >
          {rule.action}
        </span>

        <span className="text-[12px] font-medium text-ctp-text flex-1 truncate">{rule.name}</span>

        <span className="text-[10px] text-ctp-overlay0 font-mono">{rule.matchPattern}</span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 rounded-md text-ctp-overlay0 hover:text-ctp-red hover:bg-ctp-red/10 transition-colors"
        >
          <HugeiconsIcon icon={Delete02Icon} size={12} />
        </button>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-ctp-surface0/10 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Match Type</label>
              <select
                value={rule.matchType}
                onChange={(e) => onUpdate({ matchType: e.target.value as ProxyRule["matchType"] })}
                className="w-full h-8 px-2 text-[11px] rounded-md bg-ctp-base/50 border border-ctp-surface0/30 text-ctp-text"
              >
                <option value="url">Exact URL</option>
                <option value="host">Host</option>
                <option value="path">Path</option>
                <option value="regex">Regex</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Pattern</label>
              <Input
                value={rule.matchPattern}
                onChange={(e) => onUpdate({ matchPattern: e.target.value })}
                className="text-[11px] font-mono"
              />
            </div>
          </div>

          {rule.action === "redirect" && (
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Target URL</label>
              <Input
                value={rule.targetUrl || ""}
                onChange={(e) => onUpdate({ targetUrl: e.target.value })}
                className="text-[11px] font-mono"
                placeholder="https://api.example.com"
              />
            </div>
          )}

          {rule.action === "delay" && (
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Delay (ms)</label>
              <Input
                type="number"
                value={rule.delayMs || 1000}
                onChange={(e) => onUpdate({ delayMs: Number(e.target.value) })}
                className="text-[11px]"
              />
            </div>
          )}

          {rule.action === "mock" && (
            <>
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Status Code</label>
                <Input
                  type="number"
                  value={rule.mockResponse?.status || 200}
                  onChange={(e) =>
                    onUpdate({
                      mockResponse: {
                        ...(rule.mockResponse || { headers: {}, body: "" }),
                        status: Number(e.target.value),
                      },
                    })
                  }
                  className="text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Response Body</label>
                <Textarea
                  value={rule.mockResponse?.body || ""}
                  onChange={(e) =>
                    onUpdate({
                      mockResponse: {
                        ...(rule.mockResponse || { status: 200, headers: {} }),
                        body: e.target.value,
                      },
                    })
                  }
                  className="h-20 text-[11px] font-mono"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Add Proxy Rule Dialog
function ProxyRuleDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (rule: Omit<ProxyRule, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [matchType, setMatchType] = useState<ProxyRule["matchType"]>("url");
  const [matchPattern, setMatchPattern] = useState("");
  const [action, setAction] = useState<ProxyRule["action"]>("modify");

  const handleConfirm = () => {
    if (!name.trim() || !matchPattern.trim()) return;
    onConfirm({
      name: name.trim(),
      enabled: true,
      matchType,
      matchPattern: matchPattern.trim(),
      action,
    });
    setName("");
    setMatchPattern("");
    onClose();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",
        !open && "hidden"
      )}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-ctp-mantle border border-ctp-surface0/30 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-[16px] font-semibold text-ctp-text mb-4">Add Proxy Rule</h3>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] text-ctp-subtext0">Rule Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Block Analytics" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-ctp-subtext0">Match Type</label>
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value as ProxyRule["matchType"])}
                className="w-full h-9 px-3 text-[12px] rounded-lg bg-ctp-base/50 border border-ctp-surface0/30 text-ctp-text"
              >
                <option value="url">Exact URL</option>
                <option value="host">Host</option>
                <option value="path">Path</option>
                <option value="regex">Regex</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-ctp-subtext0">Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as ProxyRule["action"])}
                className="w-full h-9 px-3 text-[12px] rounded-lg bg-ctp-base/50 border border-ctp-surface0/30 text-ctp-text"
              >
                <option value="modify">Modify</option>
                <option value="redirect">Redirect</option>
                <option value="block">Block</option>
                <option value="delay">Delay</option>
                <option value="mock">Mock</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-ctp-subtext0">Pattern</label>
            <Input
              value={matchPattern}
              onChange={(e) => setMatchPattern(e.target.value)}
              placeholder={matchType === "url" ? "https://api.example.com/v1/users" : "/api/users"}
              className="font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm} disabled={!name.trim() || !matchPattern.trim()}>
            Add Rule
          </Button>
        </div>
      </div>
    </div>
  );
}

// Logs Tab
function LogsTab({
  logs,
  requests,
  searchQuery,
  onSearchChange,
  onClear,
}: {
  logs: ProxyLogEntry[];
  requests: MockRequest[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
}) {
  const allLogs = useMemo(() => {
    const combined = [
      ...logs.map((l) => ({ ...l, type: "proxy" as const })),
      ...requests.map((r) => ({ ...r, type: "mock" as const })),
    ];
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, requests]);

  return (
    <div className="flex gap-3 h-full">
      <GlassPanel className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-semibold text-ctp-text">Request Logs</div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ctp-overlay0"
              />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-48 pl-8 text-[11px]"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {allLogs.map((log: any) => (
            <LogEntryItem key={log.id} log={log} />
          ))}
          {allLogs.length === 0 && (
            <EmptyState icon={ClockIcon} title="No logs yet" description="Make a request to see logs here" />
          )}
        </div>
      </GlassPanel>
    </div>
  );
}

// Log Entry Item
function LogEntryItem({ log }: { log: any }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-ctp-green";
    if (status >= 300 && status < 400) return "text-ctp-yellow";
    if (status >= 400 && status < 500) return "text-ctp-peach";
    return "text-ctp-red";
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className="bg-ctp-mantle/40 rounded-lg p-2.5 cursor-pointer hover:bg-ctp-surface0/20 transition-colors border border-ctp-surface0/10"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-ctp-overlay0 font-mono">{formatTime(log.timestamp)}</span>

        {"method" in log && (
          <span
            className={cn(
              "text-[9px] font-semibold px-1.5 py-px rounded border",
              methodColors[log.method] || "bg-ctp-overlay0/20 text-ctp-overlay0 border-ctp-overlay0/30"
            )}
          >
            {log.method}
          </span>
        )}

        <span className={cn("text-[11px] font-mono font-semibold w-8", getStatusColor(log.status || log.responseStatus))}>
          {log.status || log.responseStatus}
        </span>

        <span className="text-[11px] text-ctp-subtext0 truncate flex-1">{log.path || log.url}</span>

        {"duration" in log && <span className="text-[10px] text-ctp-overlay0">{log.duration}ms</span>}
        {"latency" in log && <span className="text-[10px] text-ctp-overlay0">{log.latency}ms</span>}

        {log.ruleName && (
          <span className="text-[9px] px-1.5 py-px rounded bg-ctp-lavender/15 text-ctp-lavender">{log.ruleName}</span>
        )}
        {log.type === "mock" && (
          <span className="text-[9px] px-1.5 py-px rounded bg-ctp-mauve/15 text-ctp-mauve">mock</span>
        )}
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-ctp-surface0/20 text-[10px] text-ctp-subtext0">
          <div className="font-mono break-all">{log.url}</div>
          {log.matchedRuleId && <div className="mt-1 text-ctp-lavender">Rule: {log.ruleName}</div>}
        </div>
      )}
    </div>
  );
}

// Stat Card
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "default" | "yellow" | "red" | "blue" | "mauve";
}) {
  const colors = {
    default: "text-ctp-text",
    yellow: "text-ctp-yellow",
    red: "text-ctp-red",
    blue: "text-ctp-blue",
    mauve: "text-ctp-mauve",
  };

  return (
    <div className="bg-ctp-surface0/10 rounded-lg px-3 py-2">
      <div className={cn("text-[16px] font-bold", colors[color])}>{value}</div>
      <div className="text-[9px] text-ctp-overlay0 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// Empty State
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: typeof Target02Icon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-ctp-surface0/20 flex items-center justify-center mb-3">
        <HugeiconsIcon icon={icon} size={22} className="text-ctp-overlay0/50" />
      </div>
      <p className="text-[13px] text-ctp-subtext0 font-medium">{title}</p>
      <p className="text-[11px] text-ctp-overlay0/70 mt-1">{description}</p>
    </div>
  );
}

// Utility
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
