"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export const Textarea = forwardRef<
	HTMLTextAreaElement,
	TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
	return (
		<textarea
			ref={ref}
			className={cn(
				"flex min-h-[60px] w-full rounded-lg bg-ctp-crust/50 border border-ctp-surface0/60 px-2.5 py-2 text-[12px] font-mono text-ctp-text placeholder:text-ctp-overlay0/60 resize-none input-focus leading-relaxed",
				className,
			)}
			{...props}
		/>
	);
});
Textarea.displayName = "Textarea";
