import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { generateId } from "@/shared/lib/utils";
import type {
	CollectionNode,
	EnvironmentStore,
	HistoryItem,
	InterceptorLogEntry,
	MockRoute,
	ResponseData,
	WorkspaceTab,
} from "@/shared/types";

interface AppState {
	// Workspace
	activeTab: WorkspaceTab;
	sidebarOpen: boolean;

	// Request
	method: HttpMethod;
	url: string;
	headersText: string;
	bodyText: string;
	paramsText: string;
	authType: string;
	authValue: string;
	preRequestScript: string;
	testScript: string;
	requestInFlight: boolean;

	// Response
	lastResponse: ResponseData | null;

	// Collections
	collections: CollectionNode[];
	favorites: HistoryItem[];
	history: HistoryItem[];

	// Environment
	activeEnv: string;
	envs: EnvironmentStore;
	chainVars: Record<string, string>;

	// Interceptor
	interceptorEnabled: boolean;
	interceptorMode: "request" | "response" | "both";
	interceptorStats: { intercepted: number; modified: number; blocked: number };
	interceptorLog: InterceptorLogEntry[];

	// Mock
	mockRoutes: MockRoute[];

	// Retry
	retryAttempts: number;
	retryBackoff: number;
	retryCodes: string;
	retryCircuitEnabled: boolean;

	// Actions
	setActiveTab: (tab: WorkspaceTab) => void;
	toggleSidebar: () => void;
	setMethod: (method: HttpMethod) => void;
	setUrl: (url: string) => void;
	setHeadersText: (text: string) => void;
	setBodyText: (text: string) => void;
	setParamsText: (text: string) => void;
	setAuthType: (type: string) => void;
	setAuthValue: (value: string) => void;
	setPreRequestScript: (script: string) => void;
	setTestScript: (script: string) => void;
	setRequestInFlight: (loading: boolean) => void;
	setLastResponse: (response: ResponseData | null) => void;

	addHistoryItem: (item: Omit<HistoryItem, "id" | "timestamp">) => void;
	toggleFavorite: (item: HistoryItem) => void;
	isFavorite: (url: string, method: HttpMethod) => boolean;

	setCollections: (collections: CollectionNode[]) => void;
	addCollection: (node: CollectionNode) => void;

	setActiveEnv: (env: string) => void;
	setEnvs: (envs: EnvironmentStore) => void;
	setChainVar: (key: string, value: string) => void;

	setInterceptorEnabled: (enabled: boolean) => void;
	setInterceptorMode: (mode: "request" | "response" | "both") => void;
	incrementInterceptorStat: (stat: "intercepted" | "modified" | "blocked") => void;
	addInterceptorLog: (entry: InterceptorLogEntry) => void;

	setMockRoutes: (routes: MockRoute[]) => void;
	addMockRoute: (route: MockRoute) => void;
	removeMockRoute: (id: string) => void;

	setRetryConfig: (config: {
		attempts?: number;
		backoff?: number;
		codes?: string;
		circuit?: boolean;
	}) => void;

	replaceVariables: (value: string) => string;
	loadRequestFromNode: (node: CollectionNode) => void;
}

const DEFAULT_COLLECTIONS: CollectionNode[] = [
	{
		id: "folder-1",
		name: "Core APIs",
		type: "folder",
		collapsed: false,
		children: [
			{
				id: "req-1",
				name: "List Users",
				type: "request",
				method: "GET",
				url: "https://jsonplaceholder.typicode.com/users",
			},
			{
				id: "req-2",
				name: "Create User",
				type: "request",
				method: "POST",
				url: "https://jsonplaceholder.typicode.com/users",
			},
		],
	},
];

const DEFAULT_ENVS: EnvironmentStore = {
	global: { token: "global-token" },
	scoped: {
		development: { baseUrl: "https://api.dev.local" },
		staging: { baseUrl: "https://api.staging.local" },
		production: { baseUrl: "https://api.prod.local" },
	},
	session: {},
};

export const useAppStore = create<AppState>()(
	persist(
		(set, get) => ({
			activeTab: "http",
			sidebarOpen: true,
			method: "GET",
			url: "",
			headersText: "",
			bodyText: "",
			paramsText: "",
			authType: "",
			authValue: "",
			preRequestScript: "",
			testScript: "",
			requestInFlight: false,
			lastResponse: null,
			collections: DEFAULT_COLLECTIONS,
			favorites: [],
			history: [],
			activeEnv: "development",
			envs: DEFAULT_ENVS,
			chainVars: {},
			interceptorEnabled: false,
			interceptorMode: "request",
			interceptorStats: { intercepted: 0, modified: 0, blocked: 0 },
			interceptorLog: [],
			mockRoutes: [],
			retryAttempts: 3,
			retryBackoff: 500,
			retryCodes: "502,503,504",
			retryCircuitEnabled: false,

			setActiveTab: (tab) => set({ activeTab: tab }),
			toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
			setMethod: (method) => set({ method }),
			setUrl: (url) => set({ url }),
			setHeadersText: (text) => set({ headersText: text }),
			setBodyText: (text) => set({ bodyText: text }),
			setParamsText: (text) => set({ paramsText: text }),
			setAuthType: (type) => set({ authType: type }),
			setAuthValue: (value) => set({ authValue: value }),
			setPreRequestScript: (script) => set({ preRequestScript: script }),
			setTestScript: (script) => set({ testScript: script }),
			setRequestInFlight: (loading) => set({ requestInFlight: loading }),
			setLastResponse: (response) => set({ lastResponse: response }),

			addHistoryItem: (item) =>
				set((s) => ({
					history: [{ ...item, id: generateId("hist"), timestamp: Date.now() }, ...s.history].slice(
						0,
						50,
					),
				})),

			toggleFavorite: (item) =>
				set((s) => {
					const exists = s.favorites.some((f) => f.url === item.url && f.method === item.method);
					return {
						favorites: exists
							? s.favorites.filter((f) => !(f.url === item.url && f.method === item.method))
							: [...s.favorites, item],
					};
				}),

			isFavorite: (url, method) =>
				get().favorites.some((f) => f.url === url && f.method === method),

			setCollections: (collections) => set({ collections }),
			addCollection: (node) => set((s) => ({ collections: [...s.collections, node] })),

			setActiveEnv: (env) => set({ activeEnv: env }),
			setEnvs: (envs) => set({ envs }),
			setChainVar: (key, value) => set((s) => ({ chainVars: { ...s.chainVars, [key]: value } })),

			setInterceptorEnabled: (enabled) => set({ interceptorEnabled: enabled }),
			setInterceptorMode: (mode) => set({ interceptorMode: mode }),
			incrementInterceptorStat: (stat) =>
				set((s) => ({
					interceptorStats: {
						...s.interceptorStats,
						[stat]: s.interceptorStats[stat] + 1,
					},
				})),
			addInterceptorLog: (entry) =>
				set((s) => ({
					interceptorLog: [entry, ...s.interceptorLog].slice(0, 50),
				})),

			setMockRoutes: (routes) => set({ mockRoutes: routes }),
			addMockRoute: (route) => set((s) => ({ mockRoutes: [...s.mockRoutes, route] })),
			removeMockRoute: (id) =>
				set((s) => ({ mockRoutes: s.mockRoutes.filter((r) => r.id !== id) })),

			setRetryConfig: (config) =>
				set((s) => ({
					retryAttempts: config.attempts ?? s.retryAttempts,
					retryBackoff: config.backoff ?? s.retryBackoff,
					retryCodes: config.codes ?? s.retryCodes,
					retryCircuitEnabled: config.circuit ?? s.retryCircuitEnabled,
				})),

			replaceVariables: (value) => {
				const state = get();
				return value.replace(/\{\{(.*?)\}\}/g, (_, key) => {
					const trimmed = key.trim();
					if (state.envs.session[trimmed]) return state.envs.session[trimmed];
					const scoped = state.envs.scoped[state.activeEnv];
					if (scoped?.[trimmed]) return scoped[trimmed];
					if (state.envs.global[trimmed]) return state.envs.global[trimmed];
					if (state.chainVars[trimmed]) return state.chainVars[trimmed];
					return "";
				});
			},

			loadRequestFromNode: (node) => {
				if (node.type === "folder") return;
				set({
					method: node.method ?? "GET",
					url: node.url ?? "",
					headersText: node.headers ?? "",
					bodyText: node.body ?? "",
					paramsText: node.params ?? "",
				});
			},
		}),
		{
			name: "nebula-store",
			partialize: (state) => ({
				collections: state.collections,
				favorites: state.favorites,
				history: state.history,
				activeEnv: state.activeEnv,
				envs: state.envs,
				mockRoutes: state.mockRoutes,
			}),
		},
	),
);
