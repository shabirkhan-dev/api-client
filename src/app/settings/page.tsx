"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to home - settings is now accessible via modal
		router.replace("/");
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="flex items-center gap-3">
				<div className="w-5 h-5 border-2 border-ctp-lavender/30 border-t-ctp-lavender rounded-full animate-spin" />
				<span className="text-[14px] text-ctp-subtext0">Redirecting...</span>
			</div>
		</div>
	);
}
