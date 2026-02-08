"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide border transition-colors",
	{
		variants: {
			variant: {
				default: "bg-ctp-surface0/45 text-ctp-overlay1 border-ctp-surface1/30",
				success: "bg-ctp-green/12 text-ctp-green border-ctp-green/20",
				warning: "bg-ctp-yellow/12 text-ctp-yellow border-ctp-yellow/20",
				danger: "bg-ctp-red/12 text-ctp-red border-ctp-red/20",
				info: "bg-ctp-blue/12 text-ctp-blue border-ctp-blue/20",
				accent: "bg-ctp-lavender/12 text-ctp-lavender border-ctp-lavender/20",
				mauve: "bg-ctp-mauve/12 text-ctp-mauve border-ctp-mauve/20",
				peach: "bg-ctp-peach/12 text-ctp-peach border-ctp-peach/20",
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
