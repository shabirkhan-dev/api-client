"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/shared/stores/app-store";
import { performHttpRequest } from "../services/http-service";

export function useHttpRequest() {
  const store = useAppStore();

  const sendRequest = useCallback(async () => {
    if (store.requestInFlight) return;

    const { url, method, bodyText, headers, params } = store;

    if (!url.trim()) {
      toast.error("URL is required");
      return;
    }

    store.setRequestInFlight(true);

    try {
      const resolvedUrl = store.replaceVariables(url);
      
      // Build headers from key-value pairs
      const requestHeaders: Record<string, string> = {};
      for (const header of headers) {
        if (header.enabled && header.key) {
          requestHeaders[header.key] = store.replaceVariables(header.value);
        }
      }
      
      // Add auth headers
      const authHeaders = store.buildAuthHeaders();
      Object.assign(requestHeaders, authHeaders);

      // Build query params from key-value pairs
      const queryParams: Record<string, string> = {};
      for (const param of params) {
        if (param.enabled && param.key) {
          queryParams[param.key] = store.replaceVariables(param.value);
        }
      }
      
      // Add auth query params if API key in query
      const authQueryParams = store.buildAuthQueryParams();
      Object.assign(queryParams, authQueryParams);

      const queryString = new URLSearchParams(queryParams).toString();
      const finalUrl = queryString
        ? `${resolvedUrl}${resolvedUrl.includes("?") ? "&" : "?"}${queryString}`
        : resolvedUrl;

      let body: string | null = null;
      if (bodyText.trim() && method !== "GET") {
        body = store.replaceVariables(bodyText);
        if (!requestHeaders["Content-Type"] && !requestHeaders["content-type"]) {
          requestHeaders["Content-Type"] = "application/json";
        }
      }

      const retryCodes = store.retryCodes
        .split(",")
        .map((v) => Number(v.trim()))
        .filter(Boolean);

      // Check mock routes
      const mockRoute = store.mockRoutes.find((r) => finalUrl.includes(r.path));
      if (mockRoute) {
        await new Promise((r) => setTimeout(r, mockRoute.latency));
        store.setLastResponse({
          status: mockRoute.status,
          statusText: mockRoute.status >= 400 ? "Error" : "OK",
          body: mockRoute.body,
          headers: { "content-type": mockRoute.contentType },
          time: mockRoute.latency,
          size: new Blob([mockRoute.body]).size,
          isMock: true,
        });
        toast.success("Mock response served");
        store.addHistoryItem({ method, url: finalUrl });
        return;
      }

      const response = await performHttpRequest(
        { method, url: finalUrl, headers: requestHeaders, body },
        {
          attempts: store.retryAttempts,
          backoff: store.retryBackoff,
          codes: retryCodes,
          circuit: store.retryCircuitEnabled,
        },
      );

      store.setLastResponse(response);
      store.addHistoryItem({ method, url: finalUrl });
      store.addInterceptorLog({
        method,
        url: finalUrl,
        blocked: false,
        timestamp: Date.now(),
      });

      if (response.status >= 400) {
        toast.error(`${response.status} ${response.statusText}`);
      } else {
        toast.success(`${response.status} ${response.statusText} — ${response.time}ms`);
      }

      // Auto-save back to collection if this request came from one
      if (store.activeRequestItemId && store.requestDirty) {
        try {
          const savedHeaders: Record<string, string> = {};
          for (const h of headers) {
            if (h.enabled && h.key) {
              savedHeaders[h.key] = h.value;
            }
          }

          await fetch(`/api/collection-items/${store.activeRequestItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              method,
              url,
              headers: savedHeaders,
              body: bodyText || undefined,
              params: store.paramsText || undefined,
            }),
          });
          store.markRequestClean();
        } catch {
          /* auto-save is best-effort */
        }
      }
    } catch (err) {
      toast.error(`Network error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      store.setRequestInFlight(false);
    }
  }, [store]);

  return { sendRequest };
}
