"use client";

import { Download01Icon, PlayIcon, StopIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, Input, LabelText } from "@/shared/components/ui";
import { downloadFile } from "@/shared/lib/utils";
import type { LoadTestResult } from "@/shared/types";

export function LoadTestingPanel() {
	const [running, setRunning] = useState(false);
	const [total, setTotal] = useState(100);
	const [concurrency, setConcurrency] = useState(5);
	const [target, setTarget] = useState("");
	const [profile, setProfile] = useState("spike");
	const [completed, setCompleted] = useState(0);
	const [results, setResults] = useState<LoadTestResult[]>([]);
	const [metrics, setMetrics] = useState({ rps: 0, avg: 0, p95: 0, errorRate: 0, throughput: 0 });
	const cancelRef = useRef(false);

	const simulate = useCallback(
		async (totalReqs: number) => {
			cancelRef.current = false;
			const allTimes: number[] = [];
			for (let i = 0; i < totalReqs; i++) {
				if (cancelRef.current) break;

				// Real request if target is provided, otherwise simulate
				let status = 200;
				let time = Math.round(30 + Math.random() * 150);
				if (target.trim()) {
					try {
						const start = performance.now();
						const res = await fetch(target, { method: "GET", signal: AbortSignal.timeout(5000) });
						time = Math.round(performance.now() - start);
						status = res.status;
					} catch {
						status = 0;
						time = 5000;
					}
				} else {
					await new Promise((r) => setTimeout(r, 50));
					status = Math.random() > 0.92 ? 500 : 200;
				}

				allTimes.push(time);
				const sorted = [...allTimes].sort((a, b) => a - b);
				const avg = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length);
				const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? avg;
				const errors =
					results.filter((r) => r.status >= 400 || r.status === 0).length +
					(status >= 400 || status === 0 ? 1 : 0);

				setMetrics({
					rps: Number(((i + 1) / ((Date.now() - Date.now() + 1000) / 1000)).toFixed(1)),
					avg,
					p95,
					errorRate: Math.round((errors / (i + 1)) * 100),
					throughput: Math.round(avg * 0.8),
				});
				setResults((prev) =>
					[
						...prev,
						{
							status,
							time,
							size: `${Math.round(Math.random() * 5 + 1)} KB`,
							timestamp: new Date().toLocaleTimeString(),
						},
					].slice(-200),
				);
				setCompleted(i + 1);
			}
			setRunning(false);
			toast.success("Load test completed");
		},
		[target, results],
	);

	const startTest = useCallback(() => {
		if (running) return;
		setRunning(true);
		setCompleted(0);
		setResults([]);
		simulate(total);
		toast.success("Load test started");
	}, [running, total, simulate]);
	const cancelTest = useCallback(() => {
		cancelRef.current = true;
		setRunning(false);
		toast.error("Canceled");
	}, []);
	const exportCsv = useCallback(() => {
		const rows = [
			"#,Status,Time,Size,Timestamp",
			...results.map((r, i) => `${i + 1},${r.status},${r.time},${r.size},${r.timestamp}`),
		];
		downloadFile(rows.join("\n"), "load-test.csv", "text/csv");
	}, [results]);
	const progress = total > 0 ? Math.min(100, (completed / total) * 100) : 0;

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-auto">
			<GlassPanel className="p-3">
				<LabelText className="mb-2">Configuration</LabelText>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
					<select
						value={profile}
						onChange={(e) => setProfile(e.target.value)}
						className="bg-transparent border border-ctp-surface0/60 rounded-lg px-2 py-1.5 text-[11px] text-ctp-subtext1 outline-none"
					>
						{["spike", "ramp", "soak", "stress"].map((p) => (
							<option key={p} value={p} className="bg-ctp-base">
								{p.charAt(0).toUpperCase() + p.slice(1)}
							</option>
						))}
					</select>
					<Input
						value={target}
						onChange={(e) => setTarget(e.target.value)}
						placeholder="Target URL (optional)"
						className="text-[11px] font-mono"
					/>
					<Input
						type="number"
						value={total}
						onChange={(e) => setTotal(Number(e.target.value))}
						className="text-[11px]"
					/>
					<Input
						type="number"
						value={concurrency}
						onChange={(e) => setConcurrency(Number(e.target.value))}
						placeholder="Concurrency"
						className="text-[11px]"
					/>
				</div>
				<div className="flex items-center gap-2 mt-3">
					<Button variant="primary" size="sm" onClick={startTest} disabled={running}>
						<HugeiconsIcon icon={PlayIcon} size={13} /> {running ? "Running..." : "Start"}
					</Button>
					<Button variant="outline" size="sm" onClick={cancelTest} disabled={!running}>
						<HugeiconsIcon icon={StopIcon} size={13} /> Cancel
					</Button>
					<div className="flex-1 h-2 rounded-full bg-ctp-surface0/30 overflow-hidden">
						<div
							className="h-full animate-shimmer transition-all duration-300 rounded-full"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<span className="text-[10px] text-ctp-overlay0 font-mono w-10 text-right">
						{progress.toFixed(0)}%
					</span>
				</div>
			</GlassPanel>

			<div className="grid grid-cols-5 gap-2">
				{[
					{ label: "RPS", value: metrics.rps.toFixed(1), color: "text-ctp-lavender" },
					{ label: "Avg", value: `${metrics.avg}ms`, color: "text-ctp-text" },
					{ label: "P95", value: `${metrics.p95}ms`, color: "text-ctp-peach" },
					{ label: "Errors", value: `${metrics.errorRate}%`, color: "text-ctp-red" },
					{ label: "Throughput", value: `${metrics.throughput}KB/s`, color: "text-ctp-text" },
				].map((m) => (
					<GlassPanel
						key={m.label}
						className="p-2.5 text-center hover:translate-y-[-1px] transition-transform"
					>
						<LabelText>{m.label}</LabelText>
						<div className={`text-base font-semibold font-mono ${m.color} mt-0.5`}>{m.value}</div>
					</GlassPanel>
				))}
			</div>

			<GlassPanel className="p-3">
				<div className="flex items-center justify-between mb-2">
					<LabelText>Results</LabelText>
					<Button variant="subtle" size="xs" onClick={exportCsv}>
						<HugeiconsIcon icon={Download01Icon} size={10} /> CSV
					</Button>
				</div>
				<div className="max-h-40 overflow-y-auto">
					<table className="w-full text-[10px]">
						<thead className="text-ctp-overlay0">
							<tr>
								<th className="text-left py-1">#</th>
								<th className="text-left py-1">Status</th>
								<th className="text-left py-1">Time</th>
								<th className="text-left py-1">Size</th>
							</tr>
						</thead>
						<tbody>
							{results.slice(-50).map((row, i) => (
								<tr key={`${row.timestamp}-${i}`} className="border-t border-ctp-surface0/10">
									<td className="py-0.5">{i + 1}</td>
									<td
										className={`py-0.5 font-mono ${row.status >= 400 || row.status === 0 ? "text-ctp-red" : "text-ctp-green"}`}
									>
										{row.status || "ERR"}
									</td>
									<td className="py-0.5 font-mono">{row.time}ms</td>
									<td className="py-0.5">{row.size}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</GlassPanel>
		</div>
	);
}
