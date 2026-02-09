"use client";

import {
	Add01Icon,
	Cancel01Icon,
	Copy01Icon,
	Delete02Icon,
	PlayIcon,
	SquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button, GlassPanel, Input, Textarea } from "@/shared/components/ui";
import { generateId } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import { useMockServer, type MockRequest } from "../use-mock-server";

export function MockServerPanel() {
	const { mockRoutes, addMockRoute, removeMockRoute, setMockRoutes } = useAppStore();
	const { isRunning, baseUrl, requests, startServer, stopServer, clearRequests, setBaseUrl } = useMockServer(mockRoutes);
	const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

	const handleAdd = () => {
		addMockRoute({
			id: generateId("mock"),
			path: "/api/example",
			status: 200,
			latency: 100,
			contentType: "application/json",
			body: JSON.stringify({ message: "Hello from mock server!" }, null, 2),
			condition: "",
		});
	};

	const updateRoute = (id: string, field: string, value: string | number) => {
		setMockRoutes(mockRoutes.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
	};

	const copyEndpoint = (path: string) => {
		const fullUrl = `${baseUrl}${path}`;
		navigator.clipboard.writeText(fullUrl);
		setCopiedEndpoint(path);
		setTimeout(() => setCopiedEndpoint(null), 2000);
	};

	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
	};

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-hidden">
			{/* Server Control Panel */}
			<GlassPanel className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div>
							<div className="text-[13px] font-semibold">Mock Server</div>
							<div className="text-[11px] text-ctp-overlay0">
								{isRunning ? (
									<span className="flex items-center gap-1.5">
										<span className="w-2 h-2 rounded-full bg-ctp-green animate-pulse" />
										Running on {baseUrl}
									</span>
								) : (
									<span className="flex items-center gap-1.5">
										<span className="w-2 h-2 rounded-full bg-ctp-overlay0" />
										Server stopped
									</span>
								)}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Input
								value={baseUrl}
								onChange={(e) => setBaseUrl(e.target.value)}
								placeholder="Base URL"
								className="w-48 text-[11px] font-mono"
								disabled={isRunning}
							/>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{isRunning ? (
							<Button variant="danger" size="sm" onClick={stopServer}>
								<HugeiconsIcon icon={SquareIcon} size={13} />
								Stop Server
							</Button>
						) : (
							<Button variant="primary" size="sm" onClick={startServer}>
								<HugeiconsIcon icon={PlayIcon} size={13} />
								Start Server
							</Button>
						)}
						<Button variant="secondary" size="sm" onClick={handleAdd}>
							<HugeiconsIcon icon={Add01Icon} size={13} />
							Add Route
						</Button>
					</div>
				</div>
			</GlassPanel>

			<div className="flex-1 flex gap-3 overflow-hidden min-h-0">
				{/* Routes Panel */}
				<GlassPanel className="flex-1 flex flex-col p-4 overflow-hidden">
					<div className="text-[12px] font-semibold mb-3">Mock Routes ({mockRoutes.length})</div>
					<div className="flex-1 overflow-y-auto space-y-2 pr-1">
						{mockRoutes.map((route) => (
							<div
								key={route.id}
								className="bg-ctp-mantle/40 rounded-lg p-3 space-y-2 border border-ctp-surface0/20"
							>
								<div className="flex items-center gap-2">
									<div className="flex-1 flex items-center gap-2">
										<Input
											value={route.path}
											onChange={(e) => updateRoute(route.id, "path", e.target.value)}
											placeholder="/api/path"
											className="flex-1 font-mono text-[11px]"
										/>
										<button
											onClick={() => copyEndpoint(route.path)}
											className="p-1.5 rounded-md text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/30 transition-colors"
											title="Copy endpoint URL"
										>
											<HugeiconsIcon
												icon={Copy01Icon}
												size={13}
												className={copiedEndpoint === route.path ? "text-ctp-green" : ""}
											/>
										</button>
									</div>
									<Button variant="danger" size="xs" onClick={() => removeMockRoute(route.id)}>
										<HugeiconsIcon icon={Delete02Icon} size={11} />
									</Button>
								</div>
								<div className="grid grid-cols-4 gap-2">
									<label className="space-y-0.5">
										<span className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Status</span>
										<Input
											type="number"
											value={route.status}
											onChange={(e) => updateRoute(route.id, "status", Number(e.target.value))}
											className="text-[11px]"
										/>
									</label>
									<label className="space-y-0.5">
										<span className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Latency (ms)</span>
										<Input
											type="number"
											value={route.latency}
											onChange={(e) => updateRoute(route.id, "latency", Number(e.target.value))}
											className="text-[11px]"
										/>
									</label>
									<label className="space-y-0.5 col-span-2">
										<span className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Content-Type</span>
										<Input
											value={route.contentType}
											onChange={(e) => updateRoute(route.id, "contentType", e.target.value)}
											className="text-[11px]"
										/>
									</label>
								</div>
								<label className="block space-y-0.5">
									<span className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Response Body</span>
									<Textarea
										value={route.body}
										onChange={(e) => updateRoute(route.id, "body", e.target.value)}
										className="h-20 text-[11px] font-mono"
										placeholder='{"message": "Hello"}'
									/>
								</label>
								<label className="block space-y-0.5">
									<span className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Condition (Regex)</span>
									<Input
										value={route.condition}
										onChange={(e) => updateRoute(route.id, "condition", e.target.value)}
										className="text-[11px]"
										placeholder="Optional regex pattern"
									/>
								</label>
							</div>
						))}
						{mockRoutes.length === 0 && (
							<div className="text-[12px] text-ctp-overlay0 text-center py-8">
								<p>No mock routes defined</p>
								<p className="text-[10px] mt-1">Click &quot;Add Route&quot; to create one</p>
							</div>
						)}
					</div>
				</GlassPanel>

				{/* Request Logs Panel */}
				<GlassPanel className="w-80 flex flex-col p-4 overflow-hidden">
					<div className="flex items-center justify-between mb-3">
						<div className="text-[12px] font-semibold">Request Logs ({requests.length})</div>
						{requests.length > 0 && (
							<button
								onClick={clearRequests}
								className="p-1.5 rounded-md text-ctp-overlay0 hover:text-ctp-red hover:bg-ctp-red/10 transition-colors"
								title="Clear logs"
							>
								<HugeiconsIcon icon={Cancel01Icon} size={13} />
							</button>
						)}
					</div>
					<div className="flex-1 overflow-y-auto space-y-1 pr-1">
						{requests.map((req) => (
							<RequestLogItem key={req.id} request={req} />
						))}
						{requests.length === 0 && (
							<div className="text-[11px] text-ctp-overlay0 text-center py-6">
								{isRunning ? "No requests yet" : "Start server to see requests"}
							</div>
						)}
					</div>
				</GlassPanel>
			</div>
		</div>
	);
}

function RequestLogItem({ request }: { request: MockRequest }) {
	const [expanded, setExpanded] = useState(false);

	const getStatusColor = (status: number) => {
		if (status >= 200 && status < 300) return "text-ctp-green";
		if (status >= 300 && status < 400) return "text-ctp-yellow";
		if (status >= 400 && status < 500) return "text-ctp-peach";
		return "text-ctp-red";
	};

	return (
		<div
			className="bg-ctp-mantle/40 rounded-md p-2 cursor-pointer hover:bg-ctp-surface0/20 transition-colors"
			onClick={() => setExpanded(!expanded)}
		>
			<div className="flex items-center gap-2">
				<span className="text-[10px] text-ctp-overlay0">{formatTime(request.timestamp)}</span>
				<span className={cn("text-[10px] font-mono font-semibold", getStatusColor(request.responseStatus))}>
					{request.responseStatus}
				</span>
				<span className="text-[10px] text-ctp-subtext0 truncate flex-1">{request.path}</span>
				<span className="text-[9px] text-ctp-overlay0">{request.latency}ms</span>
			</div>
			{expanded && (
				<div className="mt-2 pt-2 border-t border-ctp-surface0/20 text-[10px] text-ctp-subtext0">
					<div className="font-mono">{request.method} {request.url}</div>
				</div>
			)}
		</div>
	);
}

function cn(...classes: (string | undefined | false)[]) {
	return classes.filter(Boolean).join(" ");
}
