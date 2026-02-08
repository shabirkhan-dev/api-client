"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { Badge, GlassPanel, LabelText, Textarea } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";
import type { RequestTab } from "../types";

const tabs: { id: RequestTab; label: string }[] = [
	{ id: "params", label: "Params" },
	{ id: "headers", label: "Headers" },
	{ id: "body", label: "Body" },
	{ id: "auth", label: "Auth" },
	{ id: "tests", label: "Tests" },
];

export function RequestPanel() {
	const [activeTab, setActiveTab] = useState<RequestTab>("params");
	const {
		paramsText,
		headersText,
		bodyText,
		authType,
		authValue,
		preRequestScript,
		testScript,
		setParamsText,
		setHeadersText,
		setBodyText,
		setAuthType,
		setAuthValue,
		setPreRequestScript,
		setTestScript,
	} = useAppStore();

	const counts = {
		params: paramsText.trim() ? paramsText.trim().split("\n").length : 0,
		headers: headersText.trim() ? headersText.trim().split("\n").length : 0,
		body: bodyText.trim() ? bodyText.trim().split("\n").length : 0,
	};

	return (
		<GlassPanel className="p-4 flex flex-col gap-3 flex-1">
			<div className="flex items-center gap-1 border-b border-ctp-surface0 pb-1">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveTab(tab.id)}
						className={cn(
							"flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-150 border-b-2",
							activeTab === tab.id
								? "text-ctp-lavender border-ctp-lavender bg-ctp-lavender/5"
								: "text-ctp-overlay0 border-transparent hover:text-ctp-text",
						)}
					>
						{tab.label}
						{tab.id in counts && counts[tab.id as keyof typeof counts] > 0 && (
							<Badge variant="lavender" className="ml-1">
								{counts[tab.id as keyof typeof counts]}
							</Badge>
						)}
					</button>
				))}
			</div>

			<div className="flex-1 overflow-auto">
				{activeTab === "params" && (
					<div className="space-y-2">
						<LabelText>Query Parameters (key=value)</LabelText>
						<Textarea
							value={paramsText}
							onChange={(e) => setParamsText(e.target.value)}
							placeholder={"page=1\nlimit=25"}
							className="min-h-[120px]"
						/>
					</div>
				)}

				{activeTab === "headers" && (
					<div className="space-y-2">
						<LabelText>Headers (JSON)</LabelText>
						<Textarea
							value={headersText}
							onChange={(e) => setHeadersText(e.target.value)}
							placeholder={'{"Authorization":"Bearer {{token}}"}'}
							className="min-h-[120px]"
						/>
					</div>
				)}

				{activeTab === "body" && (
					<div className="space-y-2">
						<LabelText>Body (JSON / XML / HTML)</LabelText>
						<Textarea
							value={bodyText}
							onChange={(e) => setBodyText(e.target.value)}
							placeholder={'{"message":"Hello Nebula"}'}
							className="min-h-[180px]"
						/>
					</div>
				)}

				{activeTab === "auth" && (
					<div className="space-y-3">
						<LabelText>Authentication</LabelText>
						<div className="grid grid-cols-2 gap-3">
							<input
								value={authType}
								onChange={(e) => setAuthType(e.target.value)}
								placeholder="Bearer / Basic / API Key"
								className="bg-ctp-crust/60 border border-ctp-surface0 rounded-xl px-3 py-2 text-sm text-ctp-text outline-none focus:border-ctp-lavender transition-all"
							/>
							<input
								value={authValue}
								onChange={(e) => setAuthValue(e.target.value)}
								placeholder="Token / Username:Password"
								className="bg-ctp-crust/60 border border-ctp-surface0 rounded-xl px-3 py-2 text-sm text-ctp-text outline-none focus:border-ctp-lavender transition-all"
							/>
						</div>
					</div>
				)}

				{activeTab === "tests" && (
					<div className="space-y-3">
						<LabelText>Pre-request Script</LabelText>
						<Textarea
							value={preRequestScript}
							onChange={(e) => setPreRequestScript(e.target.value)}
							placeholder="pm.environment.set('token', 'abc123');"
							className="min-h-[80px] text-xs"
						/>
						<LabelText>Test Script</LabelText>
						<Textarea
							value={testScript}
							onChange={(e) => setTestScript(e.target.value)}
							placeholder="pm.test('status is 200', () => pm.response.to.have.status(200));"
							className="min-h-[80px] text-xs"
						/>
					</div>
				)}
			</div>
		</GlassPanel>
	);
}
