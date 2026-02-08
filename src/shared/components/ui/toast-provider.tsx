"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
	return (
		<Toaster
			position="bottom-right"
			gap={6}
			toastOptions={{
				style: {
					background:
						"linear-gradient(180deg, color-mix(in srgb, var(--ctp-mantle) 90%, transparent), color-mix(in srgb, var(--ctp-base) 90%, transparent))",
					border: "1px solid color-mix(in srgb, var(--ctp-surface1, #45475a) 40%, transparent)",
					color: "var(--ctp-text, #cdd6f4)",
					backdropFilter: "blur(18px)",
					fontFamily: "Inter, sans-serif",
					fontSize: "12px",
					borderRadius: "14px",
					boxShadow: "0 12px 40px -24px rgba(0, 0, 0, 0.65)",
				},
			}}
			richColors
		/>
	);
}
