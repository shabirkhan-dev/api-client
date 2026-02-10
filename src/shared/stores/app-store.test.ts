import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "./app-store";

describe("AppStore", () => {
	beforeEach(() => {
		const { setState } = useAppStore;
		setState({
			activeTab: "http",
			sidebarOpen: true,
			method: "GET",
			url: "",
			headersText: "",
			bodyText: "",
			paramsText: "",
			history: [],
			favorites: [],
			interceptorEnabled: false,
			interceptorStats: { intercepted: 0, modified: 0, blocked: 0 },
			interceptorLog: [],
			mockRoutes: [],
			chainVars: {},
			activeEnv: "development",
			envs: {
				global: { token: "global-token" },
				scoped: {
					development: { baseUrl: "https://api.dev.local" },
					staging: { baseUrl: "https://api.staging.local" },
					production: { baseUrl: "https://api.prod.local" },
				},
				session: {},
			},
		});
	});

	it("has default state", () => {
		const state = useAppStore.getState();
		expect(state.activeTab).toBe("http");
		expect(state.sidebarOpen).toBe(true);
		expect(state.method).toBe("GET");
	});

	it("sets active tab", () => {
		useAppStore.getState().setActiveTab("websocket");
		expect(useAppStore.getState().activeTab).toBe("websocket");
	});

	it("toggles sidebar", () => {
		useAppStore.getState().toggleSidebar();
		expect(useAppStore.getState().sidebarOpen).toBe(false);
		useAppStore.getState().toggleSidebar();
		expect(useAppStore.getState().sidebarOpen).toBe(true);
	});

	it("sets method", () => {
		useAppStore.getState().setMethod("POST");
		expect(useAppStore.getState().method).toBe("POST");
	});

	it("sets url", () => {
		useAppStore.getState().setUrl("https://api.example.com");
		expect(useAppStore.getState().url).toBe("https://api.example.com");
	});

	it("adds history item", () => {
		useAppStore.getState().addHistoryItem({ method: "GET", url: "https://example.com" });
		const history = useAppStore.getState().history;
		expect(history).toHaveLength(1);
		expect(history[0].url).toBe("https://example.com");
		expect(history[0].method).toBe("GET");
	});

	it("limits history to 50 items", () => {
		for (let i = 0; i < 60; i++) {
			useAppStore.getState().addHistoryItem({ method: "GET", url: `https://example.com/${i}` });
		}
		expect(useAppStore.getState().history).toHaveLength(50);
	});

	it("toggles favorites", () => {
		const item = {
			id: "test-1",
			method: "GET" as const,
			url: "https://example.com",
			timestamp: Date.now(),
		};
		useAppStore.getState().toggleFavorite(item);
		expect(useAppStore.getState().favorites).toHaveLength(1);

		useAppStore.getState().toggleFavorite(item);
		expect(useAppStore.getState().favorites).toHaveLength(0);
	});

	it("checks isFavorite", () => {
		const item = {
			id: "test-1",
			method: "GET" as const,
			url: "https://example.com",
			timestamp: Date.now(),
		};
		expect(useAppStore.getState().isFavorite("https://example.com", "GET")).toBe(false);
		useAppStore.getState().toggleFavorite(item);
		expect(useAppStore.getState().isFavorite("https://example.com", "GET")).toBe(true);
	});

	it("replaces variables from global env", () => {
		const result = useAppStore.getState().replaceVariables("Bearer {{token}}");
		expect(result).toBe("Bearer global-token");
	});

	it("replaces variables from scoped env", () => {
		const result = useAppStore.getState().replaceVariables("{{baseUrl}}/users");
		expect(result).toBe("https://api.dev.local/users");
	});

	it("replaces variables from chain vars", () => {
		useAppStore.getState().setChainVar("userId", "123");
		const result = useAppStore.getState().replaceVariables("users/{{userId}}");
		expect(result).toBe("users/123");
	});

	it("replaces unknown variables with empty string", () => {
		const result = useAppStore.getState().replaceVariables("{{unknown}}");
		expect(result).toBe("");
	});

	it("manages interceptor state", () => {
		useAppStore.getState().setInterceptorEnabled(true);
		expect(useAppStore.getState().interceptorEnabled).toBe(true);

		useAppStore.getState().incrementInterceptorStat("intercepted");
		expect(useAppStore.getState().interceptorStats.intercepted).toBe(1);

		useAppStore.getState().incrementInterceptorStat("blocked");
		expect(useAppStore.getState().interceptorStats.blocked).toBe(1);
	});

	it("manages mock routes", () => {
		const route = {
			id: "mock-1",
			path: "/test",
			status: 200,
			latency: 100,
			contentType: "application/json",
			body: '{"ok":true}',
			condition: "",
		};
		useAppStore.getState().addMockRoute(route);
		expect(useAppStore.getState().mockRoutes).toHaveLength(1);

		useAppStore.getState().removeMockRoute("mock-1");
		expect(useAppStore.getState().mockRoutes).toHaveLength(0);
	});

	it("adds interceptor log entries", () => {
		useAppStore.getState().addInterceptorLog({
			method: "GET",
			url: "https://example.com",
			blocked: false,
			timestamp: Date.now(),
		});
		expect(useAppStore.getState().interceptorLog).toHaveLength(1);
	});

	it("limits interceptor log to 50 entries", () => {
		for (let i = 0; i < 60; i++) {
			useAppStore.getState().addInterceptorLog({
				method: "GET",
				url: `https://example.com/${i}`,
				blocked: false,
				timestamp: Date.now(),
			});
		}
		expect(useAppStore.getState().interceptorLog).toHaveLength(50);
	});

	it("sets retry config", () => {
		useAppStore.getState().setRetryConfig({ attempts: 5, backoff: 1000 });
		expect(useAppStore.getState().retryAttempts).toBe(5);
		expect(useAppStore.getState().retryBackoff).toBe(1000);
	});

	it("loads request from collection node", () => {
		useAppStore.getState().loadRequestFromNode({
			id: "req-1",
			name: "Test",
			type: "request",
			method: "POST",
			url: "https://example.com/api",
			headers: '{"X-Custom":"value"}',
			body: '{"test":true}',
		});
		expect(useAppStore.getState().method).toBe("POST");
		expect(useAppStore.getState().url).toBe("https://example.com/api");
		expect(useAppStore.getState().headersText).toBe('{"X-Custom":"value"}');
		expect(useAppStore.getState().bodyText).toBe('{"test":true}');
	});

	it("does not load request from folder node", () => {
		useAppStore.getState().setUrl("original");
		useAppStore.getState().loadRequestFromNode({
			id: "folder-1",
			name: "Folder",
			type: "folder",
		});
		expect(useAppStore.getState().url).toBe("original");
	});
});
