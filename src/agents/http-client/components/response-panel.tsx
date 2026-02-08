"use client";

import { Copy01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, GlassPanel } from "@/shared/components/ui";
import { cn, formatBytes } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import type { ResponseTab } from "../types";

const ICON = 16;

const tabs: { id: ResponseTab; label: string }[] = [
	{ id: "body", label: "Body" },
	{ id: "headers", label: "Headers" },
	{ id: "cookies", label: "Cookies" },
	{ id: "timeline", label: "Timeline" },
];

const timelinePhases = [
	{ label: "DNS Lookup", pct: 10, color: "bg-ctp-teal" },
	{ label: "TCP Connect", pct: 20, color: "bg-ctp-blue" },
	{ label: "TLS Handshake", pct: 20, color: "bg-ctp-sapphire" },
	{ label: "Time to First Byte", pct: 30, color: "bg-ctp-lavender" },
	{ label: "Content Download", pct: 20, color: "bg-ctp-mauve" },
] as const;

function getStatusVariant(
	status: number,
): "success" | "warning" | "peach" | "danger" {
	if (status < 300) return "success";
	if (status < 400) return "warning";
	if (status < 500) return "peach";
	return "danger";
}

function formatBody(body: string): string {
	try {
		return JSON.stringify(JSON.parse(body), null, 2);
	} catch {
		return body;
	}
}

function EmptyState({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center justify-center h-full min-h-32 gap-2">
			<p className="text-[12px] text-ctp-overlay0/50 text-center select-none">
				{message}
			</p>
		</div>
	);
}

export function ResponsePanel() {
	const { lastResponse, setLastResponse } = useAppStore();
	const [activeTab, setActiveTab] = useState<ResponseTab>("body");

	const handleCopy = useCallback(async () => {
		if (!lastResponse) return;
		await navigator.clipboard.writeText(lastResponse.body);
		toast.success("Copied to clipboard");
	}, [lastResponse]);

	const handleClear = useCallback(
		() => setLastResponse(null),
		[setLastResponse],
	);

	const timeline = lastResponse
		? timelinePhases.map((phase) => ({
				...phase,
				ms: Math.max(0.1, lastResponse.time * (phase.pct / 100)),
			}))
		: [];

	const headerEntries = lastResponse
		? Object.entries(lastResponse.headers)
		: [];

	return (
		<GlassPanel
			noPadding
			className="flex flex-col flex-1 min-h-0 overflow-hidden"
		>
			{/* Status Bar */}
			<div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
				<div className="flex items-center gap-2.5 min-w-0">
					{lastResponse ? (
						<>
							<Badge
								variant={getStatusVariant(lastResponse.status)}
								className="font-mono tabular-nums"
							>
								{lastResponse.status} {lastResponse.statusText}
							</Badge>
							<Badge className="font-mono tabular-nums">
								{lastResponse.time}ms
							</Badge>
							<Badge className="font-mono tabular-nums">
								{formatBytes(lastResponse.size)}
							</Badge>
							{lastResponse.isMock && <Badge variant="mauve">MOCK</Badge>}
						</>
					) : (
						<span className="text-[13px] text-ctp-overlay0/60 select-none">
							No response yet
						</span>
					)}
				</div>

				{/* Actions */}
				<div className="flex items-center gap-1.5 shrink-0">
					<Button
						variant="subtle"
						size="xs"
						onClick={handleCopy}
						disabled={!lastResponse}
						aria-label="Copy response"
					>
						<HugeiconsIcon icon={Copy01Icon} size={ICON} strokeWidth={1.5} />
					</Button>
					<Button
						variant="subtle"
						size="xs"
						onClick={handleClear}
						disabled={!lastResponse}
						aria-label="Clear response"
					>
						<HugeiconsIcon icon={Delete02Icon} size={ICON} strokeWidth={1.5} />
					</Button>
				</div>
			</div>

			{/* Tab Bar */}
			<div className="shrink-0 px-5 pb-4">
				<div className="flex items-center gap-1 p-1.5 rounded-xl bg-ctp-mantle/35 border border-ctp-surface0/15">
					{tabs.map((tab) => {
						const isActive = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"flex items-center justify-center px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 cursor-pointer select-none",
									isActive
										? "text-ctp-text bg-ctp-surface0/55 shadow-sm"
										: "text-ctp-overlay0 hover:text-ctp-subtext1 hover:bg-ctp-surface0/20",
								)}
							>
								{tab.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Divider */}
			<div className="mx-5 h-px bg-ctp-surface0/22 my-1" />

			{/* Tab Content */}
			<div className="flex-1 overflow-auto p-5 min-h-0">
				{/* Body */}
				{activeTab === "body" && (
					<div className="h-full">
						{lastResponse?.body ? (
							<pre className="bg-ctp-mantle/50 border border-ctp-surface0/20 rounded-[var(--radius-lg)] p-4 font-mono text-[13px] leading-[1.7] text-ctp-subtext1 whitespace-pre-wrap break-words h-full max-h-full overflow-auto">
								{formatBody(lastResponse.body)}
							</pre>
						) : (
							<EmptyState message="Send a request to see the response body" />
						)}
					</div>
				)}

				{/* Headers */}
				{activeTab === "headers" && (
					<div>
						{headerEntries.length > 0 ? (
							<div className="space-y-0.5">
								{headerEntries.map(([key, value]) => (
									<div
										key={key}
										className="flex items-start gap-4 px-4 py-2.5 rounded-lg hover:bg-ctp-surface0/15 transition-colors duration-100"
									>
										<span className="text-[13px] font-mono font-medium text-ctp-lavender/70 shrink-0 min-w-40 select-all">
											{key}
										</span>
										<span className="text-[13px] font-mono text-ctp-subtext0 break-all select-all">
											{value}
										</span>
									</div>
								))}
								<div className="pt-4 px-4">
									<span className="text-[11px] text-ctp-overlay0/50 tabular-nums">
										{headerEntries.length} header
										{headerEntries.length !== 1 ? "s" : ""}
									</span>
								</div>
							</div>
						) : (
							<EmptyState
								message={
									lastResponse
										? "No headers in response"
										: "Send a request to see response headers"
								}
							/>
						)}
					</div>
				)}

				{/* Cookies */}
				{activeTab === "cookies" && (
					<div>
						{lastResponse?.headers["set-cookie"] ? (
							<pre className="bg-ctp-mantle/50 border border-ctp-surface0/20 rounded-[var(--radius-lg)] p-4 font-mono text-[13px] leading-[1.7] text-ctp-subtext1 whitespace-pre-wrap break-words overflow-auto">
								{lastResponse.headers["set-cookie"]}
							</pre>
						) : (
							<EmptyState
								message={
									lastResponse
										? "No cookies in response"
										: "Send a request to see cookies"
								}
							/>
						)}
					</div>
				)}

				{/* Timeline */}
				{activeTab === "timeline" && (
					<div>
						{lastResponse ? (
							<div className="space-y-6">
								{/* Total */}
								<div className="flex items-center justify-between">
									<span className="text-[12px] text-ctp-overlay0 uppercase tracking-widest font-semibold">
										Total Time
									</span>
									<span className="text-[16px] font-mono font-bold text-ctp-text tabular-nums">
										{lastResponse.time}ms
									</span>
								</div>

								{/* Phase Breakdown */}
								<div className="space-y-5">
									{timeline.map((phase) => {
										const widthPct = Math.min(
											100,
											(phase.ms / lastResponse.time) * 100,
										);

										return (
											<div key={phase.label} className="space-y-2">
												<div className="flex items-center justify-between">
													<span className="text-[13px] text-ctp-subtext0 font-medium">
														{phase.label}
													</span>
													<span className="text-[13px] font-mono text-ctp-overlay1 tabular-nums">
														{phase.ms.toFixed(1)}ms
													</span>
												</div>

												<div className="h-2.5 bg-ctp-surface0/20 rounded-full overflow-hidden">
													<div
														className={cn(
															"h-full rounded-full transition-all duration-700 ease-out opacity-70",
															phase.color,
														)}
														style={{ width: `${widthPct}%` }}
													/>
												</div>
											</div>
										);
									})}
								</div>

								{/* Legend */}
								<div className="flex flex-wrap gap-x-5 gap-y-2.5 pt-4 border-t border-ctp-surface0/15">
									{timeline.map((phase) => (
										<div key={phase.label} className="flex items-center gap-2">
											<div
												className={cn(
													"w-3 h-3 rounded-full opacity-70",
													phase.color,
												)}
											/>
											<span className="text-[12px] text-ctp-overlay0">
												{phase.label}
											</span>
										</div>
									))}
								</div>
							</div>
						) : (
							<EmptyState message="Send a request to see the timing breakdown" />
						)}
					</div>
				)}
			</div>
		</GlassPanel>
	);
}
