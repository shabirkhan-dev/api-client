"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MockRoute } from "@/shared/types";

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
}

export function useMockServer(routes: MockRoute[]) {
	const [state, setState] = useState<MockServerState>({
		isRunning: false,
		baseUrl: "http://localhost:3001",
		requests: [],
	});
	
	const originalFetchRef = useRef<typeof fetch | null>(null);

	// Mock fetch implementation
	const mockFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
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

		// Find matching route
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

		const requestId = Math.random().toString(36).substring(7);
		const startTime = Date.now();

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

		// No matching route - pass through to original fetch
		if (originalFetchRef.current) {
			return originalFetchRef.current(input, init);
		}

		// Return 404
		return new Response(JSON.stringify({ error: "No mock route found", path }), {
			status: 404,
			statusText: "Not Found",
			headers: { "Content-Type": "application/json", "X-Mock-Server": "true" },
		});
	}, [routes]);

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
		setState((prev) => ({ ...prev, requests: [] }));
	}, []);

	const setBaseUrl = useCallback((url: string) => {
		setState((prev) => ({ ...prev, baseUrl: url }));
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
		startServer,
		stopServer,
		clearRequests,
		setBaseUrl,
	};
}

function getStatusText(status: number): string {
	const statusTexts: Record<number, string> = {
		200: "OK", 201: "Created", 204: "No Content",
		400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
		404: "Not Found", 405: "Method Not Allowed", 409: "Conflict",
		422: "Unprocessable Entity", 500: "Internal Server Error",
		502: "Bad Gateway", 503: "Service Unavailable",
	};
	return statusTexts[status] || "Unknown";
}
