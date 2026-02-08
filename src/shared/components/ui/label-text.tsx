"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export function LabelText({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"text-[10px] uppercase tracking-[0.08em] text-ctp-overlay0 font-semibold",
				className,
			)}
			{...props}
		/>
	);
}
