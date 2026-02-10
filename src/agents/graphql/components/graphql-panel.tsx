"use client";

import {
  ArrowRight01Icon,
  ClockIcon,
  Copy01Icon,
  Delete01Icon,
  History as HistoryIcon,
  PlayIcon,
  Refresh01Icon,
  SchemeIcon as SchemaIcon,
  Search01Icon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, Input, Textarea } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface GraphQLType {
  name: string;
  kind: string;
  description?: string;
  fields?: GraphQLField[];
}

interface GraphQLField {
  name: string;
  type: string;
  description?: string;
  args?: { name: string; type: string }[];
}

interface QueryHistory {
  id: string;
  query: string;
  variables: string;
  timestamp: number;
}

export function GraphQLPanel() {
  const [url, setUrl] = useState("https://api.spacex.land/graphql/");
  const [query, setQuery] = useState(`query GetRockets {
  rockets {
    id
    name
    description
  }
}`);
  const [variables, setVariables] = useState("{}");
  const [response, setResponse] = useState("");
  const [schema, setSchema] = useState<GraphQLType[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"query" | "variables" | "schema" | "history">("query");
  const [selectedType, setSelectedType] = useState<GraphQLType | null>(null);
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptionWs, setSubscriptionWs] = useState<WebSocket | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("graphql-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Save history
  const saveHistory = useCallback((newHistory: QueryHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem("graphql-history", JSON.stringify(newHistory.slice(0, 50)));
  }, []);

  // Execute query/mutation
  const execute = useCallback(async () => {
    if (!url.trim()) return toast.error("URL required");
    
    let vars = {};
    if (variables.trim()) {
      try {
        vars = JSON.parse(variables);
      } catch {
        return toast.error("Variables must be valid JSON");
      }
    }

    setLoading(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: vars }),
      });
      const data = await res.json();
      const formatted = JSON.stringify(data, null, 2);
      setResponse(formatted);
      
      // Add to history
      const newEntry: QueryHistory = {
        id: crypto.randomUUID(),
        query,
        variables,
        timestamp: Date.now(),
      };
      saveHistory([newEntry, ...history]);
      
      toast.success("Query executed");
    } catch (err) {
      toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setLoading(false);
    }
  }, [url, query, variables, history, saveHistory]);

  // Introspect schema
  const introspect = useCallback(async () => {
    if (!url.trim()) return toast.error("URL required");
    setLoading(true);
    
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            kind
            description
            fields {
              name
              description
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: introspectionQuery }),
      });
      const data = await res.json();
      
      if (data.data?.__schema?.types) {
        const types = data.data.__schema.types
          .filter((t: GraphQLType) => !t.name.startsWith("__"))
          .map((t: any) => ({
            name: t.name,
            kind: t.kind,
            description: t.description,
            fields: t.fields?.map((f: any) => ({
              name: f.name,
              type: f.type.name || f.type.kind,
              description: f.description,
            })),
          }));
        setSchema(types);
        setActiveTab("schema");
        toast.success("Schema loaded");
      }
    } catch {
      toast.error("Introspection failed");
    } finally {
      setLoading(false);
    }
  }, [url]);

  // Subscribe (WebSocket)
  const subscribe = useCallback(() => {
    if (!url.trim()) return toast.error("URL required");
    
    const wsUrl = url.replace(/^http/, "ws");
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setIsSubscribing(true);
      toast.success("Subscription started");
      
      // Send connection init
      ws.send(JSON.stringify({ type: "connection_init" }));
      
      // Start subscription
      ws.send(JSON.stringify({
        id: "1",
        type: "start",
        payload: { query, variables: JSON.parse(variables || "{}") },
      }));
    };
    
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "data") {
        setResponse((prev) => prev + "\n" + JSON.stringify(msg.payload, null, 2));
      }
    };
    
    ws.onerror = () => toast.error("Subscription error");
    ws.onclose = () => {
      setIsSubscribing(false);
      toast.info("Subscription closed");
    };
    
    setSubscriptionWs(ws);
  }, [url, query, variables]);

  const stopSubscription = useCallback(() => {
    subscriptionWs?.close();
    setSubscriptionWs(null);
    setIsSubscribing(false);
  }, [subscriptionWs]);

  // Add field to query from schema
  const addFieldToQuery = useCallback((fieldName: string) => {
    setQuery((prev) => {
      // Simple insertion - find the opening brace and add field
      const lines = prev.split("\n");
      const insertIndex = lines.findIndex((l) => l.includes("{")) + 1;
      lines.splice(insertIndex, 0, `    ${fieldName}`);
      return lines.join("\n");
    });
    setActiveTab("query");
    toast.success(`Added ${fieldName}`);
  }, []);

  // Load from history
  const loadHistory = useCallback((h: QueryHistory) => {
    setQuery(h.query);
    setVariables(h.variables);
    setActiveTab("query");
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem("graphql-history");
  }, []);

  // Copy response
  const copyResponse = useCallback(() => {
    navigator.clipboard.writeText(response);
    toast.success("Copied");
  }, [response]);

  const filteredTypes = schema.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <GlassPanel className="p-3">
        <div className="flex items-center gap-3">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/graphql"
            className="flex-1 font-mono text-[11px]"
          />
          <Button variant="secondary" size="sm" onClick={introspect} disabled={loading}>
            <HugeiconsIcon icon={SchemaIcon} size={12} /> Schema
          </Button>
          {isSubscribing ? (
            <Button variant="danger" size="sm" onClick={stopSubscription}>
              <HugeiconsIcon icon={StopIcon} size={12} /> Stop
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={execute} disabled={loading}>
              <HugeiconsIcon icon={PlayIcon} size={12} /> Run
            </Button>
          )}
        </div>
      </GlassPanel>

      {/* Main Content */}
      <div className="flex-1 flex gap-3 overflow-hidden min-h-0">
        {/* Left Panel - Editor */}
        <GlassPanel className="flex-1 flex flex-col p-3 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-ctp-surface0/20 pb-2 mb-2">
            {[
              { id: "query", label: "Query", icon: PlayIcon },
              { id: "variables", label: "Variables", icon: ArrowRight01Icon },
              { id: "schema", label: "Schema", icon: SchemaIcon },
              { id: "history", label: "History", icon: HistoryIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-ctp-lavender/15 text-ctp-lavender"
                    : "text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/20"
                )}
              >
                <HugeiconsIcon icon={tab.icon} size={12} />
                {tab.label}
                {tab.id === "history" && history.length > 0 && (
                  <span className="text-[9px] bg-ctp-surface0/40 px-1 rounded">{history.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "query" && (
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="query { viewer { id } }"
                className="h-full font-mono text-[12px] leading-relaxed"
              />
            )}

            {activeTab === "variables" && (
              <Textarea
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                placeholder='{"id": "123"}'
                className="h-full font-mono text-[12px]"
              />
            )}

            {activeTab === "schema" && (
              <div className="h-full flex gap-3">
                {/* Type List */}
                <div className="w-1/2 flex flex-col">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search types..."
                    className="mb-2 text-[11px]"
                    icon={<HugeiconsIcon icon={Search01Icon} size={12} />}
                  />
                  <div className="flex-1 overflow-y-auto space-y-0.5">
                    {filteredTypes.map((type) => (
                      <button
                        key={type.name}
                        onClick={() => setSelectedType(type)}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors",
                          selectedType?.name === type.name
                            ? "bg-ctp-lavender/15 text-ctp-lavender"
                            : "hover:bg-ctp-surface0/20 text-ctp-subtext1"
                        )}
                      >
                        <span className="font-mono">{type.name}</span>
                        <span className="text-[9px] text-ctp-overlay0 ml-2">{type.kind}</span>
                      </button>
                    ))}
                    {schema.length === 0 && (
                      <div className="text-[11px] text-ctp-overlay0 text-center py-4">
                        Click Schema to introspect
                      </div>
                    )}
                  </div>
                </div>

                {/* Type Details */}
                <div className="w-1/2 border-l border-ctp-surface0/20 pl-3 overflow-y-auto">
                  {selectedType ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-[13px] font-semibold text-ctp-text">{selectedType.name}</div>
                        <div className="text-[10px] text-ctp-overlay0">{selectedType.description}</div>
                      </div>
                      {selectedType.fields && (
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase text-ctp-overlay0 tracking-wider">Fields</div>
                          {selectedType.fields.map((field) => (
                            <div
                              key={field.name}
                              className="flex items-center justify-between py-1 px-2 rounded hover:bg-ctp-surface0/10 group"
                            >
                              <div>
                                <div className="text-[11px] font-mono text-ctp-subtext1">{field.name}</div>
                                <div className="text-[9px] text-ctp-overlay0">{field.type}</div>
                              </div>
                              <button
                                onClick={() => addFieldToQuery(field.name)}
                                className="opacity-0 group-hover:opacity-100 text-[9px] text-ctp-lavender hover:underline"
                              >
                                + Add
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-ctp-overlay0 text-center py-4">
                      Select a type to view details
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="h-full overflow-y-auto space-y-1">
                {history.length > 0 && (
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={clearHistory}
                      className="text-[10px] text-ctp-red hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                )}
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-ctp-surface0/10 hover:bg-ctp-surface0/20 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-mono text-ctp-subtext1 truncate">
                        {h.query.split("\n")[0]}
                      </div>
                      <div className="text-[9px] text-ctp-overlay0">
                        {new Date(h.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => loadHistory(h)}
                        className="p-1 rounded text-ctp-overlay0 hover:text-ctp-text"
                      >
                        <HugeiconsIcon icon={Refresh01Icon} size={12} />
                      </button>
                      <button
                        onClick={() => {
                          const newHistory = history.filter((i) => i.id !== h.id);
                          saveHistory(newHistory);
                        }}
                        className="p-1 rounded text-ctp-overlay0 hover:text-ctp-red"
                      >
                        <HugeiconsIcon icon={Delete01Icon} size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-[11px] text-ctp-overlay0 text-center py-4">
                    No queries yet
                  </div>
                )}
              </div>
            )}
          </div>
        </GlassPanel>

        {/* Right Panel - Response */}
        <GlassPanel className="w-[45%] flex flex-col p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-ctp-text">Response</span>
            <div className="flex gap-1">
              <button
                onClick={copyResponse}
                disabled={!response}
                className="p-1.5 rounded-lg text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/20 disabled:opacity-50"
              >
                <HugeiconsIcon icon={Copy01Icon} size={13} />
              </button>
              <button
                onClick={() => setResponse("")}
                disabled={!response}
                className="p-1.5 rounded-lg text-ctp-overlay0 hover:text-ctp-red hover:bg-ctp-red/10 disabled:opacity-50"
              >
                <HugeiconsIcon icon={Delete01Icon} size={13} />
              </button>
            </div>
          </div>
          <div
            ref={responseRef}
            className="flex-1 overflow-auto bg-ctp-mantle/50 rounded-lg p-3 font-mono text-[11px] leading-relaxed"
          >
            {response ? (
              <pre className="text-ctp-subtext1">{response}</pre>
            ) : (
              <div className="text-ctp-overlay0/50 text-center py-8">
                Run a query to see response
              </div>
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
