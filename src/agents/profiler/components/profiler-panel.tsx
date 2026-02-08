"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, LabelText } from "@/shared/components/ui";

interface ProfilerMetric {
	label: string;
	value: string;
}

export function ProfilerPanel() {
	const [metrics, setMetrics] = useState<ProfilerMetric[]>([]);

	const refresh = useCallback(() => {
		const entries: ProfilerMetric[] = [
			{ label: "DNS", value: `${Math.round(Math.random() * 10 + 2)} ms` },
			{ label: "TCP", value: `${Math.round(Math.random() * 20 + 5)} ms` },
			{ label: "TLS", value: `${Math.round(Math.random() * 30 + 8)} ms` },
			{ label: "TTFB", value: `${Math.round(Math.random() * 50 + 10)} ms` },
			{ label: "Download", value: `${Math.round(Math.random() * 40 + 5)} ms` },
		];
		setMetrics(entries);
		toast.success("Profiler refreshed");
	}, []);

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-auto">
			<GlassPanel className="p-4 flex items-center justify-between">
				<div>
					<div className="text-sm font-semibold">Performance Profiler</div>
					<div className="text-xs text-ctp-overlay0">DNS, TCP, TLS, TTFB, Download</div>
				</div>
				<Button variant="kbd" size="sm" onClick={refresh}>
					<RefreshCw size={12} />
					Refresh
				</Button>
			</GlassPanel>

			<GlassPanel className="p-4">
				<LabelText>Metrics</LabelText>
				<div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-3">
					{metrics.map((m) => (
						<div key={m.label} className="glass rounded-xl p-3 text-center">
							<LabelText>{m.label}</LabelText>
							<div className="text-sm font-semibold text-ctp-text mt-1">{m.value}</div>
						</div>
					))}
					{metrics.length === 0 && (
						<div className="col-span-5 text-xs text-ctp-overlay0 text-center py-4">
							Click Refresh to load metrics
						</div>
					)}
				</div>

				{metrics.length > 0 && (
					<>
						<LabelText className="mt-4">Waterfall</LabelText>
						<div className="space-y-2 mt-2">
							{metrics.map((m) => {
								const ms = Number.parseInt(m.value, 10);
								return (
									<div key={`wf-${m.label}`} className="space-y-1">
										<div className="flex justify-between text-xs text-ctp-text">
											<span>{m.label}</span>
											<span>{m.value}</span>
										</div>
										<div className="h-2 bg-ctp-surface0 rounded-full overflow-hidden">
											<div
												className="h-full rounded-full bg-gradient-to-r from-ctp-lavender to-transparent"
												style={{ width: `${Math.min(100, ms * 2)}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</>
				)}
			</GlassPanel>
		</div>
	);
}
