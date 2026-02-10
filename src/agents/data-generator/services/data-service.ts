const NAMES = [
	"Alice Johnson",
	"Bob Smith",
	"Charlie Brown",
	"Diana Prince",
	"Eve Williams",
	"Frank Miller",
	"Grace Lee",
	"Henry Chen",
];
const CITIES = ["New York", "London", "Tokyo", "Berlin", "Sydney", "Paris", "Toronto", "Mumbai"];
const DOMAINS = ["example.com", "test.org", "sample.net", "demo.io"];

const generators: Record<string, () => string> = {
	"person.fullName": () => NAMES[Math.floor(Math.random() * NAMES.length)],
	"internet.email": () =>
		`user${Math.floor(Math.random() * 9999)}@${DOMAINS[Math.floor(Math.random() * DOMAINS.length)]}`,
	"string.uuid": () =>
		"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
		}),
	"number.int": () => String(Math.floor(Math.random() * 10000)),
	"number.float": () => (Math.random() * 1000).toFixed(2),
	"lorem.sentence": () => "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
	"date.recent": () => new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
	"date.future": () => new Date(Date.now() + Math.random() * 30 * 86400000).toISOString(),
	"address.city": () => CITIES[Math.floor(Math.random() * CITIES.length)],
	"boolean.random": () => String(Math.random() > 0.5),
};

export function resolveTemplate(template: string): string {
	return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
		const gen = generators[key.trim()];
		return gen ? gen() : key.trim();
	});
}

export function generateBatch(template: string, count: number): unknown[] {
	return Array.from({ length: count }, () => {
		const resolved = resolveTemplate(template);
		try {
			return JSON.parse(resolved);
		} catch {
			return resolved;
		}
	});
}

export function getAvailableGenerators(): string[] {
	return Object.keys(generators);
}
