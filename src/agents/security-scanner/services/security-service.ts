export interface JwtDecoded {
	header: Record<string, unknown>;
	payload: Record<string, unknown>;
	expired: boolean;
	expiresAt: string | null;
}

export function decodeJwt(token: string): JwtDecoded {
	const parts = token.split(".");
	if (parts.length < 2) throw new Error("Invalid JWT format: expected at least 2 parts");

	const decode = (part: string): Record<string, unknown> => {
		const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
		return JSON.parse(atob(base64));
	};

	const header = decode(parts[0]);
	const payload = decode(parts[1]);

	const now = Math.floor(Date.now() / 1000);
	const exp = typeof payload.exp === "number" ? payload.exp : null;
	const expired = exp !== null ? exp < now : false;
	const expiresAt = exp !== null ? new Date(exp * 1000).toISOString() : null;

	return { header, payload, expired, expiresAt };
}

export interface SecurityHeader {
	name: string;
	present: boolean;
	value?: string;
}

export function analyzeHeaders(headers: Record<string, string>): SecurityHeader[] {
	const checks = [
		"content-security-policy",
		"x-frame-options",
		"x-content-type-options",
		"strict-transport-security",
		"x-xss-protection",
		"referrer-policy",
	];

	return checks.map((name) => ({
		name,
		present: name in headers,
		value: headers[name],
	}));
}

export function detectSensitiveData(body: string): string[] {
	const patterns = [
		{ name: "password", regex: /password/i },
		{ name: "secret", regex: /secret/i },
		{ name: "api_key", regex: /api[_-]?key/i },
		{ name: "token", regex: /token/i },
		{ name: "private_key", regex: /private[_-]?key/i },
		{ name: "credit_card", regex: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/ },
	];

	return patterns.filter((p) => p.regex.test(body)).map((p) => p.name);
}
