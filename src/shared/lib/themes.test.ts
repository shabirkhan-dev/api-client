import { describe, expect, it } from "vitest";
import { getThemeById, themes } from "./themes";

describe("themes", () => {
	it("has at least 4 themes", () => {
		expect(themes.length).toBeGreaterThanOrEqual(4);
	});

	it("each theme has required fields", () => {
		for (const theme of themes) {
			expect(theme.id).toBeTruthy();
			expect(theme.name).toBeTruthy();
			expect(typeof theme.isDark).toBe("boolean");
			expect(theme.colors).toBeTruthy();
			expect(theme.colors.base).toBeTruthy();
			expect(theme.colors.text).toBeTruthy();
			expect(theme.colors.lavender).toBeTruthy();
		}
	});

	it("has a light theme", () => {
		expect(themes.some((t) => !t.isDark)).toBe(true);
	});

	it("has catppuccin mocha as first theme", () => {
		expect(themes[0].id).toBe("catppuccin-mocha");
	});

	it("includes all expected theme variants", () => {
		const ids = themes.map((t) => t.id);
		expect(ids).toContain("catppuccin-mocha");
		expect(ids).toContain("catppuccin-latte");
		expect(ids).toContain("tokyo-night");
		expect(ids).toContain("nord");
	});

	it("all colors are valid hex values", () => {
		for (const theme of themes) {
			for (const [_key, value] of Object.entries(theme.colors)) {
				expect(value).toMatch(/^#[0-9a-f]{6}$/i);
			}
		}
	});
});

describe("getThemeById", () => {
	it("returns correct theme by id", () => {
		expect(getThemeById("catppuccin-mocha").name).toBe("Catppuccin Mocha");
		expect(getThemeById("nord").name).toBe("Nord");
	});

	it("returns first theme for unknown id", () => {
		expect(getThemeById("nonexistent").id).toBe("catppuccin-mocha");
	});

	it("returns latte for light theme", () => {
		expect(getThemeById("catppuccin-latte").isDark).toBe(false);
	});
});
