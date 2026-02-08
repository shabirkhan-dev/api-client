"use client";

import { Download01Icon, Note01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, LabelText, Textarea } from "@/shared/components/ui";
import { downloadFile, escapeHtml } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";

export function ApiDocsPanel() {
	const { collections } = useAppStore();
	const [markdown, setMarkdown] = useState("");

	const generate = useCallback(() => {
		const lines = ["# API Documentation\n"];
		for (const c of collections) {
			lines.push(`## ${c.name}\n`);
			if (c.children) {
				for (const r of c.children) {
					lines.push(
						`### ${r.name}`,
						`- **Method:** \`${r.method || "GET"}\``,
						`- **URL:** \`${r.url || "—"}\`\n`,
					);
				}
			}
		}
		setMarkdown(lines.join("\n"));
		toast.success("Docs generated");
	}, [collections]);

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-auto">
			<GlassPanel className="p-3 flex items-center justify-between">
				<div>
					<div className="text-[13px] font-semibold">API Documentation</div>
					<div className="text-[11px] text-ctp-overlay0">Generate from collections</div>
				</div>
				<div className="flex gap-1.5">
					<Button variant="primary" size="sm" onClick={generate}>
						<HugeiconsIcon icon={Note01Icon} size={13} /> Generate
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => downloadFile(markdown, "api-docs.md", "text/markdown")}
					>
						<HugeiconsIcon icon={Download01Icon} size={12} /> MD
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							downloadFile(
								`<!DOCTYPE html><html><body><pre>${escapeHtml(markdown)}</pre></body></html>`,
								"api-docs.html",
								"text/html",
							)
						}
					>
						<HugeiconsIcon icon={Download01Icon} size={12} /> HTML
					</Button>
				</div>
			</GlassPanel>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1">
				<GlassPanel className="p-3">
					<LabelText>Markdown</LabelText>
					<Textarea
						value={markdown}
						onChange={(e) => setMarkdown(e.target.value)}
						className="h-80 mt-1.5 text-[11px]"
					/>
				</GlassPanel>
				<GlassPanel className="p-3 overflow-auto">
					<LabelText>Preview</LabelText>
					<pre className="text-[11px] text-ctp-subtext0 whitespace-pre-wrap mt-1.5 leading-relaxed">
						{markdown || "Generate to preview"}
					</pre>
				</GlassPanel>
			</div>
		</div>
	);
}
