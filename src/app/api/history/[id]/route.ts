import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	ok, notFound, forbidden, noContent, serverError,
} from "@/server/api";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/history/[id] — toggle favorite */
export async function PATCH(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;

	try {
		const entry = await db.requestHistory.findUnique({ where: { id } });
		if (!entry) return notFound("History entry");
		if (entry.userId !== auth.userId) return forbidden();

		const updated = await db.requestHistory.update({
			where: { id },
			data: { isFavorite: !entry.isFavorite },
		});

		return ok(updated);
	} catch {
		return serverError();
	}
}

/** DELETE /api/history/[id] — delete a history entry */
export async function DELETE(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;

	try {
		const entry = await db.requestHistory.findUnique({ where: { id } });
		if (!entry) return notFound("History entry");
		if (entry.userId !== auth.userId) return forbidden();

		await db.requestHistory.delete({ where: { id } });
		return noContent();
	} catch {
		return serverError();
	}
}
