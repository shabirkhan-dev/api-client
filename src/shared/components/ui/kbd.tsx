"use client";

import { cn } from "@/shared/lib/utils";
import type { HTMLAttributes } from "react";

export function Kbd({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn(
				"inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md border border-ctp-border bg-ctp-mantle/90 text-ctp-overlay0 font-mono",
				className,
			)}
			{...props}
		/>
	);
}
