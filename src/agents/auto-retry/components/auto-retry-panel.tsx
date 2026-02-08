"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { GlassPanel, Input, LabelText } from "@/shared/components/ui";
import { RotateCcw } from "lucide-react";

export function AutoRetryPanel() {
	const {
		retryAttempts,
		retryBackoff,
		retryCodes,
		retryCircuitEnabled,
		setRetryConfig,
	} = useAppStore();

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-auto">
			<GlassPanel className="p-4">
				<div className="flex items-center gap-2 mb-4">
					<RotateCcw size={16} className="text-ctp-lavender" />
					<LabelText>Auto-Retry Logic</LabelText>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<div className="space-y-1">
						<label className="text-[10px] uppercase text-ctp-overlay0">Max Attempts</label>
						<Input
							type="number"
							value={retryAttempts}
							onChange={(e) => setRetryConfig({ attempts: Number(e.target.value) })}
							className="text-xs"
						/>
					</div>
					<div className="space-y-1">
						<label className="text-[10px] uppercase text-ctp-overlay0">
							Backoff (ms)
						</label>
						<Input
							type="number"
							value={retryBackoff}
							onChange={(e) => setRetryConfig({ backoff: Number(e.target.value) })}
							className="text-xs"
						/>
					</div>
					<div className="space-y-1">
						<label className="text-[10px] uppercase text-ctp-overlay0">
							Retry Codes
						</label>
						<Input
							value={retryCodes}
							onChange={(e) => setRetryConfig({ codes: e.target.value })}
							placeholder="502,503,504"
							className="text-xs"
						/>
					</div>
				</div>
				<label className="flex items-center gap-2 text-xs text-ctp-overlay0 mt-4 cursor-pointer">
					<input
						type="checkbox"
						checked={retryCircuitEnabled}
						onChange={(e) => setRetryConfig({ circuit: e.target.checked })}
						className="accent-ctp-lavender rounded"
					/>
					Circuit breaker (pause on consecutive failures)
				</label>
				<div className="text-xs text-ctp-overlay0 mt-3 p-3 bg-ctp-crust/40 rounded-xl">
					Retry configuration applies to all HTTP requests sent from the HTTP Client tab.
					When enabled, failed requests matching the specified status codes will
					automatically retry with exponential backoff.
				</div>
			</GlassPanel>
		</div>
	);
}
