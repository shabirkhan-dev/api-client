"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
	{
		variants: {
			variant: {
				default: "border border-ctp-border bg-ctp-mantle/90 text-ctp-overlay0",
				success: "bg-ctp-green/15 text-ctp-green",
				warning: "bg-ctp-yellow/15 text-ctp-yellow",
				danger: "bg-ctp-red/15 text-ctp-red",
				info: "bg-ctp-blue/15 text-ctp-blue",
				lavender: "bg-ctp-lavender/15 text-ctp-lavender",
				mauve: "bg-ctp-mauve/15 text-ctp-mauve",
				peach: "bg-ctp-peach/15 text-ctp-peach",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
