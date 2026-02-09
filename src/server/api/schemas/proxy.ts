import { z } from "zod";

export const proxyRequestSchema = z.object({
	method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]),
	url: z.string().min(1).max(8000),
	headers: z.record(z.string(), z.string()).default({}),
	body: z.string().nullable().default(null),
	timeout: z.number().int().min(0).max(300000).default(30000), // max 5 min
	followRedirects: z.boolean().default(true),
});
