import type { ResponseData } from "@/shared/types";

export interface FetchOptions {
	method: string;
	url: string;
	headers: Record<string, string>;
	body: string | null;
}

export interface RetryConfig {
	attempts: number;
	backoff: number;
	codes: number[];
	circuit: boolean;
}

interface RetryState {
	failures: number;
	paused: boolean;
}

const retryState: RetryState = { failures: 0, paused: false };

export function resetCircuitBreaker() {
	retryState.failures = 0;
	retryState.paused = false;
}

/** Proxy response shape returned by /api/proxy */
interface ProxyResponse {
	status: number;
	statusText: string;
	headers: Record<string, string>;
	body: string;
	time: number;
	size: number;
	redirected?: boolean;
	finalUrl?: string;
	error?: string;
}

/**
 * Send a request through the server-side proxy (/api/proxy).
 * This avoids CORS restrictions by executing the request on the server.
 */
async function proxyFetch(
	options: FetchOptions,
	timeout = 30000,
): Promise<ProxyResponse> {
	const res = await fetch("/api/proxy", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			method: options.method,
			url: options.url,
			headers: options.headers,
			body: options.body,
			timeout,
		}),
	});

	if (!res.ok && res.status !== 504) {
		const err = await res.json().catch(() => ({ error: "Proxy request failed" }));
		throw new Error(err.error ?? `Proxy returned ${res.status}`);
	}

	return res.json();
}

/** Retry wrapper around proxyFetch */
async function proxyFetchWithRetry(
	options: FetchOptions,
	retryConfig: RetryConfig,
): Promise<ProxyResponse> {
	let attempt = 0;

	while (attempt < retryConfig.attempts) {
		if (retryState.paused) {
			throw new Error("Circuit breaker paused");
		}

		try {
			const result = await proxyFetch(options);

			// If status matches retry codes and we have retries left, retry
			if (
				retryConfig.codes.includes(result.status) &&
				attempt < retryConfig.attempts - 1
			) {
				attempt += 1;
				await new Promise((r) => setTimeout(r, retryConfig.backoff * attempt));
				continue;
			}

			retryState.failures = 0;
			return result;
		} catch (err) {
			retryState.failures += 1;
			if (retryConfig.circuit && retryState.failures >= retryConfig.attempts) {
				retryState.paused = true;
			}
			attempt += 1;
			if (attempt >= retryConfig.attempts) throw err;
			await new Promise((r) => setTimeout(r, retryConfig.backoff * attempt));
		}
	}

	throw new Error("Max retries exceeded");
}

/**
 * Execute an HTTP request through the server-side proxy with retry support.
 * All requests are routed through /api/proxy for CORS-free execution.
 */
export async function performHttpRequest(
	options: FetchOptions,
	retryConfig: RetryConfig,
): Promise<ResponseData> {
	const result = await proxyFetchWithRetry(options, retryConfig);

	return {
		status: result.status,
		statusText: result.statusText,
		body: result.body,
		headers: result.headers,
		time: result.time,
		size: result.size,
	};
}

export function parseHeaders(headersText: string): Record<string, string> {
	try {
		return headersText.trim() ? JSON.parse(headersText) : {};
	} catch {
		return {};
	}
}

export function parseCurl(curl: string) {
	const urlMatch = curl.match(/https?:\/\/[^\s'"]+/i);
	const methodMatch = curl.match(/-X\s+(\w+)/i);
	const headerMatches = [...curl.matchAll(/-H\s+['"]([^'"]+)['"]/gi)];
	const dataMatch =
		curl.match(/--data(?:-raw)?\s+'((?:[^'\\]|\\.)*)'/i) ||
		curl.match(/--data(?:-raw)?\s+"((?:[^"\\]|\\.)*)"/i);

	const method = methodMatch ? methodMatch[1].toUpperCase() : "GET";
	const url = urlMatch ? urlMatch[0] : "";
	const headers: Record<string, string> = {};
	for (const match of headerMatches) {
		const [key, ...rest] = match[1].split(":");
		headers[key.trim()] = rest.join(":").trim();
	}
	const body = dataMatch ? dataMatch[1] : "";

	return { method, url, headers, body };
}
