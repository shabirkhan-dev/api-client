"use client";

import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";

const methodStyles: Record<HttpMethod, string> = {
	GET: "bg-ctp-green/10 text-ctp-green border-ctp-green/20",
	POST: "bg-ctp-blue/10 text-ctp-blue border-ctp-blue/20",
	PUT: "bg-ctp-yellow/10 text-ctp-yellow border-ctp-yellow/20",
	DELETE: "bg-ctp-red/10 text-ctp-red border-ctp-red/20",
	PATCH: "bg-ctp-mauve/10 text-ctp-mauve border-ctp-mauve/20",
	OPTIONS: "bg-ctp-teal/10 text-ctp-teal border-ctp-teal/20",
	HEAD: "bg-ctp-peach/10 text-ctp-peach border-ctp-peach/20",
};

const fallbackStyle = "bg-ctp-overlay0/10 text-ctp-overlay0 border-ctp-overlay0/20";

const sizeStyles = {
	sm: "px-1.5 py-0.5 text-[9px]",
	md: "px-2 py-0.5 text-[10px]",
	lg: "px-2.5 py-1 text-[11px]",
};

interface MethodBadgeProps {
	method: HttpMethod;
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function MethodBadge({ method, className, size = "md" }: MethodBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center rounded-md font-bold font-mono tracking-wider border leading-none transition-colors duration-150 select-none shrink-0",
				methodStyles[method] ?? fallbackStyle,
				sizeStyles[size],
				className,
			)}
		>
			{method}
		</span>
	);
}
