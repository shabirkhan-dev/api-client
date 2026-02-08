import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function escapeHtml(str: string): string {
	const map: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#039;",
	};
	return str.replace(/[&<>"']/g, (m) => map[m] ?? m);
}

export function downloadFile(content: string, filename: string, type = "text/plain") {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, wait = 250) {
	let timer: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), wait);
	};
}

export function generateId(prefix = "id"): string {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function parseKeyValue(text: string): Record<string, string> {
	const lines = text.split("\n").filter(Boolean);
	const params: Record<string, string> = {};
	for (const line of lines) {
		const [key, ...rest] = line.split("=");
		if (key) {
			params[key.trim()] = rest.join("=").trim();
		}
	}
	return params;
}
