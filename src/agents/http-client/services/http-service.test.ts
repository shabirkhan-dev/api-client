import { describe, expect, it } from "vitest";
import { parseCurl, parseHeaders } from "./http-service";

describe("parseHeaders", () => {
	it("parses valid JSON headers", () => {
		expect(parseHeaders('{"Content-Type":"application/json"}')).toEqual({
			"Content-Type": "application/json",
		});
	});

	it("returns empty object for invalid JSON", () => {
		expect(parseHeaders("invalid")).toEqual({});
	});

	it("returns empty object for empty string", () => {
		expect(parseHeaders("")).toEqual({});
	});

	it("returns empty object for whitespace", () => {
		expect(parseHeaders("   ")).toEqual({});
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
		expect(result.url).toBe("https://api.example.com/users");
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
});
