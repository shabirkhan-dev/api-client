"use client";

import { cn } from "@/shared/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
	return (
		<input
			ref={ref}
			className={cn(
				"flex h-9 w-full rounded-xl bg-ctp-crust/60 border border-ctp-surface0 px-3 py-2 text-sm text-ctp-text placeholder:text-ctp-overlay0 outline-none transition-all duration-200",
				"focus:border-ctp-lavender focus:ring-2 focus:ring-ctp-lavender/10",
				className,
			)}
			{...props}
		/>
	);
});
Input.displayName = "Input";
