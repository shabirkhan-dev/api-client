"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
	return (
		<Toaster
			position="bottom-right"
			gap={6}
			toastOptions={{
				style: {
					background: "var(--ctp-mantle, rgba(24, 24, 37, 0.95))",
					border: "1px solid color-mix(in srgb, var(--ctp-lavender, #b4befe) 10%, transparent)",
					color: "var(--ctp-text, #cdd6f4)",
					backdropFilter: "blur(20px)",
					fontFamily: "Inter, sans-serif",
					fontSize: "12px",
					borderRadius: "10px",
					boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
				},
			}}
			richColors
		/>
	);
}
