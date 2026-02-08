"use client";

import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";

const methodStyles: Record<HttpMethod, string> = {
	GET: "bg-ctp-green/12 text-ctp-green border-ctp-green/15",
	POST: "bg-ctp-blue/12 text-ctp-blue border-ctp-blue/15",
	PUT: "bg-ctp-yellow/12 text-ctp-yellow border-ctp-yellow/15",
	DELETE: "bg-ctp-red/12 text-ctp-red border-ctp-red/15",
	PATCH: "bg-ctp-mauve/12 text-ctp-mauve border-ctp-mauve/15",
	OPTIONS: "bg-ctp-teal/12 text-ctp-teal border-ctp-teal/15",
	HEAD: "bg-ctp-peach/12 text-ctp-peach border-ctp-peach/15",
};

export function MethodBadge({ method, className }: { method: HttpMethod; className?: string }) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded px-1.5 py-px text-[9px] font-bold font-mono tracking-wider border",
				methodStyles[method] ?? "bg-ctp-overlay0/12 text-ctp-overlay0",
				className,
			)}
		>
			{method}
		</span>
	);
}
