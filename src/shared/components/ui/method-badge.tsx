"use client";

import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";

const methodClasses: Record<HttpMethod, string> = {
	GET: "bg-ctp-green/15 text-ctp-green",
	POST: "bg-ctp-blue/15 text-ctp-blue",
	PUT: "bg-ctp-yellow/15 text-ctp-yellow",
	DELETE: "bg-ctp-red/15 text-ctp-red",
	PATCH: "bg-ctp-mauve/15 text-ctp-mauve",
	OPTIONS: "bg-ctp-teal/15 text-ctp-teal",
	HEAD: "bg-ctp-peach/15 text-ctp-peach",
};

interface MethodBadgeProps {
	method: HttpMethod;
	className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold font-mono",
				methodClasses[method] ?? "bg-ctp-overlay0/15 text-ctp-overlay0",
				className,
			)}
		>
			{method}
		</span>
	);
}
