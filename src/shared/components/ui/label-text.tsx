"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export function LabelText({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"text-[11px] uppercase tracking-widest text-ctp-subtext0 font-semibold",
				className,
			)}
			{...props}
		/>
	);
}
