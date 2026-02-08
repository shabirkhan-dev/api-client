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
				"flex min-h-16 w-full rounded-lg bg-ctp-mantle/30 border border-ctp-surface0/25 px-4 py-3 text-[13px] font-mono text-ctp-text placeholder:text-ctp-overlay0/45 resize-none outline-none leading-relaxed transition-all duration-150",
				"hover:border-ctp-surface1/35 hover:bg-ctp-mantle/40",
				"focus:bg-ctp-mantle/50",
				"focus-visible:border-ctp-lavender/45 focus-visible:shadow-[0_0_0_1px_inset,0_0_0_3px] focus-visible:shadow-ctp-lavender/15",
				className,
			)}
			{...props}
		/>
	);
});
Textarea.displayName = "Textarea";
