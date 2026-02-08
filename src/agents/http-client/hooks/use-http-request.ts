"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { parseKeyValue } from "@/shared/lib/utils";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { performHttpRequest, parseHeaders } from "../services/http-service";
import { useCallback } from "react";
import { toast } from "sonner";

export function useHttpRequest() {
	const store = useAppStore();

	const sendRequest = useCallback(async () => {
		if (store.requestInFlight) return;

		let { url } = store;
		const { method, headersText, bodyText, paramsText, authType, authValue } = store;

		if (!url.trim()) {
			toast.error("URL is required");
			return;
		}

		store.setRequestInFlight(true);

		try {
			const resolvedUrl = store.replaceVariables(url);
			const params = parseKeyValue(store.replaceVariables(paramsText));
			const headers = parseHeaders(store.replaceVariables(headersText || "{}"));

			if (authType && authValue) {
				if (authType.toLowerCase().includes("bearer")) {
					headers.Authorization = `Bearer ${authValue}`;
				} else {
					headers.Authorization = authValue;
				}
			}

			const queryString = new URLSearchParams(params).toString();
			const finalUrl = queryString
				? `${resolvedUrl}${resolvedUrl.includes("?") ? "&" : "?"}${queryString}`
				: resolvedUrl;

			let body: string | null = null;
			if (bodyText.trim() && method !== "GET") {
				body = store.replaceVariables(bodyText);
				if (!headers["Content-Type"] && !headers["content-type"]) {
					headers["Content-Type"] = "application/json";
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
				{ method, url: finalUrl, headers, body },
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
		} catch (err) {
			toast.error(`Network error: ${err instanceof Error ? err.message : "Unknown"}`);
		} finally {
			store.setRequestInFlight(false);
		}
	}, [store]);

	return { sendRequest };
}
