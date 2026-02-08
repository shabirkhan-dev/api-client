"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
	solid?: boolean;
	hover?: boolean;
}

export function GlassPanel({
	className,
	solid,
	hover = true,
	children,
	...props
}: GlassPanelProps) {
	return (
		<div
			className={cn(
				solid ? "glass-solid" : "glass",
				"rounded-xl",
				!hover && "hover:border-transparent",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
