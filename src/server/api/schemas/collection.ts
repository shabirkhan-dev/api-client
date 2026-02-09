import { z } from "zod";

export const createCollectionSchema = z.object({
	workspaceId: z.string().min(1),
	name: z.string().min(1).max(200),
	description: z.string().max(1000).optional(),
});

export const updateCollectionSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	description: z.string().max(1000).nullable().optional(),
	sortOrder: z.number().int().min(0).optional(),
});

const httpMethod = z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]);

export const createCollectionItemSchema = z.object({
	collectionId: z.string().min(1),
	parentId: z.string().nullable().optional(),
	type: z.enum(["FOLDER", "REQUEST"]),
	name: z.string().min(1).max(200),
	method: httpMethod.optional(),
	url: z.string().max(4000).optional(),
	headers: z.record(z.string(), z.string()).optional(),
	body: z.string().optional(),
	params: z.string().optional(),
	auth: z.record(z.string(), z.unknown()).optional(),
});

export const updateCollectionItemSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	sortOrder: z.number().int().min(0).optional(),
	parentId: z.string().nullable().optional(),
	method: httpMethod.optional(),
	url: z.string().max(4000).optional(),
	headers: z.record(z.string(), z.string()).optional(),
	body: z.string().optional(),
	params: z.string().optional(),
	auth: z.record(z.string(), z.unknown()).optional(),
});
