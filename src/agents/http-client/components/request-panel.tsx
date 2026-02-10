"use client";

import { useState } from "react";
import { Badge, GlassPanel, LabelText, Textarea } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import type { RequestTab } from "../types";

const tabs: { id: RequestTab; label: string }[] = [
	{ id: "params", label: "Params" },
	{ id: "headers", label: "Headers" },
	{ id: "body", label: "Body" },
	{ id: "auth", label: "Auth" },
	{ id: "tests", label: "Scripts" },
];

export function RequestPanel() {
	const [activeTab, setActiveTab] = useState<RequestTab>("params");
	const store = useAppStore();

	const counts: Record<string, number> = {
		params: store.paramsText.trim() ? store.paramsText.trim().split("\n").length : 0,
		headers: store.headersText.trim() ? store.headersText.trim().split("\n").length : 0,
		body: store.bodyText.trim() ? 1 : 0,
	};

	return (
		<GlassPanel className="p-3 flex flex-col gap-2.5 flex-1 min-h-0">
			<div className="flex items-center gap-0.5 border-b border-ctp-surface0/30 pb-1.5">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveTab(tab.id)}
						className={cn(
							"flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium transition-all duration-150 rounded-md",
							activeTab === tab.id
								? "text-ctp-text bg-ctp-surface0/40"
								: "text-ctp-overlay0 hover:text-ctp-subtext1 hover:bg-ctp-surface0/20",
						)}
					>
						{tab.label}
						{counts[tab.id] > 0 && (
							<Badge variant="accent" className="text-[8px] px-1 py-0">
								{counts[tab.id]}
							</Badge>
						)}
					</button>
				))}
			</div>

			<div className="flex-1 overflow-auto">
				{activeTab === "params" && (
					<div className="space-y-1.5">
						<LabelText>Query Parameters (key=value per line)</LabelText>
						<Textarea
							value={store.paramsText}
							onChange={(e) => store.setParamsText(e.target.value)}
							placeholder={"page=1\nlimit=25"}
							className="min-h-[100px]"
						/>
					</div>
				)}
				{activeTab === "headers" && (
					<div className="space-y-1.5">
						<LabelText>Headers (JSON format)</LabelText>
						<Textarea
							value={store.headersText}
							onChange={(e) => store.setHeadersText(e.target.value)}
							placeholder={'{\n  "Authorization": "Bearer {{token}}"\n}'}
							className="min-h-[100px]"
						/>
					</div>
				)}
				{activeTab === "body" && (
					<div className="space-y-1.5">
						<LabelText>Request Body</LabelText>
						<Textarea
							value={store.bodyText}
							onChange={(e) => store.setBodyText(e.target.value)}
							placeholder={'{\n  "name": "Nebula",\n  "version": 1\n}'}
							className="min-h-[160px]"
						/>
					</div>
				)}
				{activeTab === "auth" && (
					<div className="space-y-2">
						<LabelText>Authentication</LabelText>
						<div className="grid grid-cols-2 gap-2">
							<label className="space-y-1">
								<span className="text-[10px] text-ctp-overlay0">Type</span>
								<input
									value={store.authType}
									onChange={(e) => store.setAuthType(e.target.value)}
									placeholder="Bearer / Basic / API Key"
									className="w-full h-8 bg-ctp-crust/50 border border-ctp-surface0/60 rounded-lg px-2.5 text-[12px] text-ctp-text outline-none input-focus"
								/>
							</label>
							<label className="space-y-1">
								<span className="text-[10px] text-ctp-overlay0">Value</span>
								<input
									value={store.authValue}
									onChange={(e) => store.setAuthValue(e.target.value)}
									placeholder="Token / credentials"
									className="w-full h-8 bg-ctp-crust/50 border border-ctp-surface0/60 rounded-lg px-2.5 text-[12px] text-ctp-text outline-none input-focus"
								/>
							</label>
						</div>
					</div>
				)}
				{activeTab === "tests" && (
					<div className="space-y-2.5">
						<div className="space-y-1.5">
							<LabelText>Pre-request Script</LabelText>
							<Textarea
								value={store.preRequestScript}
								onChange={(e) => store.setPreRequestScript(e.target.value)}
								placeholder="pm.environment.set('token', 'abc123');"
								className="min-h-[70px] text-[11px]"
							/>
						</div>
						<div className="space-y-1.5">
							<LabelText>Test Script</LabelText>
							<Textarea
								value={store.testScript}
								onChange={(e) => store.setTestScript(e.target.value)}
								placeholder="pm.test('status is 200', () => pm.response.to.have.status(200));"
								className="min-h-[70px] text-[11px]"
							/>
						</div>
					</div>
				)}
			</div>
		</GlassPanel>
	);
}
