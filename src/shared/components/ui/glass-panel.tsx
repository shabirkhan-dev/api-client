"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
	solid?: boolean;
	hover?: boolean;
	subtle?: boolean;
	noPadding?: boolean;
}

export function GlassPanel({
	className,
	solid,
	hover = true,
	subtle,
	noPadding,
	children,
	...props
}: GlassPanelProps) {
	const base = subtle
		? "bg-ctp-surface0/18 border border-ctp-surface1/12 transition-[background,border-color] duration-[180ms] ease-out hover:bg-ctp-surface0/28 hover:border-ctp-surface1/22"
		: solid
			? "bg-gradient-to-b from-ctp-mantle/94 to-ctp-crust/92 backdrop-blur-[20px] backdrop-saturate-[1.3] border border-ctp-surface1/22 shadow-[0_6px_20px_-14px_rgba(0,0,0,0.55)]"
			: "bg-gradient-to-b from-ctp-base/72 to-ctp-mantle/82 backdrop-blur-[20px] backdrop-saturate-[1.4] border border-ctp-surface1/18 shadow-[0_0_0_0.5px_inset] shadow-ctp-lavender/5 transition-[border-color,box-shadow] duration-200 ease-out hover:border-ctp-surface1/30";

	return (
		<div
			className={cn(
				base,
				"rounded-[var(--radius-xl)]",
				!noPadding && "p-4",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
