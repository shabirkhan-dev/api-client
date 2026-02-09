"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full px-[var(--space-sm)] py-px text-[10px] font-semibold tracking-wide border transition-colors duration-150",
	{
		variants: {
			variant: {
				default: "bg-ctp-surface0/35 text-ctp-overlay1 border-ctp-surface1/25",
				success: "bg-ctp-green/10 text-ctp-green border-ctp-green/18",
				warning: "bg-ctp-yellow/10 text-ctp-yellow border-ctp-yellow/18",
				danger: "bg-ctp-red/10 text-ctp-red border-ctp-red/18",
				info: "bg-ctp-blue/10 text-ctp-blue border-ctp-blue/18",
				accent: "bg-ctp-lavender/10 text-ctp-lavender border-ctp-lavender/18",
				mauve: "bg-ctp-mauve/10 text-ctp-mauve border-ctp-mauve/18",
				peach: "bg-ctp-peach/10 text-ctp-peach border-ctp-peach/18",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

export interface BadgeProps
	extends HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
