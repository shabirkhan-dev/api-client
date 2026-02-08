"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide transition-colors",
	{
		variants: {
			variant: {
				default: "bg-ctp-surface0/50 text-ctp-overlay1 border border-ctp-surface0/40",
				success: "bg-ctp-green/10 text-ctp-green border border-ctp-green/15",
				warning: "bg-ctp-yellow/10 text-ctp-yellow border border-ctp-yellow/15",
				danger: "bg-ctp-red/10 text-ctp-red border border-ctp-red/15",
				info: "bg-ctp-blue/10 text-ctp-blue border border-ctp-blue/15",
				accent: "bg-ctp-lavender/10 text-ctp-lavender border border-ctp-lavender/15",
				mauve: "bg-ctp-mauve/10 text-ctp-mauve border border-ctp-mauve/15",
				peach: "bg-ctp-peach/10 text-ctp-peach border border-ctp-peach/15",
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
