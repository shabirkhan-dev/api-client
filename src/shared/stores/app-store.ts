import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { generateId } from "@/shared/lib/utils";
import type { KeyValuePair } from "@/agents/http-client/types";
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
  // Theme
  themeId: string;
  setThemeId: (id: string) => void;

  // Layout
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;

  // Workspace
  activeTab: WorkspaceTab;
  sidebarOpen: boolean;

  // Active request (from collection)
  activeRequestItemId: string | null;
  activeRequestCollectionId: string | null;
  activeRequestName: string;
  requestDirty: boolean;

  // Request
  method: HttpMethod;
  url: string;
  headersText: string;
  bodyText: string;
  paramsText: string;
  
  // Headers and Params as key-value pairs (new)
  headers: KeyValuePair[];
  params: KeyValuePair[];
  
  // Auth (new system)
  authType: "none" | "bearer" | "basic" | "apikey";
  authBearerToken: string;
  authBasicUsername: string;
  authBasicPassword: string;
  apiKeyKey: string;
  apiKeyValue: string;
  apiKeyIn: "header" | "query";
  
  // Legacy auth (for migration)
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
  clearActiveRequest: () => void;
  markRequestClean: () => void;
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setHeadersText: (text: string) => void;
  setBodyText: (text: string) => void;
  setParamsText: (text: string) => void;
  
  // New key-value actions
  setHeaders: (headers: KeyValuePair[]) => void;
  setParams: (params: KeyValuePair[]) => void;
  
  // New auth actions
  setAuthType: (type: "none" | "bearer" | "basic" | "apikey") => void;
  setAuthBearerToken: (token: string) => void;
  setAuthBasicUsername: (username: string) => void;
  setAuthBasicPassword: (password: string) => void;
  setApiKeyKey: (key: string) => void;
  setApiKeyValue: (value: string) => void;
  setApiKeyIn: (location: "header" | "query") => void;
  setAuthValue: (value: string) => void; // Legacy
  
  setPreRequestScript: (script: string) => void;
  setTestScript: (script: string) => void;
  setRequestInFlight: (loading: boolean) => void;
  setLastResponse: (response: ResponseData | null) => void;

  addHistoryItem: (item: Omit<HistoryItem, "id" | "timestamp">) => void;
  clearHistory: () => void;
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
  
  // Helper to build auth header/query from auth config
  buildAuthHeaders: () => Record<string, string>;
  buildAuthQueryParams: () => Record<string, string>;
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
      themeId: "catppuccin-mocha",
      setThemeId: (id: string) => set({ themeId: id }),

      compactMode: false,
      setCompactMode: (compact: boolean) => set({ compactMode: compact }),

      activeTab: "http",
      sidebarOpen: true,
      activeRequestItemId: null,
      activeRequestCollectionId: null,
      activeRequestName: "",
      requestDirty: false,
      method: "GET",
      url: "",
      headersText: "",
      bodyText: "",
      paramsText: "",
      
      // New key-value state
      headers: [],
      params: [],
      
      // New auth state
      authType: "none",
      authBearerToken: "",
      authBasicUsername: "",
      authBasicPassword: "",
      apiKeyKey: "",
      apiKeyValue: "",
      apiKeyIn: "header",
      authValue: "", // Legacy
      
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

      clearActiveRequest: () =>
        set({
          activeRequestItemId: null,
          activeRequestCollectionId: null,
          activeRequestName: "",
          requestDirty: false,
          method: "GET",
          url: "",
          headersText: "",
          bodyText: "",
          paramsText: "",
          headers: [],
          params: [],
          authType: "none",
          authBearerToken: "",
          authBasicUsername: "",
          authBasicPassword: "",
          apiKeyKey: "",
          apiKeyValue: "",
          apiKeyIn: "header",
          authValue: "",
          preRequestScript: "",
          testScript: "",
          lastResponse: null,
        }),

      markRequestClean: () => set({ requestDirty: false }),

      setMethod: (method) => set({ method, requestDirty: true }),
      setUrl: (url) => set({ url, requestDirty: true }),
      setHeadersText: (text) => set({ headersText: text, requestDirty: true }),
      setBodyText: (text) => set({ bodyText: text, requestDirty: true }),
      setParamsText: (text) => set({ paramsText: text, requestDirty: true }),
      
      // New key-value actions
      setHeaders: (headers) => set({ headers, requestDirty: true }),
      setParams: (params) => set({ params, requestDirty: true }),
      
      // New auth actions
      setAuthType: (type) => set({ authType: type, requestDirty: true }),
      setAuthBearerToken: (token) => set({ authBearerToken: token, requestDirty: true }),
      setAuthBasicUsername: (username) => set({ authBasicUsername: username, requestDirty: true }),
      setAuthBasicPassword: (password) => set({ authBasicPassword: password, requestDirty: true }),
      setApiKeyKey: (key) => set({ apiKeyKey: key, requestDirty: true }),
      setApiKeyValue: (value) => set({ apiKeyValue: value, requestDirty: true }),
      setApiKeyIn: (location) => set({ apiKeyIn: location, requestDirty: true }),
      setAuthValue: (value) => set({ authValue: value, requestDirty: true }),
      
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
      
      clearHistory: () => set({ history: [] }),

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
          return `{{${trimmed}}}`; // Keep the placeholder if not found
        });
      },

      buildAuthHeaders: () => {
        const state = get();
        const headers: Record<string, string> = {};
        
        switch (state.authType) {
          case "bearer":
            if (state.authBearerToken) {
              headers.Authorization = `Bearer ${state.replaceVariables(state.authBearerToken)}`;
            }
            break;
          case "basic":
            if (state.authBasicUsername || state.authBasicPassword) {
              const username = state.replaceVariables(state.authBasicUsername);
              const password = state.replaceVariables(state.authBasicPassword);
              headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
            }
            break;
          case "apikey":
            if (state.apiKeyKey && state.apiKeyValue && state.apiKeyIn === "header") {
              headers[state.apiKeyKey] = state.replaceVariables(state.apiKeyValue);
            }
            break;
        }
        
        return headers;
      },

      buildAuthQueryParams: () => {
        const state = get();
        const params: Record<string, string> = {};
        
        if (state.authType === "apikey" && state.apiKeyIn === "query" && state.apiKeyKey && state.apiKeyValue) {
          params[state.apiKeyKey] = state.replaceVariables(state.apiKeyValue);
        }
        
        return params;
      },

      loadRequestFromNode: (node) => {
        if (node.type === "folder") return;
        set({
          activeRequestItemId: node.serverItemId ?? null,
          activeRequestCollectionId: node.serverCollectionId ?? null,
          activeRequestName: node.name,
          requestDirty: false,
          method: node.method ?? "GET",
          url: node.url ?? "",
          headersText: node.headers ?? "",
          bodyText: node.body ?? "",
          paramsText: node.params ?? "",
          authType: "none",
          authBearerToken: "",
          authBasicUsername: "",
          authBasicPassword: "",
          apiKeyKey: "",
          apiKeyValue: "",
          apiKeyIn: "header",
          authValue: "",
          lastResponse: null,
          activeTab: "http",
        });
      },
    }),
    {
      name: "nebula-store",
      partialize: (state) => ({
        themeId: state.themeId,
        compactMode: state.compactMode,
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
