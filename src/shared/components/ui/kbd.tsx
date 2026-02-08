"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export function Kbd({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn(
				"inline-flex items-center text-[9px] px-1 py-px rounded border border-ctp-surface0/60 bg-ctp-mantle/80 text-ctp-overlay0 font-mono leading-none",
				className,
			)}
			{...props}
		/>
	);
}
