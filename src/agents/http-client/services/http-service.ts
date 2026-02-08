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

export async function fetchWithRetry(
	url: string,
	options: RequestInit,
	retryConfig: RetryConfig,
): Promise<{ response: Response; time: number }> {
	let attempt = 0;
	while (attempt < retryConfig.attempts) {
		if (retryState.paused) {
			throw new Error("Circuit breaker paused");
		}
		try {
			const start = performance.now();
			const response = await fetch(url, options);
			const time = performance.now() - start;
			if (retryConfig.codes.includes(response.status) && attempt < retryConfig.attempts - 1) {
				attempt += 1;
				await new Promise((r) => setTimeout(r, retryConfig.backoff * attempt));
				continue;
			}
			retryState.failures = 0;
			return { response, time };
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

export async function performHttpRequest(
	options: FetchOptions,
	retryConfig: RetryConfig,
): Promise<ResponseData> {
	const { response, time } = await fetchWithRetry(
		options.url,
		{
			method: options.method,
			headers: options.headers,
			body: options.body && options.method !== "GET" ? options.body : null,
		},
		retryConfig,
	);

	const headersObj: Record<string, string> = {};
	response.headers.forEach((value, key) => {
		headersObj[key] = value;
	});

	const text = await response.text();
	const size = new Blob([text]).size;

	return {
		status: response.status,
		statusText: response.statusText,
		body: text,
		headers: headersObj,
		time: Math.round(time),
		size,
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
