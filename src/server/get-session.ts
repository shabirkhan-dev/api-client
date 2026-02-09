import { headers } from "next/headers";
import { auth } from "@/server/auth";

/**
 * Get the current user session from the request headers.
 * Use in Server Components and API route handlers.
 */
export async function getServerSession() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session;
}
