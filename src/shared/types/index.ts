import type { HttpMethod } from "@/shared/lib/catppuccin";

export interface RequestConfig {
	method: HttpMethod;
	url: string;
	headers: string;
	body: string;
	params: string;
	authType: string;
	authValue: string;
}

export interface ResponseData {
	status: number;
	statusText: string;
	body: string;
	headers: Record<string, string>;
	time: number;
	size: number;
	isMock?: boolean;
}

export interface HistoryItem {
	id: string;
	method: HttpMethod;
	url: string;
	timestamp: number;
}

export interface CollectionNode {
	id: string;
	name: string;
	type: "folder" | "request";
	method?: HttpMethod;
	url?: string;
	headers?: string;
	body?: string;
	params?: string;
	collapsed?: boolean;
	children?: CollectionNode[];
}

export interface EnvironmentStore {
	global: Record<string, string>;
	scoped: Record<string, Record<string, string>>;
	session: Record<string, string>;
}

export interface MockRoute {
	id: string;
	path: string;
	status: number;
	latency: number;
	contentType: string;
	body: string;
	condition: string;
}

export interface InterceptorLogEntry {
	method: HttpMethod;
	url: string;
	blocked: boolean;
	timestamp: number;
}

export interface LoadTestResult {
	status: number;
	time: number;
	size: string;
	timestamp: string;
}

export interface ChainNode {
	id: string;
	method: HttpMethod;
	url: string;
	label: string;
}

export interface SecurityFinding {
	type: string;
	status: "Safe" | "Warning" | "Info" | "Critical";
	detail: string;
}

export type WorkspaceTab =
	| "http"
	| "websocket"
	| "loadtest"
	| "graphql"
	| "docs"
	| "diff"
	| "chain"
	| "security"
	| "retry"
	| "data"
	| "collab"
	| "profiler"
	| "mock";
