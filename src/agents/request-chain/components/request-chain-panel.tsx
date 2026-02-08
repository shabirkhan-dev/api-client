"use client";

import { Add01Icon, FlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, Input, LabelText, Textarea } from "@/shared/components/ui";
import { generateId } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import type { ChainNode } from "@/shared/types";

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
		if (!jsonPath.trim() || !varName.trim()) return toast.error("Path and name required");
		if (!lastResponse) return toast.error("No response");
		try {
			const data = JSON.parse(lastResponse.body);
			const path = jsonPath.replace(/^\$\./, "").split(".");
			let value: unknown = data;
			for (const key of path) value = (value as Record<string, unknown>)?.[key];
			setChainVar(varName, String(value));
			toast.success(`${varName} = ${value}`);
		} catch {
			toast.error("Failed to extract");
		}
	}, [jsonPath, varName, lastResponse, setChainVar]);

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-auto">
			<GlassPanel className="p-3 flex items-center justify-between">
				<div>
					<div className="text-[13px] font-semibold">Request Chain</div>
					<div className="text-[11px] text-ctp-overlay0">Extract variables, build flows</div>
				</div>
				<Button variant="outline" size="sm" onClick={addNode}>
					<HugeiconsIcon icon={Add01Icon} size={12} /> Add Node
				</Button>
			</GlassPanel>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
				<GlassPanel className="p-3">
					<LabelText>Chain</LabelText>
					<div className="space-y-1.5 mt-2">
						{nodes.map((n, i) => (
							<div
								key={n.id}
								className="bg-ctp-crust/30 rounded-lg p-2 text-[10px] flex items-center gap-2"
							>
								<div className="w-4 h-4 rounded-full bg-ctp-lavender/15 text-ctp-lavender flex items-center justify-center text-[9px] font-bold shrink-0">
									{i + 1}
								</div>
								<span className="truncate text-ctp-subtext0">{n.label}</span>
							</div>
						))}
						{nodes.length === 0 && (
							<div className="text-[10px] text-ctp-overlay0 text-center py-4">Add nodes</div>
						)}
					</div>
				</GlassPanel>
				<GlassPanel className="p-3 space-y-2">
					<LabelText>Extract Variable</LabelText>
					<Input
						value={jsonPath}
						onChange={(e) => setJsonPath(e.target.value)}
						placeholder="$.data.id"
						className="font-mono text-[11px]"
					/>
					<Input
						value={varName}
						onChange={(e) => setVarName(e.target.value)}
						placeholder="variableName"
						className="text-[11px]"
					/>
					<Button variant="primary" size="sm" onClick={extract}>
						<HugeiconsIcon icon={FlashIcon} size={13} /> Extract
					</Button>
					{Object.keys(chainVars).length > 0 && (
						<div className="text-[10px] text-ctp-overlay0 space-y-0.5 mt-2">
							{Object.entries(chainVars).map(([k, v]) => (
								<div key={k}>
									<span className="text-ctp-lavender">{k}</span> = {v}
								</div>
							))}
						</div>
					)}
				</GlassPanel>
				<GlassPanel className="p-3 space-y-2">
					<LabelText>Conditional</LabelText>
					<Input
						value={condition}
						onChange={(e) => setCondition(e.target.value)}
						placeholder="if status == 200"
						className="text-[11px]"
					/>
					<Textarea
						value={action}
						onChange={(e) => setAction(e.target.value)}
						placeholder="then run step 2"
						className="h-32 text-[11px]"
					/>
					<Button variant="outline" size="sm" onClick={() => toast.success("Branch saved")}>
						Save
					</Button>
				</GlassPanel>
			</div>
		</div>
	);
}
