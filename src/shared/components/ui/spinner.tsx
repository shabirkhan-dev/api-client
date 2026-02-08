"use client";

import { cn } from "@/shared/lib/utils";

const sizeMap = {
	sm: "w-3.5 h-3.5 border-[1.5px]",
	md: "w-4 h-4 border-[1.5px]",
	lg: "w-6 h-6 border-2",
};

export function Spinner({
	className,
	size = "md",
}: {
	className?: string;
	size?: "sm" | "md" | "lg";
}) {
	return (
		<div
			className={cn(
				"rounded-full border-ctp-surface1 border-t-ctp-lavender animate-spin-slow",
				sizeMap[size],
				className,
			)}
		/>
	);
}
