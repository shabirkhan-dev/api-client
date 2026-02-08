import { describe, expect, it } from "vitest";
import { parseCurl, parseHeaders, resetCircuitBreaker } from "./http-service";

describe("parseHeaders", () => {
	it("parses valid JSON headers", () => {
		expect(parseHeaders('{"Content-Type":"application/json"}')).toEqual({
			"Content-Type": "application/json",
		});
	});

	it("returns empty for invalid JSON", () => {
		expect(parseHeaders("invalid")).toEqual({});
	});

	it("returns empty for empty string", () => {
		expect(parseHeaders("")).toEqual({});
	});

	it("returns empty for whitespace", () => {
		expect(parseHeaders("   ")).toEqual({});
	});

	it("parses complex headers", () => {
		const headers = parseHeaders('{"Authorization":"Bearer token","X-Custom":"value"}');
		expect(headers.Authorization).toBe("Bearer token");
		expect(headers["X-Custom"]).toBe("value");
	});
});

describe("parseCurl", () => {
	it("parses basic GET curl", () => {
		const result = parseCurl("curl https://api.example.com/users");
		expect(result.url).toBe("https://api.example.com/users");
		expect(result.method).toBe("GET");
	});

	it("parses curl with method", () => {
		const result = parseCurl("curl -X POST https://api.example.com/users");
		expect(result.method).toBe("POST");
	});

	it("parses curl with headers", () => {
		const result = parseCurl("curl https://api.example.com -H 'Authorization: Bearer token123'");
		expect(result.headers.Authorization).toBe("Bearer token123");
	});

	it("parses curl with data", () => {
		const result = parseCurl('curl -X POST https://api.example.com --data \'{"name":"test"}\'');
		expect(result.body).toBe('{"name":"test"}');
	});

	it("handles empty curl", () => {
		const result = parseCurl("");
		expect(result.url).toBe("");
		expect(result.method).toBe("GET");
	});

	it("parses curl with multiple headers", () => {
		const result = parseCurl(
			"curl https://api.example.com -H 'Content-Type: application/json' -H 'Authorization: Bearer token'",
		);
		expect(result.headers["Content-Type"]).toBe("application/json");
		expect(result.headers.Authorization).toBe("Bearer token");
	});

	it("parses DELETE method", () => {
		const result = parseCurl("curl -X DELETE https://api.example.com/users/1");
		expect(result.method).toBe("DELETE");
	});

	it("parses PUT with body", () => {
		const result = parseCurl("curl -X PUT https://api.example.com --data '{\"updated\":true}'");
		expect(result.method).toBe("PUT");
		expect(result.body).toContain("updated");
	});
});

describe("resetCircuitBreaker", () => {
	it("can be called without error", () => {
		expect(() => resetCircuitBreaker()).not.toThrow();
	});
});
