import { type NextRequest, NextResponse } from "next/server";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	badRequest, serverError,
} from "@/server/api";
import { proxyRequestSchema } from "@/server/api/schemas/proxy";

// Headers that should NOT be forwarded to the target
const HOP_BY_HOP = new Set([
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailers",
	"transfer-encoding",
	"upgrade",
	"host",
	"cookie",
]);

/** POST /api/proxy — execute an HTTP request server-side (CORS-free) */
export async function POST(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const data = await validateBody(request, proxyRequestSchema);
	if (isErrorResponse(data)) return data;

	// Validate URL protocol
	let targetUrl: URL;
	try {
		targetUrl = new URL(data.url);
	} catch {
		return badRequest("Invalid URL");
	}

	if (!["http:", "https:"].includes(targetUrl.protocol)) {
		return badRequest("Only HTTP and HTTPS URLs are supported");
	}

	// Block requests to localhost/internal networks in production
	if (process.env.NODE_ENV === "production") {
		const hostname = targetUrl.hostname;
		if (
			hostname === "localhost" ||
			hostname === "127.0.0.1" ||
			hostname === "0.0.0.0" ||
			hostname.startsWith("10.") ||
			hostname.startsWith("172.") ||
			hostname.startsWith("192.168.") ||
			hostname === "::1"
		) {
			return badRequest("Requests to internal networks are blocked in production");
		}
	}

	// Build forwarded headers (strip hop-by-hop)
	const forwardHeaders = new Headers();
	for (const [key, value] of Object.entries(data.headers)) {
		if (!HOP_BY_HOP.has(key.toLowerCase())) {
			forwardHeaders.set(key, value);
		}
	}

	// Add proxy identification header
	forwardHeaders.set("X-Forwarded-By", "Nebula-API-Client");

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), data.timeout);

		const startTime = performance.now();

		const response = await fetch(data.url, {
			method: data.method,
			headers: forwardHeaders,
			body: data.method !== "GET" && data.method !== "HEAD" ? data.body : null,
			signal: controller.signal,
			redirect: data.followRedirects ? "follow" : "manual",
		});

		const elapsed = Math.round(performance.now() - startTime);
		clearTimeout(timeoutId);

		// Read response body
		const responseBody = await response.text();
		const responseSize = new Blob([responseBody]).size;

		// Collect response headers
		const responseHeaders: Record<string, string> = {};
		response.headers.forEach((value, key) => {
			responseHeaders[key] = value;
		});

		return NextResponse.json({
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
			body: responseBody,
			time: elapsed,
			size: responseSize,
			redirected: response.redirected,
			finalUrl: response.url,
		});
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") {
			return NextResponse.json(
				{
					status: 0,
					statusText: "Timeout",
					headers: {},
					body: "",
					time: data.timeout,
					size: 0,
					error: `Request timed out after ${data.timeout}ms`,
				},
				{ status: 504 },
			);
		}

		const message = err instanceof Error ? err.message : "Unknown error";
		return serverError(`Proxy request failed: ${message}`);
	}
}
