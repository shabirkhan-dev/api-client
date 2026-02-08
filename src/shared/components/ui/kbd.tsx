"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export function Kbd({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn(
				"inline-flex items-center text-[9px] px-1.5 py-0.5 rounded border border-ctp-surface1/40 bg-ctp-mantle/70 text-ctp-subtext0 font-mono leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
				className,
			)}
			{...props}
		/>
	);
}
