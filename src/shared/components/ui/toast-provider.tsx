"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
	return (
		<Toaster
			position="bottom-right"
			toastOptions={{
				style: {
					background: "rgba(24, 24, 37, 0.95)",
					border: "1px solid rgba(180, 190, 254, 0.1)",
					color: "#cdd6f4",
					backdropFilter: "blur(16px)",
					fontFamily: "Inter, sans-serif",
					fontSize: "13px",
				},
			}}
			richColors
		/>
	);
}
