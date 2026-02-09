"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
	({ className, ...props }, ref) => {
		return (
			<input
				ref={ref}
				className={cn(
					"flex h-[calc(var(--space-2xl)+var(--space-md))] w-full rounded-md bg-ctp-mantle/30 border border-ctp-surface0/25 px-[var(--space-md)] py-[var(--space-sm)] text-[13px] text-ctp-text placeholder:text-ctp-overlay0/45 outline-none transition-all duration-150",
					"hover:border-ctp-surface1/35 hover:bg-ctp-mantle/40",
					"focus:bg-ctp-mantle/50",
					"focus-visible:border-ctp-lavender/45 focus-visible:shadow-[0_0_0_1px_inset,0_0_0_3px] focus-visible:shadow-ctp-lavender/15",
					"disabled:opacity-40 disabled:pointer-events-none disabled:saturate-50",
					className,
				)}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";
