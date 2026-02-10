"use client";

import {
	Cancel01Icon,
	Download01Icon,
	PlayIcon,
	StopIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Button, GlassPanel, Input } from "@/shared/components/ui";
import { downloadFile } from "@/shared/lib/utils";
import type { LoadTestResult } from "@/shared/types";
import { cn } from "@/shared/lib/utils";

interface TestSession {
	id: string;
	name: string;
	date: Date;
	config: TestConfig;
	results: LoadTestResult[];
	metrics: Metrics;
	duration: number;
}

interface TestConfig {
	total: number;
	concurrency: number;
	target: string;
	method: string;
	profile: LoadProfile;
	headers: string;
	body: string;
	timeout: number;
}

type LoadProfile = "constant" | "ramp" | "spike" | "wave";

interface Metrics {
	rps: number;
	avg: number;
	p50: number;
	p75: number;
	p90: number;
	p95: number;
	p99: number;
	min: number;
	max: number;
	errorRate: number;
	throughput: number;
	totalTime: number;
	successCount: number;
	errorCount: number;
}

const defaultConfig: TestConfig = {
	total: 100,
	concurrency: 10,
	target: "",
	method: "GET",
	profile: "constant",
	headers: "",
	body: "",
	timeout: 5000,
};

export function LoadTestingPanel() {
	// State
	const [running, setRunning] = useState(false);
	const [config, setConfig] = useState<TestConfig>(defaultConfig);
	const [progress, setProgress] = useState(0);
	const [completed, setCompleted] = useState(0);
	const [results, setResults] = useState<LoadTestResult[]>([]);
	const [metrics, setMetrics] = useState<Metrics | null>(null);
	const [sessions, setSessions] = useState<TestSession[]>([]);
	const [selectedSession, setSelectedSession] = useState<string | null>(null);
	const [startTime, setStartTime] = useState<number>(0);
	const [responseTimes, setResponseTimes] = useState<{ time: number; count: number }[]>([]);
	const [statusDistribution, setStatusDistribution] = useState<{ code: string; count: number }[]>([]);
	const [timeline, setTimeline] = useState<{ second: number; rps: number; avgTime: number }[]>([]);

	const cancelRef = useRef(false);
	const abortControllersRef = useRef<AbortController[]>([]);

	// Load saved sessions on mount
	useEffect(() => {
		const saved = localStorage.getItem("load-test-sessions");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setSessions(parsed.map((s: TestSession) => ({ ...s, date: new Date(s.date) })));
			} catch {
				// Invalid saved data
			}
		}
	}, []);

	// Save sessions when they change
	useEffect(() => {
		if (sessions.length > 0) {
			localStorage.setItem("load-test-sessions", JSON.stringify(sessions));
		}
	}, [sessions]);

	// Calculate metrics from results
	const calculateMetrics = useCallback((data: LoadTestResult[]): Metrics => {
		const times = data.map((r) => r.time);
		const sorted = [...times].sort((a, b) => a - b);
		const successCount = data.filter((r) => r.status >= 200 && r.status < 400).length;
		const errorCount = data.length - successCount;

		const getPercentile = (p: number) => sorted[Math.floor(sorted.length * p)] ?? 0;

		return {
			rps: data.length / Math.max(1, data[data.length - 1]?.time || 1) * 1000,
			avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length) || 0,
			p50: getPercentile(0.5),
			p75: getPercentile(0.75),
			p90: getPercentile(0.9),
			p95: getPercentile(0.95),
			p99: getPercentile(0.99),
			min: sorted[0] || 0,
			max: sorted[sorted.length - 1] || 0,
			errorRate: Math.round((errorCount / data.length) * 100),
			throughput: Math.round((data.length * 2) / Math.max(1, times.reduce((a, b) => a + b, 0) / 1000)),
			totalTime: times.reduce((a, b) => a + b, 0),
			successCount,
			errorCount,
		};
	}, []);

	// Generate load profile delays
	const getProfileDelay = useCallback((index: number, total: number, profile: LoadProfile): number => {
		switch (profile) {
			case "ramp":
				// Linear ramp up
				return (index / total) * 1000;
			case "spike":
				// Sudden spike then steady
				return index < total * 0.1 ? 10 : 100;
			case "wave":
				// Sine wave pattern
				return 500 + Math.sin((index / total) * Math.PI * 4) * 400;
			case "constant":
			default:
				return 0;
		}
	}, []);

	// Execute single request
	const executeRequest = useCallback(async (index: number): Promise<LoadTestResult> => {
		const start = performance.now();
		const controller = new AbortController();
		abortControllersRef.current.push(controller);

		try {
			let status = 200;
			let time = 0;
			let size = "0 KB";

			if (config.target.trim()) {
				const res = await fetch(config.target, {
					method: config.method,
					headers: config.headers ? JSON.parse(config.headers) : undefined,
					body: config.body || undefined,
					signal: controller.signal,
				});
				time = Math.round(performance.now() - start);
				status = res.status;
				const bodyText = await res.text();
				size = `${(bodyText.length / 1024).toFixed(1)} KB`;
			} else {
				// Simulation mode
				time = Math.round(30 + Math.random() * 150);
				status = Math.random() > 0.95 ? (Math.random() > 0.5 ? 500 : 404) : 200;
				size = `${(Math.random() * 5 + 1).toFixed(1)} KB`;
			}

			return {
				status,
				time,
				size,
				timestamp: new Date().toISOString(),
			};
		} catch {
			return {
				status: 0,
				time: Math.round(performance.now() - start),
				size: "0 KB",
				timestamp: new Date().toISOString(),
			};
		} finally {
			abortControllersRef.current = abortControllersRef.current.filter((c) => c !== controller);
		}
	}, [config]);

	// Run load test
	const runTest = useCallback(async () => {
		cancelRef.current = false;
		setRunning(true);
		setResults([]);
		setProgress(0);
		setCompleted(0);
		setMetrics(null);
		setResponseTimes([]);
		setStatusDistribution([]);
		setTimeline([]);
		setStartTime(Date.now());

		const allResults: LoadTestResult[] = [];
		const timeBuckets = new Map<number, number>();
		const statusBuckets = new Map<string, number>();
		const timelineData: { second: number; count: number; totalTime: number }[] = [];

		// Create batches based on concurrency
		const batchSize = config.concurrency;
		const batches = Math.ceil(config.total / batchSize);

		for (let batch = 0; batch < batches; batch++) {
			if (cancelRef.current) break;

			const batchStart = batch * batchSize;
			const batchEnd = Math.min(batchStart + batchSize, config.total);
			const batchPromises: Promise<LoadTestResult>[] = [];

			for (let i = batchStart; i < batchEnd; i++) {
				const delay = getProfileDelay(i, config.total, config.profile);
				batchPromises.push(
					new Promise((resolve) => setTimeout(resolve, delay))
						.then(() => executeRequest(i))
						.then((result) => {
							allResults.push(result);
							setCompleted(allResults.length);
							setProgress(Math.round((allResults.length / config.total) * 100));

							// Update distribution data
							const timeBucket = Math.floor(result.time / 10) * 10;
							timeBuckets.set(timeBucket, (timeBuckets.get(timeBucket) || 0) + 1);

							const statusKey = result.status === 0 ? "Error" : result.status.toString();
							statusBuckets.set(statusKey, (statusBuckets.get(statusKey) || 0) + 1);

							// Update timeline
							const second = Math.floor((Date.now() - startTime) / 1000);
							const existing = timelineData.find((t) => t.second === second);
							if (existing) {
								existing.count++;
								existing.totalTime += result.time;
							} else {
								timelineData.push({ second, count: 1, totalTime: result.time });
							}

							return result;
						})
				);
			}

			await Promise.all(batchPromises);

			// Update charts periodically
			setResponseTimes(Array.from(timeBuckets.entries()).map(([time, count]) => ({ time, count })));
			setStatusDistribution(Array.from(statusBuckets.entries()).map(([code, count]) => ({ code, count })));
			setTimeline(timelineData.map((t) => ({
				second: t.second,
				rps: Math.round(t.count),
				avgTime: Math.round(t.totalTime / t.count),
			})));
		}

		if (!cancelRef.current) {
			const finalMetrics = calculateMetrics(allResults);
			setMetrics(finalMetrics);
			setResults(allResults);

			// Save session
			const session: TestSession = {
				id: Date.now().toString(),
				name: `Test ${sessions.length + 1}`,
				date: new Date(),
				config: { ...config },
				results: allResults,
				metrics: finalMetrics,
				duration: Date.now() - startTime,
			};
			setSessions((prev) => [session, ...prev].slice(0, 10));
			toast.success("Load test completed successfully");
		}

		setRunning(false);
	}, [config, executeRequest, calculateMetrics, sessions.length, startTime, getProfileDelay]);

	const stopTest = useCallback(() => {
		cancelRef.current = true;
		abortControllersRef.current.forEach((c) => c.abort());
		abortControllersRef.current = [];
		setRunning(false);
		toast.info("Test stopped");
	}, []);

	const exportCsv = useCallback(() => {
		const dataToExport = selectedSession
			? sessions.find((s) => s.id === selectedSession)?.results
			: results;

		if (!dataToExport || dataToExport.length === 0) {
			toast.error("No data to export");
			return;
		}

		const rows = [
			"Timestamp,Status,Response Time (ms),Size",
			...dataToExport.map((r) => `${r.timestamp},${r.status},${r.time},${r.size}`),
		];
		downloadFile(rows.join("\n"), `load-test-${Date.now()}.csv`, "text/csv");
		toast.success("CSV exported");
	}, [results, sessions, selectedSession]);

	const loadSession = useCallback((session: TestSession) => {
		setConfig(session.config);
		setResults(session.results);
		setMetrics(session.metrics);
		setSelectedSession(session.id);
	}, []);

	const deleteSession = useCallback((id: string) => {
		setSessions((prev) => prev.filter((s) => s.id !== id));
		if (selectedSession === id) setSelectedSession(null);
	}, [selectedSession]);

	const currentData = selectedSession
		? sessions.find((s) => s.id === selectedSession)
		: { results, metrics };

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-[15px] font-semibold text-ctp-text">Load Testing</h2>
					<p className="text-[11px] text-ctp-overlay0">Simulate traffic and measure performance</p>
				</div>
				<div className="flex items-center gap-2">
					{running ? (
						<Button variant="danger" size="sm" onClick={stopTest}>
							<HugeiconsIcon icon={StopIcon} size={14} />
							<span>Stop Test</span>
						</Button>
					) : (
						<Button variant="primary" size="sm" onClick={runTest} disabled={config.total < 1}>
							<HugeiconsIcon icon={PlayIcon} size={14} />
							<span>Start Test</span>
						</Button>
					)}
					<Button variant="secondary" size="sm" onClick={exportCsv} disabled={!currentData?.results?.length}>
						<HugeiconsIcon icon={Download01Icon} size={14} />
						<span>Export CSV</span>
					</Button>
				</div>
			</div>

			<div className="flex-1 flex gap-3 min-h-0">
				{/* Left Panel - Configuration */}
				<div className="w-80 flex flex-col gap-3 overflow-y-auto pr-1">
					<GlassPanel className="p-4 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-[12px] font-semibold text-ctp-text">Configuration</h3>
							<button
								onClick={() => setConfig(defaultConfig)}
								className="text-[10px] text-ctp-overlay0 hover:text-ctp-text transition-colors"
							>
								Reset
							</button>
						</div>

						{/* Target URL */}
						<div className="space-y-1">
							<label className="text-[10px] font-medium text-ctp-subtext0 uppercase tracking-wider">Target URL</label>
							<Input
								value={config.target}
								onChange={(e) => setConfig((c) => ({ ...c, target: e.target.value }))}
								placeholder="https://api.example.com/endpoint"
								className="font-mono text-[11px]"
							/>
						</div>

						{/* Method & Profile */}
						<div className="grid grid-cols-2 gap-2">
							<div className="space-y-1">
								<label className="text-[10px] font-medium text-ctp-subtext0 uppercase tracking-wider">Method</label>
								<select
									value={config.method}
									onChange={(e) => setConfig((c) => ({ ...c, method: e.target.value }))}
									className="w-full h-9 px-2.5 rounded-lg bg-ctp-mantle/40 border border-ctp-surface0/30 text-[11px] text-ctp-text outline-none focus:border-ctp-lavender/40"
								>
									{["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
										<option key={m} value={m}>{m}</option>
									))}
								</select>
							</div>
							<div className="space-y-1">
								<label className="text-[10px] font-medium text-ctp-subtext0 uppercase tracking-wider">Profile</label>
								<select
									value={config.profile}
									onChange={(e) => setConfig((c) => ({ ...c, profile: e.target.value as LoadProfile }))}
									className="w-full h-9 px-2.5 rounded-lg bg-ctp-mantle/40 border border-ctp-surface0/30 text-[11px] text-ctp-text outline-none focus:border-ctp-lavender/40"
								>
									<option value="constant">Constant</option>
									<option value="ramp">Ramp Up</option>
									<option value="spike">Spike</option>
									<option value="wave">Wave</option>
								</select>
							</div>
						</div>

						{/* Requests & Concurrency */}
						<div className="grid grid-cols-2 gap-2">
							<div className="space-y-1">
								<label className="text-[10px] font-medium text-ctp-subtext0 uppercase tracking-wider">Requests</label>
								<Input
									type="number"
									min={1}
									max={10000}
									value={config.total}
									onChange={(e) => setConfig((c) => ({ ...c, total: Math.min(10000, Math.max(1, Number(e.target.value))) }))}
									className="text-[11px]"
								/>
							</div>
							<div className="space-y-1">
								<label className="text-[10px] font-medium text-ctp-subtext0 uppercase tracking-wider">Concurrency</label>
								<Input
									type="number"
									min={1}
									max={100}
									value={config.concurrency}
									onChange={(e) => setConfig((c) => ({ ...c, concurrency: Math.min(100, Math.max(1, Number(e.target.value))) }))}
									className="text-[11px]"
								/>
							</div>
						</div>

						{/* Timeout */}
						<div className="space-y-1">
							<label className="text-[10px] font-medium text-ctp-subtext0 uppercase tracking-wider">Timeout (ms)</label>
							<Input
								type="number"
								min={1000}
								max={30000}
								step={500}
								value={config.timeout}
								onChange={(e) => setConfig((c) => ({ ...c, timeout: Number(e.target.value) }))}
								className="text-[11px]"
							/>
						</div>

						{/* Headers & Body */}
						{config.method !== "GET" && (
							<>
								<div className="space-y-1">
									<label className="text-[10px] font-medium text-ctp-subtext0 uppercase tracking-wider">Headers (JSON)</label>
									<textarea
										value={config.headers}
										onChange={(e) => setConfig((c) => ({ ...c, headers: e.target.value }))}
										placeholder='{"Authorization": "Bearer token"}'
										className="w-full h-16 px-2.5 py-2 rounded-lg bg-ctp-mantle/40 border border-ctp-surface0/30 text-[11px] font-mono text-ctp-text placeholder:text-ctp-overlay0/40 outline-none focus:border-ctp-lavender/40 resize-none"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-[10px] font-medium text-ctp-subtext0 uppercase tracking-wider">Body (JSON)</label>
									<textarea
										value={config.body}
										onChange={(e) => setConfig((c) => ({ ...c, body: e.target.value }))}
										placeholder='{"key": "value"}'
										className="w-full h-16 px-2.5 py-2 rounded-lg bg-ctp-mantle/40 border border-ctp-surface0/30 text-[11px] font-mono text-ctp-text placeholder:text-ctp-overlay0/40 outline-none focus:border-ctp-lavender/40 resize-none"
									/>
								</div>
							</>
						)}

						{/* Progress */}
						{running && (
							<div className="pt-2 border-t border-ctp-surface0/20">
								<div className="flex items-center justify-between text-[10px] text-ctp-subtext0 mb-1">
									<span>{completed} / {config.total} requests</span>
									<span>{progress}%</span>
								</div>
								<div className="h-2 rounded-full bg-ctp-surface0/30 overflow-hidden">
									<div
										className="h-full bg-gradient-to-r from-ctp-lavender to-ctp-mauve transition-all duration-300 rounded-full"
										style={{ width: `${progress}%` }}
									/>
								</div>
							</div>
						)}
					</GlassPanel>

					{/* Session History */}
					{sessions.length > 0 && (
						<GlassPanel className="p-4">
							<h3 className="text-[12px] font-semibold text-ctp-text mb-3">Recent Sessions</h3>
							<div className="space-y-1">
								{sessions.map((session) => (
									<div
										key={session.id}
										onClick={() => loadSession(session)}
										className={cn(
											"flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
											selectedSession === session.id
												? "bg-ctp-lavender/10 border border-ctp-lavender/30"
												: "hover:bg-ctp-surface0/20 border border-transparent"
										)}
									>
										<div className="flex-1 min-w-0">
											<div className="text-[11px] font-medium text-ctp-text truncate">
												{session.config.target || "Simulation Mode"}
											</div>
											<div className="text-[9px] text-ctp-overlay0">
												{session.date.toLocaleString()} • {session.results.length} reqs
											</div>
										</div>
										<button
											onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
											className="p-1 rounded text-ctp-overlay0 hover:text-ctp-red hover:bg-ctp-red/10 transition-colors"
										>
											<HugeiconsIcon icon={Cancel01Icon} size={12} />
										</button>
									</div>
								))}
							</div>
						</GlassPanel>
					)}
				</div>

				{/* Right Panel - Results */}
				<div className="flex-1 flex flex-col gap-3 overflow-hidden">
					{/* Metrics Grid */}
					{currentData?.metrics && (
						<div className="grid grid-cols-4 gap-2">
							<MetricCard
								label="Requests/sec"
								value={currentData.metrics.rps.toFixed(1)}
								sublabel="RPS"
								color="lavender"
							/>
							<MetricCard
								label="Average"
								value={`${currentData.metrics.avg}ms`}
								sublabel="Response time"
								color="text"
							/>
							<MetricCard
								label="P95 Latency"
								value={`${currentData.metrics.p95}ms`}
								sublabel="95th percentile"
								color="peach"
							/>
							<MetricCard
								label="Error Rate"
								value={`${currentData.metrics.errorRate}%`}
								sublabel={`${currentData.metrics.errorCount} errors`}
								color={currentData.metrics.errorRate > 5 ? "red" : "green"}
							/>
						</div>
					)}

					{/* Charts */}
					{timeline.length > 0 && (
						<div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
							<GlassPanel className="p-3 flex flex-col">
								<h4 className="text-[11px] font-semibold text-ctp-text mb-2">Response Time Distribution</h4>
								<div className="flex-1 min-h-0">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={responseTimes.slice(0, 20)}>
											<CartesianGrid strokeDasharray="3 3" stroke="#313244" />
											<XAxis
												dataKey="time"
												tick={{ fill: "#6c7086", fontSize: 10 }}
												tickFormatter={(v) => `${v}ms`}
											label={{ value: "Response Time", fill: "#6c7086", fontSize: 10 }}
											/>
											<YAxis tick={{ fill: "#6c7086", fontSize: 10 }} />
											<Tooltip
												contentStyle={{ background: "#181825", border: "1px solid #313244", borderRadius: 8 }}
												labelStyle={{ color: "#cdd6f4" }}
											/>
											<Bar dataKey="count" fill="#b4befe" radius={[4, 4, 0, 0]} />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</GlassPanel>

							<GlassPanel className="p-3 flex flex-col">
								<h4 className="text-[11px] font-semibold text-ctp-text mb-2">Requests Over Time</h4>
								<div className="flex-1 min-h-0">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={timeline}>
											<defs>
												<linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
													<stop offset="5%" stopColor="#b4befe" stopOpacity={0.3} />
													<stop offset="95%" stopColor="#b4befe" stopOpacity={0} />
												</linearGradient>
											</defs>
											<CartesianGrid strokeDasharray="3 3" stroke="#313244" />
											<XAxis
												dataKey="second"
												tick={{ fill: "#6c7086", fontSize: 10 }}
												tickFormatter={(v) => `${v}s`}
											label={{ value: "Time", fill: "#6c7086", fontSize: 10 }}
											/>
											<YAxis tick={{ fill: "#6c7086", fontSize: 10 }} />
											<Tooltip
												contentStyle={{ background: "#181825", border: "1px solid #313244", borderRadius: 8 }}
												labelStyle={{ color: "#cdd6f4" }}
											/>
											<Area
												type="monotone"
												dataKey="rps"
												stroke="#b4befe"
												fillOpacity={1}
												fill="url(#colorRps)"
											/>
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</GlassPanel>
						</div>
					)}

					{/* Status Distribution & Percentiles */}
					{statusDistribution.length > 0 && (
						<div className="grid grid-cols-2 gap-3">
							<GlassPanel className="p-4">
								<h4 className="text-[11px] font-semibold text-ctp-text mb-3">Status Codes</h4>
								<div className="space-y-2">
									{statusDistribution.map(({ code, count }) => {
										const total = statusDistribution.reduce((a, b) => a + b.count, 0);
										const percent = (count / total) * 100;
										const color = code.startsWith("2") ? "bg-ctp-green" : code.startsWith("4") ? "bg-ctp-peach" : code.startsWith("5") || code === "Error" ? "bg-ctp-red" : "bg-ctp-blue";
										return (
											<div key={code} className="flex items-center gap-2">
												<span className={cn("w-2 h-2 rounded-full", color)} />
												<span className="text-[11px] text-ctp-text w-12">{code}</span>
												<div className="flex-1 h-2 rounded-full bg-ctp-surface0/30 overflow-hidden">
													<div className={cn("h-full rounded-full", color)} style={{ width: `${percent}%` }} />
												</div>
												<span className="text-[10px] text-ctp-overlay0 w-16 text-right">{count} ({percent.toFixed(0)}%)</span>
											</div>
										);
										})}
									</div>
							</GlassPanel>

							{currentData?.metrics && (
								<GlassPanel className="p-4">
									<h4 className="text-[11px] font-semibold text-ctp-text mb-3">Latency Percentiles</h4>
									<div className="grid grid-cols-3 gap-2">
										{[
											{ label: "P50", value: currentData.metrics.p50, color: "text-ctp-green" },
											{ label: "P75", value: currentData.metrics.p75, color: "text-ctp-teal" },
											{ label: "P90", value: currentData.metrics.p90, color: "text-ctp-blue" },
											{ label: "P95", value: currentData.metrics.p95, color: "text-ctp-yellow" },
											{ label: "P99", value: currentData.metrics.p99, color: "text-ctp-peach" },
											{ label: "Max", value: currentData.metrics.max, color: "text-ctp-red" },
										].map((p) => (
											<div key={p.label} className="bg-ctp-mantle/40 rounded-lg p-2 text-center">
												<div className="text-[10px] text-ctp-overlay0">{p.label}</div>
												<div className={cn("text-[13px] font-semibold font-mono", p.color)}>{p.value}ms</div>
											</div>
										))}
									</div>
								
							</GlassPanel>	
						)}
						</div>
					)}

					{/* Empty State */}
					{!currentData?.results?.length && !running && (
						<GlassPanel className="flex-1 flex flex-col items-center justify-center p-8">
							<div className="w-16 h-16 rounded-2xl bg-ctp-lavender/10 flex items-center justify-center mb-4">
								<HugeiconsIcon icon={PlayIcon} size={32} className="text-ctp-lavender" />
							</div>
							<h3 className="text-[14px] font-semibold text-ctp-text mb-1">Start a Load Test</h3>
							<p className="text-[12px] text-ctp-subtext0 text-center max-w-sm">
								Configure your test parameters on the left and click "Start Test" to begin.
								<br />
								Leave URL empty for simulation mode.
							</p>
						</GlassPanel>
					)}
				</div>
			</div>
		</div>
	);
}

function MetricCard({
	label,
	value,
	sublabel,
	color,
}: { label: string; value: string; sublabel: string; color: "lavender" | "text" | "peach" | "red" | "green" }) {
	const colorClasses = {
		lavender: "text-ctp-lavender",
		text: "text-ctp-text",
		peach: "text-ctp-peach",
		red: "text-ctp-red",
		green: "text-ctp-green",
	};

	return (
		<GlassPanel className="p-3 text-center">
			<div className="text-[10px] text-ctp-overlay0 uppercase tracking-wider">{label}</div>
			<div className={cn("text-[18px] font-bold font-mono mt-1", colorClasses[color])}>{value}</div>
			<div className="text-[9px] text-ctp-subtext0 mt-0.5">{sublabel}</div>
		</GlassPanel>
	);
}
