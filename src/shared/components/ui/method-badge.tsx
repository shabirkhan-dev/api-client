"use client";

import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";

const methodStyles: Record<HttpMethod, string> = {
	GET: "bg-ctp-green/10 text-ctp-green border-ctp-green/18",
	POST: "bg-ctp-blue/10 text-ctp-blue border-ctp-blue/18",
	PUT: "bg-ctp-yellow/10 text-ctp-yellow border-ctp-yellow/18",
	DELETE: "bg-ctp-red/10 text-ctp-red border-ctp-red/18",
	PATCH: "bg-ctp-mauve/10 text-ctp-mauve border-ctp-mauve/18",
	OPTIONS: "bg-ctp-teal/10 text-ctp-teal border-ctp-teal/18",
	HEAD: "bg-ctp-peach/10 text-ctp-peach border-ctp-peach/18",
};

const fallbackStyle = "bg-ctp-overlay0/10 text-ctp-overlay0 border-ctp-overlay0/18";

export function MethodBadge({ method, className }: { method: HttpMethod; className?: string }) {
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider border leading-none transition-colors duration-150 select-none shrink-0",
				methodStyles[method] ?? fallbackStyle,
				className,
			)}
		>
			{method}
		</span>
	);
}
