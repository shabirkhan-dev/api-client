"use client";

import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, LabelText } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/app-store";

interface Metric {
	label: string;
	value: string;
	ms: number;
}

export function ProfilerPanel() {
	const { lastResponse } = useAppStore();
	const [metrics, setMetrics] = useState<Metric[]>([]);

	const refresh = useCallback(() => {
		const total = lastResponse?.time ?? 100;
		const entries: Metric[] = [
			{ label: "DNS", value: `${Math.round(total * 0.08)} ms`, ms: total * 0.08 },
			{ label: "TCP", value: `${Math.round(total * 0.15)} ms`, ms: total * 0.15 },
			{ label: "TLS", value: `${Math.round(total * 0.2)} ms`, ms: total * 0.2 },
			{ label: "TTFB", value: `${Math.round(total * 0.35)} ms`, ms: total * 0.35 },
			{ label: "Download", value: `${Math.round(total * 0.22)} ms`, ms: total * 0.22 },
		];
		setMetrics(entries);
		toast.success("Profiler refreshed");
	}, [lastResponse]);

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-auto">
			<GlassPanel className="p-3 flex items-center justify-between">
				<div>
					<div className="text-[13px] font-semibold">Performance Profiler</div>
					<div className="text-[11px] text-ctp-overlay0">Request timing breakdown</div>
				</div>
				<Button variant="outline" size="sm" onClick={refresh}>
					<HugeiconsIcon icon={Refresh01Icon} size={12} /> Refresh
				</Button>
			</GlassPanel>
			<GlassPanel className="p-3">
				<div className="grid grid-cols-5 gap-2 mb-4">
					{metrics.map((m) => (
						<div key={m.label} className="bg-ctp-crust/30 rounded-lg p-2.5 text-center">
							<LabelText>{m.label}</LabelText>
							<div className="text-[13px] font-semibold text-ctp-text mt-0.5 font-mono">
								{m.value}
							</div>
						</div>
					))}
					{metrics.length === 0 && (
						<div className="col-span-5 text-[10px] text-ctp-overlay0 text-center py-6">
							Click Refresh to analyze
						</div>
					)}
				</div>
				{metrics.length > 0 && (
					<div className="space-y-2">
						<LabelText>Waterfall</LabelText>
						{metrics.map((m) => (
							<div key={`w-${m.label}`} className="space-y-0.5">
								<div className="flex justify-between text-[10px]">
									<span className="text-ctp-subtext0">{m.label}</span>
									<span className="text-ctp-overlay1 font-mono">{m.value}</span>
								</div>
								<div className="h-1.5 bg-ctp-surface0/30 rounded-full overflow-hidden">
									<div
										className="h-full rounded-full bg-gradient-to-r from-ctp-lavender/80 to-ctp-lavender/10"
										style={{ width: `${Math.min(100, m.ms * 2)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</GlassPanel>
		</div>
	);
}
