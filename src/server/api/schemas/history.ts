import { z } from "zod";

export const createHistorySchema = z.object({
	workspaceId: z.string().min(1),
	method: z.string().min(1).max(10),
	url: z.string().min(1).max(4000),
	status: z.number().int().optional(),
	statusText: z.string().max(100).optional(),
	responseTime: z.number().int().min(0).optional(),
	responseSize: z.number().int().min(0).optional(),
	requestHeaders: z.record(z.string(), z.string()).optional(),
	requestBody: z.string().optional(),
	responseHeaders: z.record(z.string(), z.string()).optional(),
	responseBody: z.string().optional(),
});
