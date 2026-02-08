"use client";

import { useState } from "react";
import { GlassPanel, Input, LabelText, Textarea } from "@/shared/components/ui";
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

	return (
		<GlassPanel noPadding className="flex flex-col flex-1 min-h-0 overflow-hidden">
			{/* Tab Bar */}
			<div className="shrink-0 px-5 pt-5 pb-4">
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
				{activeTab === "params" && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<LabelText>Query Parameters</LabelText>
							<span className="text-[10px] text-ctp-overlay0/60 font-mono">key=value per line</span>
						</div>
						<Textarea
							value={store.paramsText}
							onChange={(e) => store.setParamsText(e.target.value)}
							placeholder={"page=1\nlimit=25\nsort=created_at"}
							className="min-h-35"
							spellCheck={false}
						/>
					</div>
				)}

				{activeTab === "headers" && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<LabelText>Request Headers</LabelText>
							<span className="text-[10px] text-ctp-overlay0/60 font-mono">JSON format</span>
						</div>
						<Textarea
							value={store.headersText}
							onChange={(e) => store.setHeadersText(e.target.value)}
							placeholder={
								'{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{token}}"\n}'
							}
							className="min-h-35"
							spellCheck={false}
						/>
					</div>
				)}

				{activeTab === "body" && (
					<div className="space-y-4">
						<LabelText>Request Body</LabelText>
						<Textarea
							value={store.bodyText}
							onChange={(e) => store.setBodyText(e.target.value)}
							placeholder={'{\n  "name": "Example",\n  "version": 1,\n  "active": true\n}'}
							className="min-h-55"
							spellCheck={false}
						/>
					</div>
				)}

				{activeTab === "auth" && (
					<div className="space-y-5">
						<LabelText>Authentication</LabelText>

						<div className="space-y-4">
							<label className="block space-y-2">
								<span className="text-[12px] text-ctp-overlay1 font-medium">Type</span>
								<Input
									value={store.authType}
									onChange={(e) => store.setAuthType(e.target.value)}
									placeholder="Bearer / Basic / API Key"
									className="w-full"
									spellCheck={false}
								/>
							</label>

							<label className="block space-y-2">
								<span className="text-[12px] text-ctp-overlay1 font-medium">Credentials</span>
								<Input
									value={store.authValue}
									onChange={(e) => store.setAuthValue(e.target.value)}
									placeholder="Token or credentials value"
									className="w-full font-mono"
									spellCheck={false}
								/>
							</label>
						</div>

						<div className="p-4 rounded-xl bg-ctp-mantle/25 border border-ctp-surface0/15">
							<p className="text-[12px] text-ctp-overlay0/70 leading-relaxed">
								Use{" "}
								<code className="text-ctp-lavender/70 font-mono text-[12px] bg-ctp-surface0/20 px-1.5 py-0.5 rounded">
									{"{{token}}"}
								</code>{" "}
								to reference environment variables.
							</p>
						</div>
					</div>
				)}

				{activeTab === "tests" && (
					<div className="space-y-6">
						<div className="space-y-4">
							<LabelText>Pre-request Script</LabelText>
							<Textarea
								value={store.preRequestScript}
								onChange={(e) => store.setPreRequestScript(e.target.value)}
								placeholder="// Runs before the request is sent&#10;pm.environment.set('token', 'abc123');"
								className="min-h-25"
								spellCheck={false}
							/>
						</div>

						<div className="space-y-4">
							<LabelText>Test Script</LabelText>
							<Textarea
								value={store.testScript}
								onChange={(e) => store.setTestScript(e.target.value)}
								placeholder={
									"// Runs after the response is received\npm.test('status is 200', () => {\n  pm.response.to.have.status(200);\n});"
								}
								className="min-h-25"
								spellCheck={false}
							/>
						</div>
					</div>
				)}
			</div>
		</GlassPanel>
	);
}
