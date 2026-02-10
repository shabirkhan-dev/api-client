"use client";

import { Copy01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, GlassPanel } from "@/shared/components/ui";
import { cn, formatBytes } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import type { ResponseTab } from "../types";

const tabs: { id: ResponseTab; label: string }[] = [
	{ id: "body", label: "Body" },
	{ id: "headers", label: "Headers" },
	{ id: "cookies", label: "Cookies" },
	{ id: "timeline", label: "Timeline" },
];

export function ResponsePanel() {
	const { lastResponse, setLastResponse } = useAppStore();
	const [activeTab, setActiveTab] = useState<ResponseTab>("body");

	const handleCopy = useCallback(async () => {
		if (!lastResponse) return;
		await navigator.clipboard.writeText(lastResponse.body);
		toast.success("Copied to clipboard");
	}, [lastResponse]);

	const handleClear = useCallback(() => setLastResponse(null), [setLastResponse]);

	const statusVariant = lastResponse
		? lastResponse.status < 300
			? ("success" as const)
			: lastResponse.status < 400
				? ("warning" as const)
				: lastResponse.status < 500
					? ("peach" as const)
					: ("danger" as const)
		: ("default" as const);

	const timeline = lastResponse
		? [
				{ label: "DNS", pct: 10 },
				{ label: "TCP", pct: 20 },
				{ label: "TLS", pct: 20 },
				{ label: "TTFB", pct: 30 },
				{ label: "Download", pct: 20 },
			].map((s) => ({ ...s, ms: Math.max(1, lastResponse.time * (s.pct / 100)) }))
		: [];

	return (
		<GlassPanel className="p-3 flex flex-col gap-2.5 flex-1 min-h-0">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1.5">
					{lastResponse ? (
						<>
							<Badge variant={statusVariant} className="font-mono text-[10px] px-2">
								{lastResponse.status} {lastResponse.statusText}
							</Badge>
							<Badge className="font-mono text-[10px]">{lastResponse.time}ms</Badge>
							<Badge className="font-mono text-[10px]">{formatBytes(lastResponse.size)}</Badge>
							{lastResponse.isMock && (
								<Badge variant="mauve" className="text-[9px]">
									MOCK
								</Badge>
							)}
						</>
					) : (
						<span className="text-[11px] text-ctp-overlay0">No response</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					<Button variant="subtle" size="xs" onClick={handleCopy} disabled={!lastResponse}>
						<HugeiconsIcon icon={Copy01Icon} size={11} />
					</Button>
					<Button variant="subtle" size="xs" onClick={handleClear} disabled={!lastResponse}>
						<HugeiconsIcon icon={Delete02Icon} size={11} />
					</Button>
				</div>
			</div>

			<div className="flex items-center gap-0.5 border-b border-ctp-surface0/30 pb-1.5">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveTab(tab.id)}
						className={cn(
							"px-2.5 py-1 text-[11px] font-medium transition-all rounded-md",
							activeTab === tab.id
								? "text-ctp-text bg-ctp-surface0/40"
								: "text-ctp-overlay0 hover:text-ctp-subtext1 hover:bg-ctp-surface0/20",
						)}
					>
						{tab.label}
					</button>
				))}
			</div>

			<div className="flex-1 overflow-auto">
				{activeTab === "body" && (
					<pre className="text-[11px] font-mono p-3 bg-ctp-crust/30 rounded-lg overflow-auto max-h-full whitespace-pre-wrap break-words text-ctp-subtext1 leading-relaxed">
						{lastResponse?.body
							? (() => {
									try {
										return JSON.stringify(JSON.parse(lastResponse.body), null, 2);
									} catch {
										return lastResponse.body;
									}
								})()
							: "// Response body will appear here"}
					</pre>
				)}
				{activeTab === "headers" && (
					<pre className="text-[11px] font-mono p-3 bg-ctp-crust/30 rounded-lg overflow-auto text-ctp-subtext1 leading-relaxed">
						{lastResponse
							? JSON.stringify(lastResponse.headers, null, 2)
							: "// Headers will appear here"}
					</pre>
				)}
				{activeTab === "cookies" && (
					<pre className="text-[11px] font-mono p-3 bg-ctp-crust/30 rounded-lg text-ctp-subtext1">
						{lastResponse?.headers["set-cookie"] || "No cookies in response"}
					</pre>
				)}
				{activeTab === "timeline" && lastResponse && (
					<div className="space-y-2.5 p-2">
						{timeline.map((seg) => (
							<div key={seg.label} className="space-y-1">
								<div className="flex justify-between text-[11px]">
									<span className="text-ctp-subtext0">{seg.label}</span>
									<span className="text-ctp-overlay1 font-mono">{seg.ms.toFixed(1)}ms</span>
								</div>
								<div className="h-1.5 bg-ctp-surface0/40 rounded-full overflow-hidden">
									<div
										className="h-full rounded-full bg-gradient-to-r from-ctp-lavender/80 to-ctp-lavender/20 transition-all duration-500"
										style={{ width: `${Math.min(100, (seg.ms / lastResponse.time) * 100)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</GlassPanel>
	);
}
