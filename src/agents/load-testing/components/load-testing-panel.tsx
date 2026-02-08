"use client";

import { Button, GlassPanel, Input, LabelText, Badge } from "@/shared/components/ui";
import type { LoadTestResult } from "@/shared/types";
import { downloadFile } from "@/shared/lib/utils";
import { Play, Pause, Square, Download } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export function LoadTestingPanel() {
	const [running, setRunning] = useState(false);
	const [paused, setPaused] = useState(false);
	const [total, setTotal] = useState(100);
	const [concurrency, setConcurrency] = useState(5);
	const [target, setTarget] = useState("");
	const [profile, setProfile] = useState("spike");
	const [completed, setCompleted] = useState(0);
	const [results, setResults] = useState<LoadTestResult[]>([]);
	const [metrics, setMetrics] = useState({
		rps: 0,
		avg: 0,
		min: 0,
		max: 0,
		p95: 0,
		errorRate: 0,
		errors: 0,
		throughput: 0,
	});
	const cancelRef = useRef(false);

	const simulate = useCallback(
		async (totalReqs: number) => {
			cancelRef.current = false;
			for (let i = 0; i < totalReqs; i++) {
				if (cancelRef.current) break;
				await new Promise((r) => setTimeout(r, 200));

				const sample = {
					rps: Math.random() * 200,
					avg: Math.round(50 + Math.random() * 100),
					min: Math.round(20 + Math.random() * 30),
					max: Math.round(100 + Math.random() * 200),
					p95: Math.round(120 + Math.random() * 120),
					errorRate: Math.round(Math.random() * 3),
					errors: Math.round(Math.random() * 5),
					throughput: Math.round(120 + Math.random() * 400),
				};

				const result: LoadTestResult = {
					status: Math.random() > 0.9 ? 500 : 200,
					time: sample.avg,
					size: `${Math.round(Math.random() * 5 + 1)} KB`,
					timestamp: new Date().toLocaleTimeString(),
				};

				setMetrics(sample);
				setResults((prev) => [...prev, result].slice(-100));
				setCompleted(i + 1);
			}
			setRunning(false);
			toast.success("Load test completed");
		},
		[],
	);

	const startTest = useCallback(() => {
		if (running) return;
		setRunning(true);
		setPaused(false);
		setCompleted(0);
		setResults([]);
		simulate(total);
		toast.success("Load test started");
	}, [running, total, simulate]);

	const cancelTest = useCallback(() => {
		cancelRef.current = true;
		setRunning(false);
		setPaused(false);
		toast.error("Load test canceled");
	}, []);

	const exportCsv = useCallback(() => {
		const rows = ["#,Status,Time,Size,Timestamp"];
		results.forEach((row, i) => {
			rows.push([i + 1, row.status, row.time, row.size, row.timestamp].join(","));
		});
		downloadFile(rows.join("\n"), "load-test-results.csv", "text/csv");
	}, [results]);

	const progress = total > 0 ? Math.min(100, (completed / total) * 100) : 0;

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-auto">
			<GlassPanel className="p-4">
				<LabelText className="mb-3">Load Testing Configuration</LabelText>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					<select
						value={profile}
						onChange={(e) => setProfile(e.target.value)}
						className="bg-transparent border border-ctp-border rounded-lg px-3 py-2 text-xs text-ctp-text outline-none"
					>
						{["spike", "ramp", "soak", "stress", "custom"].map((p) => (
							<option key={p} value={p} className="bg-ctp-base">
								{p.charAt(0).toUpperCase() + p.slice(1)}
							</option>
						))}
					</select>
					<Input
						value={target}
						onChange={(e) => setTarget(e.target.value)}
						placeholder="Target URL"
						className="text-xs font-mono"
					/>
					<Input
						type="number"
						value={total}
						onChange={(e) => setTotal(Number(e.target.value))}
						placeholder="Total Requests"
						className="text-xs"
					/>
					<Input
						type="number"
						value={concurrency}
						onChange={(e) => setConcurrency(Number(e.target.value))}
						placeholder="Concurrency"
						className="text-xs"
					/>
				</div>
				<div className="flex items-center gap-3 mt-4">
					<Button variant="primary" size="sm" onClick={startTest} disabled={running}>
						<Play size={14} />
						{running ? "Running..." : "Start"}
					</Button>
					<Button variant="kbd" size="sm" onClick={cancelTest} disabled={!running}>
						<Square size={14} />
						Cancel
					</Button>
					<div className="flex-1 relative h-3 rounded-full bg-ctp-surface0 overflow-hidden">
						<div
							className="h-full animate-shimmer transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
						<span className="absolute inset-0 text-[9px] text-center text-ctp-text leading-3">
							{progress.toFixed(0)}%
						</span>
					</div>
				</div>
			</GlassPanel>

			<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
				{[
					{ label: "RPS", value: metrics.rps.toFixed(1), color: "text-ctp-lavender" },
					{ label: "Avg Latency", value: `${metrics.avg} ms`, color: "text-ctp-text" },
					{ label: "P95 Latency", value: `${metrics.p95} ms`, color: "text-ctp-peach" },
					{ label: "Error Rate", value: `${metrics.errorRate}%`, color: "text-ctp-red" },
					{
						label: "Throughput",
						value: `${metrics.throughput} KB/s`,
						color: "text-ctp-text",
					},
				].map((m) => (
					<GlassPanel key={m.label} className="p-3 hover:translate-y-[-2px] transition-transform">
						<LabelText>{m.label}</LabelText>
						<div className={`text-xl font-semibold ${m.color}`}>{m.value}</div>
					</GlassPanel>
				))}
			</div>

			<GlassPanel className="p-4">
				<div className="flex items-center justify-between mb-2">
					<LabelText>Test Results</LabelText>
					<Button variant="kbd" size="sm" onClick={exportCsv}>
						<Download size={12} />
						Export CSV
					</Button>
				</div>
				<div className="max-h-48 overflow-y-auto">
					<table className="w-full text-xs">
						<thead className="text-ctp-overlay0">
							<tr>
								<th className="text-left py-2">#</th>
								<th className="text-left py-2">Status</th>
								<th className="text-left py-2">Time (ms)</th>
								<th className="text-left py-2">Size</th>
								<th className="text-left py-2">Timestamp</th>
							</tr>
						</thead>
						<tbody>
							{results.slice(-50).map((row, i) => (
								<tr key={`${row.timestamp}-${i}`}>
									<td className="py-1">{i + 1}</td>
									<td
										className={`py-1 ${row.status >= 400 ? "text-ctp-red" : "text-ctp-green"}`}
									>
										{row.status}
									</td>
									<td className="py-1">{row.time}</td>
									<td className="py-1">{row.size}</td>
									<td className="py-1">{row.timestamp}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</GlassPanel>
		</div>
	);
}
