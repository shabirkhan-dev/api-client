"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
	({ className, ...props }, ref) => {
		return (
			<input
				ref={ref}
				className={cn(
					"flex h-9 w-full rounded-lg bg-ctp-mantle/30 border border-ctp-surface0/25 px-3 py-2 text-[13px] text-ctp-text placeholder:text-ctp-overlay0/45 outline-none transition-all duration-150",
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
