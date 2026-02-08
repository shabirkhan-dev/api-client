"use client";

import { cn } from "@/shared/lib/utils";

interface StatusDotProps {
	color?: "green" | "red" | "yellow" | "blue" | "muted";
	pulse?: boolean;
	className?: string;
}

const colorMap = {
	green: "bg-ctp-green",
	red: "bg-ctp-red",
	yellow: "bg-ctp-yellow",
	blue: "bg-ctp-blue",
	muted: "bg-ctp-overlay0",
};

export function StatusDot({ color = "muted", pulse, className }: StatusDotProps) {
	return (
		<span
			className={cn(
				"inline-block w-2 h-2 rounded-full",
				colorMap[color],
				pulse && "animate-pulse-glow",
				className,
			)}
		/>
	);
}
