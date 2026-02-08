"use client";

import { cn } from "@/shared/lib/utils";
import type { HTMLAttributes } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
	solid?: boolean;
}

export function GlassPanel({ className, solid, children, ...props }: GlassPanelProps) {
	return (
		<div className={cn(solid ? "glass-solid" : "glass", "rounded-xl", className)} {...props}>
			{children}
		</div>
	);
}
