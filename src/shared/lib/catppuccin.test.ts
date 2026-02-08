import { describe, expect, it } from "vitest";
import { catppuccin, getStatusClass, getStatusColor, methodColors } from "./catppuccin";

describe("catppuccin", () => {
	it("has correct base color", () => {
		expect(catppuccin.base).toBe("#1e1e2e");
	});

	it("has correct text color", () => {
		expect(catppuccin.text).toBe("#cdd6f4");
	});

	it("has correct lavender color", () => {
		expect(catppuccin.lavender).toBe("#b4befe");
	});

	it("has all expected colors", () => {
		expect(Object.keys(catppuccin)).toContain("crust");
		expect(Object.keys(catppuccin)).toContain("green");
		expect(Object.keys(catppuccin)).toContain("red");
		expect(Object.keys(catppuccin)).toContain("mauve");
	});
});

describe("methodColors", () => {
	it("maps GET to green", () => {
		expect(methodColors.GET).toBe(catppuccin.green);
	});

	it("maps POST to blue", () => {
		expect(methodColors.POST).toBe(catppuccin.blue);
	});

	it("maps DELETE to red", () => {
		expect(methodColors.DELETE).toBe(catppuccin.red);
	});

	it("has all HTTP methods", () => {
		expect(Object.keys(methodColors)).toEqual(
			expect.arrayContaining(["GET", "POST", "PUT", "DELETE", "PATCH"]),
		);
	});
});

describe("getStatusColor", () => {
	it("returns green for 2xx", () => {
		expect(getStatusColor(200)).toBe(catppuccin.green);
		expect(getStatusColor(201)).toBe(catppuccin.green);
	});

	it("returns yellow for 3xx", () => {
		expect(getStatusColor(301)).toBe(catppuccin.yellow);
	});

	it("returns peach for 4xx", () => {
		expect(getStatusColor(404)).toBe(catppuccin.peach);
	});

	it("returns red for 5xx", () => {
		expect(getStatusColor(500)).toBe(catppuccin.red);
	});

	it("returns overlay0 for unknown", () => {
		expect(getStatusColor(0)).toBe(catppuccin.overlay0);
	});
});

describe("getStatusClass", () => {
	it("returns correct classes for different status ranges", () => {
		expect(getStatusClass(200)).toBe("text-ctp-green");
		expect(getStatusClass(301)).toBe("text-ctp-yellow");
		expect(getStatusClass(404)).toBe("text-ctp-peach");
		expect(getStatusClass(500)).toBe("text-ctp-red");
		expect(getStatusClass(0)).toBe("text-ctp-overlay0");
	});
});
