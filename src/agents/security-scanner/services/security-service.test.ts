import { describe, expect, it } from "vitest";
import { analyzeHeaders, decodeJwt, detectSensitiveData } from "./security-service";

describe("decodeJwt", () => {
	// A valid JWT with header: {"alg":"HS256","typ":"JWT"}, payload: {"sub":"1234567890","name":"John","iat":1516239022}
	const validToken =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

	it("decodes a valid JWT", () => {
		const result = decodeJwt(validToken);
		expect(result.header.alg).toBe("HS256");
		expect(result.payload.name).toBe("John");
		expect(result.payload.sub).toBe("1234567890");
	});

	it("detects non-expired token without exp claim", () => {
		const result = decodeJwt(validToken);
		expect(result.expired).toBe(false);
		expect(result.expiresAt).toBeNull();
	});

	it("throws for invalid JWT", () => {
		expect(() => decodeJwt("not-a-jwt")).toThrow("Invalid JWT format");
	});

	it("throws for single part token", () => {
		expect(() => decodeJwt("onlyone")).toThrow("Invalid JWT format");
	});

	it("detects expired token", () => {
		// Token with exp: 1 (Jan 1, 1970)
		const expiredPayload = btoa(JSON.stringify({ exp: 1 }));
		const header = btoa(JSON.stringify({ alg: "HS256" }));
		const token = `${header}.${expiredPayload}.sig`;
		const result = decodeJwt(token);
		expect(result.expired).toBe(true);
	});

	it("detects future expiry", () => {
		const futureExp = Math.floor(Date.now() / 1000) + 3600;
		const header = btoa(JSON.stringify({ alg: "HS256" }));
		const payload = btoa(JSON.stringify({ exp: futureExp }));
		const token = `${header}.${payload}.sig`;
		const result = decodeJwt(token);
		expect(result.expired).toBe(false);
		expect(result.expiresAt).toBeTruthy();
	});
});

describe("analyzeHeaders", () => {
	it("detects present headers", () => {
		const result = analyzeHeaders({
			"x-frame-options": "DENY",
			"content-security-policy": "default-src 'self'",
		});
		expect(result.find((h) => h.name === "x-frame-options")?.present).toBe(true);
		expect(result.find((h) => h.name === "content-security-policy")?.present).toBe(true);
	});

	it("detects missing headers", () => {
		const result = analyzeHeaders({});
		expect(result.every((h) => !h.present)).toBe(true);
	});

	it("checks all 6 security headers", () => {
		const result = analyzeHeaders({});
		expect(result.length).toBe(6);
	});
});

describe("detectSensitiveData", () => {
	it("detects password in body", () => {
		expect(detectSensitiveData('{"password":"secret123"}')).toContain("password");
	});

	it("detects api key pattern", () => {
		expect(detectSensitiveData("api_key=abc123")).toContain("api_key");
	});

	it("returns empty for safe data", () => {
		expect(detectSensitiveData('{"name":"John","age":30}')).toEqual([]);
	});

	it("detects credit card pattern", () => {
		expect(detectSensitiveData("card: 4111-1111-1111-1111")).toContain("credit_card");
	});

	it("detects multiple patterns", () => {
		const result = detectSensitiveData("password=123&api_key=abc&secret=xyz");
		expect(result).toContain("password");
		expect(result).toContain("api_key");
		expect(result).toContain("secret");
	});
});
