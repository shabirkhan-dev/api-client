import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
	title: "Nebula API Client",
	description: "Open-source API development platform - Built with Next.js",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body>
				{children}
				<Toaster
					theme="dark"
					position="bottom-right"
					toastOptions={{
						className:
							"!bg-ctp-mantle !border-ctp-surface1/25 !text-ctp-text !text-[13px] !shadow-lg",
					}}
				/>
			</body>
		</html>
	);
}
