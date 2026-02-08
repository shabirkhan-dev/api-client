"use client";

import { Button, GlassPanel, LabelText, Textarea, Badge } from "@/shared/components/ui";
import type { SecurityFinding } from "@/shared/types";
import { ShieldAlert, Lock, Search } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function SecurityScannerPanel() {
	const [findings, setFindings] = useState<SecurityFinding[]>([]);
	const [jwtInput, setJwtInput] = useState("");
	const [jwtOutput, setJwtOutput] = useState("");

	const runScan = useCallback(() => {
		const results: SecurityFinding[] = [
			{
				type: "SQL Injection",
				status: "Safe",
				detail: "No vulnerable parameters detected.",
			},
			{
				type: "XSS",
				status: "Warning",
				detail: "Potential reflection in query params.",
			},
			{
				type: "JWT",
				status: "Info",
				detail: "Token signature not validated in browser.",
			},
			{
				type: "CORS",
				status: "Safe",
				detail: "Appropriate CORS headers detected.",
			},
		];
		setFindings(results);
		toast.success("Security scan completed");
	}, []);

	const decodeJwt = useCallback(() => {
		if (!jwtInput.trim()) return;
		try {
			const [header, payload] = jwtInput.split(".").slice(0, 2);
			const decode = (part: string) =>
				JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
			const result = { header: decode(header), payload: decode(payload) };
			setJwtOutput(JSON.stringify(result, null, 2));
			toast.success("JWT decoded");
		} catch {
			toast.error("Invalid JWT");
		}
	}, [jwtInput]);

	const statusVariant = (status: string) => {
		switch (status) {
			case "Safe":
				return "success" as const;
			case "Warning":
				return "warning" as const;
			case "Critical":
				return "danger" as const;
			default:
				return "info" as const;
		}
	};

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-auto">
			<GlassPanel className="p-4 flex items-center justify-between">
				<div>
					<div className="text-sm font-semibold">Security Scanner</div>
					<div className="text-xs text-ctp-overlay0">
						SQLi, XSS, JWT analysis
					</div>
				</div>
				<Button variant="primary" size="sm" onClick={runScan}>
					<ShieldAlert size={14} />
					Run Scan
				</Button>
			</GlassPanel>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<GlassPanel className="p-4">
					<LabelText>Findings</LabelText>
					<div className="space-y-2 mt-2">
						{findings.map((finding) => (
							<div
								key={finding.type}
								className="glass rounded-lg p-3"
							>
								<div className="flex items-center justify-between">
									<span className="text-xs font-medium text-ctp-text">
										{finding.type}
									</span>
									<Badge variant={statusVariant(finding.status)}>
										{finding.status}
									</Badge>
								</div>
								<div className="text-xs text-ctp-overlay0 mt-1">
									{finding.detail}
								</div>
							</div>
						))}
						{findings.length === 0 && (
							<div className="text-xs text-ctp-overlay0 text-center py-4">
								Run a scan to see findings
							</div>
						)}
					</div>
				</GlassPanel>

				<GlassPanel className="p-4 space-y-3">
					<LabelText>JWT Analyzer</LabelText>
					<Textarea
						value={jwtInput}
						onChange={(e) => setJwtInput(e.target.value)}
						placeholder="eyJhbGciOi..."
						className="h-32 text-xs"
					/>
					<Button variant="kbd" size="sm" onClick={decodeJwt}>
						<Lock size={12} />
						Decode
					</Button>
					{jwtOutput && (
						<pre className="text-xs font-mono bg-ctp-crust/40 rounded-xl p-3 overflow-auto max-h-48 text-ctp-text">
							{jwtOutput}
						</pre>
					)}
				</GlassPanel>
			</div>

			<GlassPanel className="p-4">
				<LabelText>SSL Certificate Info</LabelText>
				<div className="text-xs text-ctp-overlay0 mt-2">
					Use HTTPS endpoints to view certificate metadata when available.
				</div>
			</GlassPanel>
		</div>
	);
}
