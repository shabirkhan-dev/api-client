"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-[13px] font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/30 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
	{
		variants: {
			variant: {
				primary: "btn-primary rounded-lg",
				secondary:
					"bg-ctp-surface0/50 text-ctp-text border border-ctp-surface1/50 hover:bg-ctp-surface0 hover:border-ctp-surface1 active:scale-[0.98]",
				ghost: "text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0/40 active:scale-[0.98]",
				outline:
					"border border-ctp-surface0/80 text-ctp-subtext1 hover:border-ctp-surface1 hover:bg-ctp-surface0/30 hover:text-ctp-text active:scale-[0.98]",
				danger:
					"bg-ctp-red/10 text-ctp-red border border-ctp-red/15 hover:bg-ctp-red/20 active:scale-[0.98]",
				subtle:
					"text-ctp-overlay0 text-[11px] px-1.5 py-0.5 rounded-md hover:text-ctp-text hover:bg-ctp-surface0/40",
			},
			size: {
				xs: "h-6 px-2 text-[11px] rounded-md gap-1",
				sm: "h-7 px-2.5 text-[12px]",
				md: "h-8 px-3",
				lg: "h-9 px-4",
			},
		},
		defaultVariants: {
			variant: "ghost",
			size: "md",
		},
	},
);

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => {
		return (
			<button
				type="button"
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";
