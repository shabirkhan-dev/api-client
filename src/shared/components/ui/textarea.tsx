"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				ref={ref}
				className={cn(
					"flex min-h-[60px] w-full rounded-xl bg-ctp-crust/60 border border-ctp-surface0 px-3 py-2 text-sm font-mono text-ctp-text placeholder:text-ctp-overlay0 outline-none resize-none transition-all duration-200",
					"focus:border-ctp-lavender focus:ring-2 focus:ring-ctp-lavender/10",
					className,
				)}
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";
