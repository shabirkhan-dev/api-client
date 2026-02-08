"use client";

import { GitCompareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, LabelText, Textarea } from "@/shared/components/ui";

export function DiffViewerPanel() {
	const [left, setLeft] = useState("");
	const [right, setRight] = useState("");
	const [diff, setDiff] = useState<{ type: "add" | "remove" | "same"; text: string }[]>([]);

	const runDiff = useCallback(() => {
		const lLines = left.split("\n");
		const rLines = right.split("\n");
		const maxLen = Math.max(lLines.length, rLines.length);
		const result: typeof diff = [];
		for (let i = 0; i < maxLen; i++) {
			const l = lLines[i] ?? "";
			const r = rLines[i] ?? "";
			if (l === r) result.push({ type: "same", text: l });
			else {
				if (l) result.push({ type: "remove", text: l });
				if (r) result.push({ type: "add", text: r });
			}
		}
		setDiff(result);
		toast.success("Diff computed");
	}, [left, right]);

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-auto">
			<GlassPanel className="p-3 flex items-center justify-between">
				<div className="text-[13px] font-semibold">Diff Viewer</div>
				<Button variant="primary" size="sm" onClick={runDiff}>
					<HugeiconsIcon icon={GitCompareIcon} size={13} /> Compare
				</Button>
			</GlassPanel>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
				<GlassPanel className="p-3">
					<LabelText>Response A</LabelText>
					<Textarea
						value={left}
						onChange={(e) => setLeft(e.target.value)}
						className="h-60 mt-1.5 text-[11px]"
					/>
				</GlassPanel>
				<GlassPanel className="p-3">
					<LabelText>Response B</LabelText>
					<Textarea
						value={right}
						onChange={(e) => setRight(e.target.value)}
						className="h-60 mt-1.5 text-[11px]"
					/>
				</GlassPanel>
			</div>
			<GlassPanel className="p-3">
				<LabelText>Diff</LabelText>
				<div className="text-[10px] font-mono mt-1.5 space-y-px">
					{diff.map((line, i) => (
						<div
							key={`${line.type}-${i}`}
							className={
								line.type === "add"
									? "text-ctp-green bg-ctp-green/5 px-2 py-0.5 rounded"
									: line.type === "remove"
										? "text-ctp-red bg-ctp-red/5 px-2 py-0.5 rounded"
										: "text-ctp-subtext0 px-2 py-0.5"
							}
						>
							{line.type === "add" ? "+ " : line.type === "remove" ? "- " : "  "}
							{line.text}
						</div>
					))}
					{diff.length === 0 && (
						<div className="text-ctp-overlay0 text-center py-4">Compare to see diff</div>
					)}
				</div>
			</GlassPanel>
		</div>
	);
}
