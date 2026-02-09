import { type NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { badRequest } from "./errors";

/**
 * Parse and validate the JSON body of a request against a Zod schema.
 * Returns the validated data or a 400 error response.
 */
export async function validateBody<T extends z.ZodType>(
	request: NextRequest,
	schema: T,
): Promise<z.infer<T> | NextResponse> {
	try {
		const body = await request.json();
		const result = schema.safeParse(body);

		if (!result.success) {
			const issues = result.error.issues.map((i) => ({
				path: i.path.join("."),
				message: i.message,
			}));
			return badRequest("Validation failed", issues);
		}

		return result.data;
	} catch {
		return badRequest("Invalid JSON body");
	}
}

/** Type guard: true when result is a NextResponse (i.e. validation/auth failed) */
export function isErrorResponse(
	result: unknown,
): result is NextResponse {
	return result instanceof NextResponse;
}
