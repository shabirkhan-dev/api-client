"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
	({ className, ...props }, ref) => {
		return (
			<input
				ref={ref}
				className={cn(
					"flex h-8 w-full rounded-lg bg-ctp-mantle/40 border border-ctp-surface1/30 px-2.5 py-1.5 text-[13px] text-ctp-text placeholder:text-ctp-overlay0/60 input-focus transition-colors",
					className,
				)}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";
