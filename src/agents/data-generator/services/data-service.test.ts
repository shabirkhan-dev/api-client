import { describe, expect, it } from "vitest";
import { generateBatch, getAvailableGenerators, resolveTemplate } from "./data-service";

describe("resolveTemplate", () => {
	it("resolves person.fullName", () => {
		const result = resolveTemplate("{{person.fullName}}");
		expect(result.length).toBeGreaterThan(0);
		expect(result).not.toBe("{{person.fullName}}");
	});

	it("resolves internet.email", () => {
		const result = resolveTemplate("{{internet.email}}");
		expect(result).toContain("@");
	});

	it("resolves string.uuid", () => {
		const result = resolveTemplate("{{string.uuid}}");
		expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
	});

	it("resolves number.int as a number string", () => {
		const result = resolveTemplate("{{number.int}}");
		expect(Number.isNaN(Number(result))).toBe(false);
	});

	it("keeps unknown placeholders as literal", () => {
		const result = resolveTemplate("{{unknown.key}}");
		expect(result).toBe("unknown.key");
	});

	it("resolves multiple placeholders in one template", () => {
		const result = resolveTemplate("{{person.fullName}} <{{internet.email}}>");
		expect(result).toContain("@");
		expect(result).toContain("<");
	});

	it("resolves boolean.random", () => {
		const result = resolveTemplate("{{boolean.random}}");
		expect(["true", "false"]).toContain(result);
	});

	it("resolves address.city", () => {
		const result = resolveTemplate("{{address.city}}");
		expect(result.length).toBeGreaterThan(0);
	});
});

describe("generateBatch", () => {
	it("generates correct number of items", () => {
		const result = generateBatch('{"name":"{{person.fullName}}"}', 5);
		expect(result).toHaveLength(5);
	});

	it("parses JSON templates", () => {
		const result = generateBatch('{"id":"{{string.uuid}}"}', 1);
		expect(typeof result[0]).toBe("object");
	});

	it("returns strings for non-JSON templates", () => {
		const result = generateBatch("Hello {{person.fullName}}", 1);
		expect(typeof result[0]).toBe("string");
	});

	it("each item is unique (with high probability)", () => {
		const result = generateBatch('{"id":"{{string.uuid}}"}', 10);
		const ids = result.map((r) => (r as { id: string }).id);
		const unique = new Set(ids);
		expect(unique.size).toBe(10);
	});
});

describe("getAvailableGenerators", () => {
	it("returns an array of generator names", () => {
		const gens = getAvailableGenerators();
		expect(gens.length).toBeGreaterThan(5);
		expect(gens).toContain("person.fullName");
		expect(gens).toContain("string.uuid");
		expect(gens).toContain("internet.email");
	});
});
