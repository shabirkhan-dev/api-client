"use client";

import { cn } from "@/shared/lib/utils";

interface SpinnerProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

const sizeMap = {
	sm: "w-4 h-4 border-[1.5px]",
	md: "w-5 h-5 border-2",
	lg: "w-8 h-8 border-2",
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
	return (
		<div
			className={cn(
				"rounded-full border-transparent border-t-ctp-lavender animate-spin-slow",
				sizeMap[size],
				className,
			)}
		/>
	);
}
