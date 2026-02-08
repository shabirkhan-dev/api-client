/** Catppuccin Mocha color palette */
export const catppuccin = {
	crust: "#11111b",
	base: "#1e1e2e",
	mantle: "#181825",
	surface0: "#313244",
	surface1: "#45475a",
	surface2: "#585b70",
	overlay0: "#6c7086",
	overlay1: "#7f849c",
	overlay2: "#9399b2",
	subtext0: "#a6adc8",
	subtext1: "#bac2de",
	text: "#cdd6f4",
	lavender: "#b4befe",
	blue: "#89b4fa",
	sapphire: "#74c7ec",
	sky: "#89dceb",
	teal: "#94e2d5",
	green: "#a6e3a1",
	yellow: "#f9e2af",
	peach: "#fab387",
	maroon: "#eba0ac",
	red: "#f38ba8",
	mauve: "#cba6f7",
	pink: "#f5c2e7",
	flamingo: "#f2cdcd",
	rosewater: "#f5e0dc",
} as const;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

export const methodColors: Record<HttpMethod, string> = {
	GET: catppuccin.green,
	POST: catppuccin.blue,
	PUT: catppuccin.yellow,
	DELETE: catppuccin.red,
	PATCH: catppuccin.mauve,
	OPTIONS: catppuccin.teal,
	HEAD: catppuccin.peach,
};

export function getStatusColor(status: number): string {
	if (status >= 200 && status < 300) return catppuccin.green;
	if (status >= 300 && status < 400) return catppuccin.yellow;
	if (status >= 400 && status < 500) return catppuccin.peach;
	if (status >= 500) return catppuccin.red;
	return catppuccin.overlay0;
}

export function getStatusClass(status: number): string {
	if (status >= 200 && status < 300) return "text-ctp-green";
	if (status >= 300 && status < 400) return "text-ctp-yellow";
	if (status >= 400 && status < 500) return "text-ctp-peach";
	if (status >= 500) return "text-ctp-red";
	return "text-ctp-overlay0";
}
