export interface ThemeColors {
	crust: string;
	base: string;
	mantle: string;
	surface0: string;
	surface1: string;
	surface2: string;
	overlay0: string;
	overlay1: string;
	subtext0: string;
	subtext1: string;
	text: string;
	lavender: string;
	blue: string;
	sapphire: string;
	teal: string;
	green: string;
	yellow: string;
	peach: string;
	red: string;
	mauve: string;
	pink: string;
}

export interface Theme {
	id: string;
	name: string;
	isDark: boolean;
	colors: ThemeColors;
}

export const themes: Theme[] = [
	{
		id: "catppuccin-mocha",
		name: "Catppuccin Mocha",
		isDark: true,
		colors: {
			crust: "#11111b",
			base: "#1e1e2e",
			mantle: "#181825",
			surface0: "#313244",
			surface1: "#45475a",
			surface2: "#585b70",
			overlay0: "#6c7086",
			overlay1: "#7f849c",
			subtext0: "#a6adc8",
			subtext1: "#bac2de",
			text: "#cdd6f4",
			lavender: "#b4befe",
			blue: "#89b4fa",
			sapphire: "#74c7ec",
			teal: "#94e2d5",
			green: "#a6e3a1",
			yellow: "#f9e2af",
			peach: "#fab387",
			red: "#f38ba8",
			mauve: "#cba6f7",
			pink: "#f5c2e7",
		},
	},
	{
		id: "catppuccin-macchiato",
		name: "Catppuccin Macchiato",
		isDark: true,
		colors: {
			crust: "#181926",
			base: "#24273a",
			mantle: "#1e2030",
			surface0: "#363a4f",
			surface1: "#494d64",
			surface2: "#5b6078",
			overlay0: "#6e738d",
			overlay1: "#8087a2",
			subtext0: "#a5adcb",
			subtext1: "#b8c0e0",
			text: "#cad3f5",
			lavender: "#b7bdf8",
			blue: "#8aadf4",
			sapphire: "#7dc4e4",
			teal: "#8bd5ca",
			green: "#a6da95",
			yellow: "#eed49f",
			peach: "#f5a97f",
			red: "#ed8796",
			mauve: "#c6a0f6",
			pink: "#f5bde6",
		},
	},
	{
		id: "catppuccin-frappe",
		name: "Catppuccin Frappé",
		isDark: true,
		colors: {
			crust: "#232634",
			base: "#303446",
			mantle: "#292c3c",
			surface0: "#414559",
			surface1: "#51576d",
			surface2: "#626880",
			overlay0: "#737994",
			overlay1: "#838ba7",
			subtext0: "#a5adce",
			subtext1: "#b5bfe2",
			text: "#c6d0f5",
			lavender: "#babbf1",
			blue: "#8caaee",
			sapphire: "#85c1dc",
			teal: "#81c8be",
			green: "#a6d189",
			yellow: "#e5c890",
			peach: "#ef9f76",
			red: "#e78284",
			mauve: "#ca9ee6",
			pink: "#f4b8e4",
		},
	},
	{
		id: "catppuccin-latte",
		name: "Catppuccin Latte",
		isDark: false,
		colors: {
			crust: "#dce0e8",
			base: "#eff1f5",
			mantle: "#e6e9ef",
			surface0: "#ccd0da",
			surface1: "#bcc0cc",
			surface2: "#acb0be",
			overlay0: "#9ca0b0",
			overlay1: "#8c8fa1",
			subtext0: "#6c6f85",
			subtext1: "#5c5f77",
			text: "#4c4f69",
			lavender: "#7287fd",
			blue: "#1e66f5",
			sapphire: "#209fb5",
			teal: "#179299",
			green: "#40a02b",
			yellow: "#df8e1d",
			peach: "#fe640b",
			red: "#d20f39",
			mauve: "#8839ef",
			pink: "#ea76cb",
		},
	},
	{
		id: "tokyo-night",
		name: "Tokyo Night",
		isDark: true,
		colors: {
			crust: "#16161e",
			base: "#1a1b26",
			mantle: "#1f2335",
			surface0: "#292e42",
			surface1: "#3b4261",
			surface2: "#545c7e",
			overlay0: "#565f89",
			overlay1: "#737aa2",
			subtext0: "#a9b1d6",
			subtext1: "#c0caf5",
			text: "#c0caf5",
			lavender: "#bb9af7",
			blue: "#7aa2f7",
			sapphire: "#7dcfff",
			teal: "#73daca",
			green: "#9ece6a",
			yellow: "#e0af68",
			peach: "#ff9e64",
			red: "#f7768e",
			mauve: "#bb9af7",
			pink: "#ff007c",
		},
	},
	{
		id: "nord",
		name: "Nord",
		isDark: true,
		colors: {
			crust: "#242933",
			base: "#2e3440",
			mantle: "#3b4252",
			surface0: "#434c5e",
			surface1: "#4c566a",
			surface2: "#616e88",
			overlay0: "#7b88a1",
			overlay1: "#8fbcbb",
			subtext0: "#d8dee9",
			subtext1: "#e5e9f0",
			text: "#eceff4",
			lavender: "#b48ead",
			blue: "#81a1c1",
			sapphire: "#88c0d0",
			teal: "#8fbcbb",
			green: "#a3be8c",
			yellow: "#ebcb8b",
			peach: "#d08770",
			red: "#bf616a",
			mauve: "#b48ead",
			pink: "#d08770",
		},
	},
];

export function getThemeById(id: string): Theme {
	return themes.find((t) => t.id === id) ?? themes[0];
}

export function applyTheme(theme: Theme): void {
	const root = document.documentElement;
	const c = theme.colors;

	root.style.setProperty("--ctp-crust", c.crust);
	root.style.setProperty("--ctp-base", c.base);
	root.style.setProperty("--ctp-mantle", c.mantle);
	root.style.setProperty("--ctp-surface0", c.surface0);
	root.style.setProperty("--ctp-surface1", c.surface1);
	root.style.setProperty("--ctp-surface2", c.surface2);
	root.style.setProperty("--ctp-overlay0", c.overlay0);
	root.style.setProperty("--ctp-overlay1", c.overlay1);
	root.style.setProperty("--ctp-subtext0", c.subtext0);
	root.style.setProperty("--ctp-subtext1", c.subtext1);
	root.style.setProperty("--ctp-text", c.text);
	root.style.setProperty("--ctp-lavender", c.lavender);
	root.style.setProperty("--ctp-blue", c.blue);
	root.style.setProperty("--ctp-sapphire", c.sapphire);
	root.style.setProperty("--ctp-teal", c.teal);
	root.style.setProperty("--ctp-green", c.green);
	root.style.setProperty("--ctp-yellow", c.yellow);
	root.style.setProperty("--ctp-peach", c.peach);
	root.style.setProperty("--ctp-red", c.red);
	root.style.setProperty("--ctp-mauve", c.mauve);
	root.style.setProperty("--ctp-pink", c.pink);

	root.style.setProperty("color-scheme", theme.isDark ? "dark" : "light");
}
