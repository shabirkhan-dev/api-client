"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { Button, GlassPanel, Input, LabelText, Textarea } from "@/shared/components/ui";
import type { ChainNode } from "@/shared/types";
import { generateId } from "@/shared/lib/utils";
import { Link2, Plus, Zap } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function RequestChainPanel() {
	const { method, url, lastResponse, setChainVar, chainVars } = useAppStore();
	const [nodes, setNodes] = useState<ChainNode[]>([]);
	const [jsonPath, setJsonPath] = useState("");
	const [varName, setVarName] = useState("");
	const [condition, setCondition] = useState("");
	const [action, setAction] = useState("");

	const addNode = useCallback(() => {
		setNodes((prev) => [
			...prev,
			{
				id: generateId("chain"),
				method,
				url: url || "URL",
				label: `Step ${prev.length + 1}: ${method} ${url || "URL"}`,
			},
		]);
	}, [method, url]);

	const extract = useCallback(() => {
		if (!jsonPath.trim() || !varName.trim()) {
			toast.error("JSON path and variable name are required");
			return;
		}
		if (!lastResponse) {
			toast.error("No response available");
			return;
		}
		try {
			const data = JSON.parse(lastResponse.body);
			const path = jsonPath.replace(/^\$\./, "").split(".");
			let value: unknown = data;
			for (const key of path) {
				value = (value as Record<string, unknown>)?.[key];
			}
			setChainVar(varName, String(value));
			toast.success(`Variable extracted: ${varName} = ${value}`);
		} catch {
			toast.error("Failed to extract variable");
		}
	}, [jsonPath, varName, lastResponse, setChainVar]);

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-auto">
			<GlassPanel className="p-4 flex items-center justify-between">
				<div>
					<div className="text-sm font-semibold">Request Chaining</div>
					<div className="text-xs text-ctp-overlay0">
						Extract variables and branch logic
					</div>
				</div>
				<Button variant="kbd" size="sm" onClick={addNode}>
					<Plus size={12} />
					Add Node
				</Button>
			</GlassPanel>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<GlassPanel className="p-4">
					<LabelText>Chain Builder</LabelText>
					<div className="space-y-2 mt-2">
						{nodes.map((node, i) => (
							<div
								key={node.id}
								className="glass rounded-lg p-2 text-xs flex items-center gap-2"
							>
								<div className="w-5 h-5 rounded-full bg-ctp-lavender/20 text-ctp-lavender flex items-center justify-center text-[10px] font-bold">
									{i + 1}
								</div>
								<span className="truncate text-ctp-subtext0">{node.label}</span>
							</div>
						))}
						{nodes.length === 0 && (
							<div className="text-xs text-ctp-overlay0 text-center py-4">
								Add nodes to build a chain
							</div>
						)}
					</div>
				</GlassPanel>

				<GlassPanel className="p-4 space-y-3">
					<LabelText>Extraction</LabelText>
					<Input
						value={jsonPath}
						onChange={(e) => setJsonPath(e.target.value)}
						placeholder="$.data.id"
						className="font-mono text-xs"
					/>
					<Input
						value={varName}
						onChange={(e) => setVarName(e.target.value)}
						placeholder="variableName"
						className="text-xs"
					/>
					<Button variant="primary" size="sm" onClick={extract}>
						<Zap size={14} />
						Extract From Last Response
					</Button>
					{Object.entries(chainVars).length > 0 && (
						<div className="text-xs text-ctp-overlay0 mt-2 space-y-1">
							{Object.entries(chainVars).map(([k, v]) => (
								<div key={k}>
									<span className="text-ctp-lavender">{k}</span> = {v}
								</div>
							))}
						</div>
					)}
				</GlassPanel>

				<GlassPanel className="p-4 space-y-3">
					<LabelText>Conditional Branch</LabelText>
					<Input
						value={condition}
						onChange={(e) => setCondition(e.target.value)}
						placeholder="if status == 200"
						className="text-xs"
					/>
					<Textarea
						value={action}
						onChange={(e) => setAction(e.target.value)}
						placeholder="then run step 2"
						className="h-40 text-xs"
					/>
					<Button
						variant="kbd"
						size="sm"
						onClick={() => toast.success("Branch saved")}
					>
						Save Branch
					</Button>
				</GlassPanel>
			</div>
		</div>
	);
}
