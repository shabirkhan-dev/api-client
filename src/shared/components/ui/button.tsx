"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
	{
		variants: {
			variant: {
				primary: "btn-primary",
				ghost:
					"bg-transparent text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-lavender/5 active:scale-[0.98]",
				outline:
					"border border-ctp-border bg-transparent text-ctp-text hover:border-ctp-border-hover hover:bg-ctp-lavender/5",
				danger: "bg-ctp-red/15 text-ctp-red border border-ctp-red/20 hover:bg-ctp-red/25",
				kbd: "text-[10px] px-2 py-1 rounded-md border border-ctp-border bg-ctp-mantle/90 text-ctp-overlay0 hover:text-ctp-text hover:border-ctp-border-hover",
			},
			size: {
				sm: "h-8 px-3 text-xs",
				md: "h-9 px-4 text-sm",
				lg: "h-10 px-5 text-sm",
				icon: "h-8 w-8",
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
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
		);
	},
);
Button.displayName = "Button";

export { buttonVariants };
