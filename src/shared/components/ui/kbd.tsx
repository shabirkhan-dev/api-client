"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export function Kbd({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn(
				"inline-flex items-center text-[10px] px-2 py-0.5 rounded border border-ctp-surface0/40 bg-ctp-mantle/50 text-ctp-overlay1 font-mono leading-none shadow-[inset_0_-1px_0_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.03)] select-none",
				className,
			)}
			{...props}
		/>
	);
}
