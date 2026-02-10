"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MockRoute } from "@/shared/types";

export interface ProxyRule {
  id: string;
  name: string;
  enabled: boolean;
  matchType: "url" | "host" | "path" | "regex";
  matchPattern: string;
  action: "redirect" | "modify" | "block" | "delay" | "mock";
  targetUrl?: string;
  modifyRequest?: {
    headers?: Record<string, string>;
    body?: string;
  };
  modifyResponse?: {
    status?: number;
    headers?: Record<string, string>;
    body?: string;
  };
  delayMs?: number;
  mockResponse?: {
    status: number;
    headers: Record<string, string>;
    body: string;
  };
}

export interface ProxyLogEntry {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  path: string;
  status: number;
  duration: number;
  size: number;
  matchedRuleId?: string;
  ruleName?: string;
  modified: boolean;
  blocked: boolean;
  redirected: boolean;
}

export interface ProxyStats {
  totalRequests: number;
  modified: number;
  blocked: number;
  redirected: number;
  mocked: number;
  avgLatency: number;
}

export interface MockRequest {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  path: string;
  matchedRouteId?: string;
  responseStatus: number;
  latency: number;
}

interface MockServerState {
  isRunning: boolean;
  baseUrl: string;
  requests: MockRequest[];
  proxyRules: ProxyRule[];
  proxyLogs: ProxyLogEntry[];
  proxyStats: ProxyStats;
  proxyEnabled: boolean;
}

export function useMockServer(routes: MockRoute[]) {
  const [state, setState] = useState<MockServerState>({
    isRunning: false,
    baseUrl: "http://localhost:3001",
    requests: [],
    proxyRules: [],
    proxyLogs: [],
    proxyStats: {
      totalRequests: 0,
      modified: 0,
      blocked: 0,
      redirected: 0,
      mocked: 0,
      avgLatency: 0,
    },
    proxyEnabled: false,
  });

  const originalFetchRef = useRef<typeof fetch | null>(null);

  // Check if URL matches a proxy rule
  const matchProxyRule = useCallback((url: string, method: string): ProxyRule | undefined => {
    return state.proxyRules.find((rule) => {
      if (!rule.enabled) return false;

      switch (rule.matchType) {
        case "url":
          return url === rule.matchPattern;
        case "host": {
          try {
            const urlObj = new URL(url);
            return urlObj.host === rule.matchPattern;
          } catch {
            return false;
          }
        }
        case "path": {
          try {
            const urlObj = new URL(url);
            return urlObj.pathname === rule.matchPattern;
          } catch {
            return url.includes(rule.matchPattern);
          }
        }
        case "regex":
          try {
            const regex = new RegExp(rule.matchPattern);
            return regex.test(url);
          } catch {
            return false;
          }
        default:
          return false;
      }
    });
  }, [state.proxyRules]);

  // Apply proxy rule to request
  const applyProxyRule = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit, rule?: ProxyRule): Promise<Response> => {
      if (!rule) {
        // No rule - pass through to original fetch
        if (originalFetchRef.current) {
          return originalFetchRef.current(input, init);
        }
        throw new Error("Original fetch not available");
      }

      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method?.toUpperCase() || "GET";
      const startTime = Date.now();

      switch (rule.action) {
        case "block":
          return new Response(JSON.stringify({ error: "Blocked by proxy rule", rule: rule.name }), {
            status: 403,
            statusText: "Forbidden",
            headers: { "Content-Type": "application/json", "X-Proxy-Action": "block" },
          });

        case "delay":
          await new Promise((resolve) => setTimeout(resolve, rule.delayMs || 1000));
          if (originalFetchRef.current) {
            return originalFetchRef.current(input, init);
          }
          throw new Error("Original fetch not available");

        case "mock":
          if (rule.mockResponse) {
            return new Response(rule.mockResponse.body, {
              status: rule.mockResponse.status,
              headers: { ...rule.mockResponse.headers, "X-Proxy-Action": "mock" },
            });
          }
          throw new Error("Mock response not configured");

        case "redirect":
          if (rule.targetUrl) {
            const redirectUrl = rule.targetUrl;
            return new Response(null, {
              status: 302,
              headers: { Location: redirectUrl, "X-Proxy-Action": "redirect" },
            });
          }
          throw new Error("Target URL not configured");

        case "modify": {
          // Modify request if needed
          let modifiedInit = init;
          if (rule.modifyRequest) {
            modifiedInit = {
              ...init,
              headers: { ...init?.headers, ...rule.modifyRequest.headers },
              body: rule.modifyRequest.body || init?.body,
            };
          }

          // Make the request
          let response: Response;
          if (originalFetchRef.current) {
            response = await originalFetchRef.current(input, modifiedInit);
          } else {
            throw new Error("Original fetch not available");
          }

          // Modify response if needed
          if (rule.modifyResponse) {
            const body = rule.modifyResponse.body || (await response.text());
            return new Response(body, {
              status: rule.modifyResponse.status || response.status,
              statusText: response.statusText,
              headers: { ...Object.fromEntries(response.headers), ...rule.modifyResponse.headers, "X-Proxy-Action": "modify" },
            });
          }

          return response;
        }

        default:
          if (originalFetchRef.current) {
            return originalFetchRef.current(input, init);
          }
          throw new Error("Original fetch not available");
      }
    },
    []
  );

  // Mock fetch implementation with proxy support
  const mockFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method?.toUpperCase() || "GET";

      // Parse URL to get path
      let path: string;
      try {
        const urlObj = new URL(url);
        path = urlObj.pathname + urlObj.search;
      } catch {
        path = url;
      }

      const requestId = Math.random().toString(36).substring(7);
      const startTime = Date.now();

      // Check proxy rules first (if proxy mode enabled)
      if (state.proxyEnabled) {
        const matchedRule = matchProxyRule(url, method);
        if (matchedRule) {
          const response = await applyProxyRule(input, init, matchedRule);
          const duration = Date.now() - startTime;
          const body = await response.clone().text();

          // Log proxy request
          const logEntry: ProxyLogEntry = {
            id: requestId,
            timestamp: startTime,
            method,
            url,
            path,
            status: response.status,
            duration,
            size: body.length,
            matchedRuleId: matchedRule.id,
            ruleName: matchedRule.name,
            modified: matchedRule.action === "modify",
            blocked: matchedRule.action === "block",
            redirected: matchedRule.action === "redirect",
          };

          setState((prev) => ({
            ...prev,
            proxyLogs: [logEntry, ...prev.proxyLogs].slice(0, 100),
            proxyStats: {
              ...prev.proxyStats,
              totalRequests: prev.proxyStats.totalRequests + 1,
              [matchedRule.action === "modify" ? "modified" : 
               matchedRule.action === "block" ? "blocked" :
               matchedRule.action === "redirect" ? "redirected" : "mocked"]: 
                prev.proxyStats[matchedRule.action === "modify" ? "modified" : 
                  matchedRule.action === "block" ? "blocked" :
                  matchedRule.action === "redirect" ? "redirected" : "mocked"] + 1,
              avgLatency: (prev.proxyStats.avgLatency * prev.proxyStats.totalRequests + duration) / (prev.proxyStats.totalRequests + 1),
            },
          }));

          return response;
        }
      }

      // Check mock routes
      const matchedRoute = routes.find((route) => {
        const routePath = route.path;

        // Exact match
        if (routePath === path) return true;

        // Wildcard match
        if (routePath.endsWith("/*")) {
          const prefix = routePath.slice(0, -1);
          return path.startsWith(prefix);
        }

        // Regex match if condition is provided
        if (route.condition) {
          try {
            const regex = new RegExp(route.condition);
            return regex.test(path);
          } catch {
            // Invalid regex
          }
        }

        return false;
      });

      if (matchedRoute) {
        // Simulate latency
        await new Promise((resolve) => setTimeout(resolve, matchedRoute.latency));

        // Log the request
        const mockRequest: MockRequest = {
          id: requestId,
          timestamp: startTime,
          method,
          url,
          path,
          matchedRouteId: matchedRoute.id,
          responseStatus: matchedRoute.status,
          latency: Date.now() - startTime,
        };

        setState((prev) => ({
          ...prev,
          requests: [mockRequest, ...prev.requests].slice(0, 100),
        }));

        // Return mock response
        return new Response(matchedRoute.body, {
          status: matchedRoute.status,
          statusText: getStatusText(matchedRoute.status),
          headers: {
            "Content-Type": matchedRoute.contentType,
            "X-Mock-Server": "true",
            "X-Mock-Route-Id": matchedRoute.id,
          },
        });
      }

      // No matching route or rule - pass through to original fetch
      if (originalFetchRef.current) {
        const response = await originalFetchRef.current(input, init);

        // Log pass-through request
        const duration = Date.now() - startTime;
        const logEntry: ProxyLogEntry = {
          id: requestId,
          timestamp: startTime,
          method,
          url,
          path,
          status: response.status,
          duration,
          size: 0,
          modified: false,
          blocked: false,
          redirected: false,
        };

        setState((prev) => ({
          ...prev,
          proxyLogs: [logEntry, ...prev.proxyLogs].slice(0, 100),
        }));

        return response;
      }

      // Return 404
      return new Response(JSON.stringify({ error: "No mock route found", path }), {
        status: 404,
        statusText: "Not Found",
        headers: { "Content-Type": "application/json", "X-Mock-Server": "true" },
      });
    },
    [routes, state.proxyEnabled, state.proxyRules, matchProxyRule, applyProxyRule]
  );

  const startServer = useCallback(() => {
    if (originalFetchRef.current) return;
    originalFetchRef.current = window.fetch.bind(window);
    window.fetch = mockFetch;
    setState((prev) => ({ ...prev, isRunning: true }));
  }, [mockFetch]);

  const stopServer = useCallback(() => {
    if (!originalFetchRef.current) return;
    window.fetch = originalFetchRef.current;
    originalFetchRef.current = null;
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const clearRequests = useCallback(() => {
    setState((prev) => ({ ...prev, requests: [], proxyLogs: [] }));
  }, []);

  const setBaseUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, baseUrl: url }));
  }, []);

  // Proxy rule management
  const addProxyRule = useCallback((rule: Omit<ProxyRule, "id">) => {
    const newRule: ProxyRule = { ...rule, id: crypto.randomUUID() };
    setState((prev) => ({
      ...prev,
      proxyRules: [...prev.proxyRules, newRule],
    }));
  }, []);

  const updateProxyRule = useCallback((id: string, updates: Partial<ProxyRule>) => {
    setState((prev) => ({
      ...prev,
      proxyRules: prev.proxyRules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  }, []);

  const removeProxyRule = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      proxyRules: prev.proxyRules.filter((r) => r.id !== id),
    }));
  }, []);

  const toggleProxy = useCallback(() => {
    setState((prev) => ({ ...prev, proxyEnabled: !prev.proxyEnabled }));
  }, []);

  const clearProxyLogs = useCallback(() => {
    setState((prev) => ({ ...prev, proxyLogs: [] }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
      }
    };
  }, []);

  return {
    isRunning: state.isRunning,
    baseUrl: state.baseUrl,
    requests: state.requests,
    proxyRules: state.proxyRules,
    proxyLogs: state.proxyLogs,
    proxyStats: state.proxyStats,
    proxyEnabled: state.proxyEnabled,
    startServer,
    stopServer,
    clearRequests,
    setBaseUrl,
    addProxyRule,
    updateProxyRule,
    removeProxyRule,
    toggleProxy,
    clearProxyLogs,
  };
}

function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    409: "Conflict",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return statusTexts[status] || "Unknown";
}
