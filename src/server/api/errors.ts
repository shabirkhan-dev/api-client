import { NextResponse } from "next/server";

export function badRequest(message: string, details?: unknown) {
	return NextResponse.json(
		{ error: message, ...(details ? { details } : {}) },
		{ status: 400 },
	);
}

export function notFound(resource = "Resource") {
	return NextResponse.json(
		{ error: `${resource} not found` },
		{ status: 404 },
	);
}

export function forbidden(message = "Forbidden") {
	return NextResponse.json({ error: message }, { status: 403 });
}

export function conflict(message: string) {
	return NextResponse.json({ error: message }, { status: 409 });
}

export function serverError(message = "Internal server error") {
	return NextResponse.json({ error: message }, { status: 500 });
}

export function ok<T>(data: T, status = 200) {
	return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
	return NextResponse.json(data, { status: 201 });
}

export function noContent() {
	return new NextResponse(null, { status: 204 });
}
