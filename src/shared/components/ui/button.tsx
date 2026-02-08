"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-lg text-[13px] font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/30 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-crust/50 disabled:pointer-events-none disabled:opacity-40 disabled:saturate-50 cursor-pointer select-none",
	{
		variants: {
			variant: {
				primary:
					"bg-gradient-to-br from-ctp-lavender to-ctp-mauve text-ctp-crust font-semibold shadow-[0_4px_16px] shadow-ctp-lavender/25 border border-transparent hover:translate-y-[-0.5px] hover:shadow-[0_6px_22px] hover:shadow-ctp-lavender/35 hover:brightness-[1.04] active:translate-y-0 active:scale-[0.98] active:shadow-[0_2px_8px] active:shadow-ctp-lavender/20 disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none disabled:saturate-[0.6]",
				secondary:
					"bg-ctp-surface0/40 text-ctp-text border border-ctp-surface1/35 hover:bg-ctp-surface0/60 hover:border-ctp-surface1/55 active:scale-[0.98]",
				ghost:
					"text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/30 active:scale-[0.98]",
				outline:
					"border border-ctp-surface0/40 text-ctp-subtext1 hover:border-ctp-surface1/55 hover:bg-ctp-surface0/25 hover:text-ctp-text active:scale-[0.98]",
				danger:
					"bg-ctp-red/10 text-ctp-red border border-ctp-red/18 hover:bg-ctp-red/18 hover:border-ctp-red/28 active:scale-[0.98]",
				subtle:
					"text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/35 active:scale-[0.97]",
			},
			size: {
				xs: "h-7 px-2.5 text-[11px] gap-1.5 rounded-md",
				sm: "h-8 px-3 text-[12px] gap-2",
				md: "h-9 px-4 text-[13px] gap-2",
				lg: "h-10 px-5 text-[14px] gap-2.5",
			},
		},
		defaultVariants: {
			variant: "ghost",
			size: "md",
		},
	},
);

export interface ButtonProps
	extends
		ButtonHTMLAttributes<HTMLButtonElement>,
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
