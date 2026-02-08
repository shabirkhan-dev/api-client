"use client";

import { GitCompare, Save } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, LabelText, Textarea } from "@/shared/components/ui";

interface DiffSnapshot {
	id: string;
	label: string;
	left: string;
	right: string;
	timestamp: number;
}

export function DiffViewerPanel() {
	const [left, setLeft] = useState("");
	const [right, setRight] = useState("");
	const [diffOutput, setDiffOutput] = useState<{ type: "add" | "remove" | "same"; text: string }[]>(
		[],
	);
	const [snapshots, setSnapshots] = useState<DiffSnapshot[]>([]);

	const runDiff = useCallback(() => {
		const leftLines = left.split("\n");
		const rightLines = right.split("\n");
		const maxLen = Math.max(leftLines.length, rightLines.length);
		const result: { type: "add" | "remove" | "same"; text: string }[] = [];

		for (let i = 0; i < maxLen; i++) {
			const l = leftLines[i] ?? "";
			const r = rightLines[i] ?? "";
			if (l === r) {
				result.push({ type: "same", text: l });
			} else {
				if (l) result.push({ type: "remove", text: l });
				if (r) result.push({ type: "add", text: r });
			}
		}
		setDiffOutput(result);
		toast.success("Diff computed");
	}, [left, right]);

	const saveSnapshot = useCallback(() => {
		setSnapshots((prev) => [
			...prev,
			{
				id: `snap-${Date.now()}`,
				label: `Snapshot ${new Date().toLocaleTimeString()}`,
				left,
				right,
				timestamp: Date.now(),
			},
		]);
		toast.success("Snapshot saved");
	}, [left, right]);

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-auto">
			<GlassPanel className="p-4 flex items-center justify-between">
				<div className="text-sm font-semibold">Diff Viewer</div>
				<div className="flex gap-2">
					<Button variant="primary" size="sm" onClick={runDiff}>
						<GitCompare size={14} />
						Compare
					</Button>
					<Button variant="kbd" size="sm" onClick={saveSnapshot}>
						<Save size={12} />
						Save Snapshot
					</Button>
				</div>
			</GlassPanel>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<GlassPanel className="p-4">
					<LabelText>Response A</LabelText>
					<Textarea
						value={left}
						onChange={(e) => setLeft(e.target.value)}
						className="h-72 mt-2 text-xs"
					/>
				</GlassPanel>
				<GlassPanel className="p-4">
					<LabelText>Response B</LabelText>
					<Textarea
						value={right}
						onChange={(e) => setRight(e.target.value)}
						className="h-72 mt-2 text-xs"
					/>
				</GlassPanel>
			</div>

			<GlassPanel className="p-4">
				<LabelText>Diff Output</LabelText>
				<div className="text-xs font-mono mt-2 space-y-0.5">
					{diffOutput.map((line, i) => (
						<div
							key={`${line.type}-${i}`}
							className={
								line.type === "add"
									? "text-ctp-green bg-ctp-green/5 px-2 py-0.5 rounded"
									: line.type === "remove"
										? "text-ctp-red bg-ctp-red/5 px-2 py-0.5 rounded"
										: "text-ctp-text px-2 py-0.5"
							}
						>
							{line.type === "add" ? "+ " : line.type === "remove" ? "- " : "  "}
							{line.text}
						</div>
					))}
					{diffOutput.length === 0 && (
						<div className="text-ctp-overlay0 text-center py-4">
							Click Compare to see differences
						</div>
					)}
				</div>
				{snapshots.length > 0 && (
					<div className="mt-4 space-y-1">
						<LabelText>Snapshots</LabelText>
						{snapshots.map((snap) => (
							<div key={snap.id} className="glass rounded-lg p-2 text-xs text-ctp-subtext0">
								{snap.label}
							</div>
						))}
					</div>
				)}
			</GlassPanel>
		</div>
	);
}
