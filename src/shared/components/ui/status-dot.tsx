"use client";

import { cn } from "@/shared/lib/utils";

const colorMap = {
	green: "bg-ctp-green shadow-[0_0_6px] shadow-ctp-green/40",
	red: "bg-ctp-red shadow-[0_0_6px] shadow-ctp-red/40",
	yellow: "bg-ctp-yellow shadow-[0_0_6px] shadow-ctp-yellow/40",
	blue: "bg-ctp-blue shadow-[0_0_6px] shadow-ctp-blue/40",
	muted: "bg-ctp-overlay0/70",
};

export function StatusDot({
	color = "muted",
	pulse,
	className,
}: {
	color?: keyof typeof colorMap;
	pulse?: boolean;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-block w-1.5 h-1.5 rounded-full",
				colorMap[color],
				pulse && "animate-pulse-soft",
				className,
			)}
		/>
	);
}
