import { describe, expect, it } from "vitest";
import { cn, debounce, escapeHtml, formatBytes, generateId, parseKeyValue } from "./utils";

describe("cn", () => {
	it("merges class names correctly", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("handles conditional classes", () => {
		expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
	});

	it("deduplicates tailwind classes", () => {
		expect(cn("p-2", "p-4")).toBe("p-4");
	});
});

describe("escapeHtml", () => {
	it("escapes HTML entities", () => {
		expect(escapeHtml('<div class="test">')).toBe("&lt;div class=&quot;test&quot;&gt;");
	});

	it("escapes ampersand", () => {
		expect(escapeHtml("a & b")).toBe("a &amp; b");
	});

	it("escapes single quotes", () => {
		expect(escapeHtml("it's")).toBe("it&#039;s");
	});

	it("handles empty string", () => {
		expect(escapeHtml("")).toBe("");
	});
});

describe("generateId", () => {
	it("generates unique IDs with prefix", () => {
		const id1 = generateId("test");
		const id2 = generateId("test");
		expect(id1).toMatch(/^test-/);
		expect(id2).toMatch(/^test-/);
		expect(id1).not.toBe(id2);
	});

	it("uses default prefix", () => {
		expect(generateId()).toMatch(/^id-/);
	});
});

describe("formatBytes", () => {
	it("formats bytes", () => {
		expect(formatBytes(500)).toBe("500 B");
	});

	it("formats kilobytes", () => {
		expect(formatBytes(1500)).toBe("1.46 KB");
	});

	it("formats megabytes", () => {
		expect(formatBytes(1500000)).toBe("1.43 MB");
	});
});

describe("parseKeyValue", () => {
	it("parses key-value pairs", () => {
		expect(parseKeyValue("page=1\nlimit=25")).toEqual({
			page: "1",
			limit: "25",
		});
	});

	it("handles values with equals signs", () => {
		expect(parseKeyValue("filter=a=b")).toEqual({ filter: "a=b" });
	});

	it("handles empty input", () => {
		expect(parseKeyValue("")).toEqual({});
	});

	it("skips empty lines", () => {
		expect(parseKeyValue("page=1\n\nlimit=25")).toEqual({
			page: "1",
			limit: "25",
		});
	});
});

describe("debounce", () => {
	it("delays function execution", async () => {
		let count = 0;
		const fn = debounce(() => {
			count += 1;
		}, 50);

		fn();
		fn();
		fn();

		expect(count).toBe(0);

		await new Promise((r) => setTimeout(r, 100));
		expect(count).toBe(1);
	});
});
