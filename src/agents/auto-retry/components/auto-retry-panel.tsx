"use client";

import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { GlassPanel, Input } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/app-store";

export function AutoRetryPanel() {
	const { retryAttempts, retryBackoff, retryCodes, retryCircuitEnabled, setRetryConfig } =
		useAppStore();

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-auto">
			<GlassPanel className="p-3">
				<div className="flex items-center gap-2 mb-3">
					<HugeiconsIcon icon={Refresh01Icon} size={15} className="text-ctp-lavender" />
					<div className="text-[13px] font-semibold">Auto-Retry</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
					<label className="space-y-1">
						<span className="text-[10px] uppercase text-ctp-overlay0 block tracking-wider">
							Max Attempts
						</span>
						<Input
							type="number"
							value={retryAttempts}
							onChange={(e) => setRetryConfig({ attempts: Number(e.target.value) })}
							className="text-[11px]"
						/>
					</label>
					<label className="space-y-1">
						<span className="text-[10px] uppercase text-ctp-overlay0 block tracking-wider">
							Backoff (ms)
						</span>
						<Input
							type="number"
							value={retryBackoff}
							onChange={(e) => setRetryConfig({ backoff: Number(e.target.value) })}
							className="text-[11px]"
						/>
					</label>
					<label className="space-y-1">
						<span className="text-[10px] uppercase text-ctp-overlay0 block tracking-wider">
							Status Codes
						</span>
						<Input
							value={retryCodes}
							onChange={(e) => setRetryConfig({ codes: e.target.value })}
							className="text-[11px]"
						/>
					</label>
				</div>
				<label className="flex items-center gap-2 text-[11px] text-ctp-overlay0 mt-3 cursor-pointer">
					<input
						type="checkbox"
						checked={retryCircuitEnabled}
						onChange={(e) => setRetryConfig({ circuit: e.target.checked })}
						className="accent-ctp-lavender rounded"
					/>
					Circuit breaker (pause on failures)
				</label>
				<div className="text-[10px] text-ctp-overlay0 mt-3 p-2.5 bg-ctp-crust/30 rounded-lg leading-relaxed">
					Retry applies to HTTP requests. Matching status codes trigger exponential backoff retries.
				</div>
			</GlassPanel>
		</div>
	);
}
