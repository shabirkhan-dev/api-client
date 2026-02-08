"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { Button, GlassPanel, LabelText, Textarea } from "@/shared/components/ui";
import { downloadFile, escapeHtml } from "@/shared/lib/utils";
import { FileText, Download } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function ApiDocsPanel() {
	const { collections } = useAppStore();
	const [markdown, setMarkdown] = useState("");

	const generate = useCallback(() => {
		const lines = ["# API Documentation", ""];
		for (const collection of collections) {
			lines.push(`## ${collection.name}`);
			if (collection.children) {
				for (const req of collection.children) {
					lines.push(`### ${req.name}`);
					lines.push(`- Method: ${req.method || "GET"}`);
					lines.push(`- URL: ${req.url || "https://api.example.com"}`);
					lines.push("");
				}
			}
		}
		setMarkdown(lines.join("\n"));
		toast.success("Documentation generated");
	}, [collections]);

	const exportMd = useCallback(() => {
		downloadFile(markdown, "nebula-api-docs.md", "text/markdown");
	}, [markdown]);

	const exportHtml = useCallback(() => {
		const html = `<!DOCTYPE html><html><head><title>API Docs</title></head><body><pre>${escapeHtml(markdown)}</pre></body></html>`;
		downloadFile(html, "nebula-api-docs.html", "text/html");
	}, [markdown]);

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-auto">
			<GlassPanel className="p-4 flex items-center justify-between">
				<div>
					<div className="text-sm font-semibold">API Documentation Generator</div>
					<div className="text-xs text-ctp-overlay0">
						Generate docs from collections and history
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="primary" size="sm" onClick={generate}>
						<FileText size={14} />
						Generate
					</Button>
					<Button variant="kbd" size="sm" onClick={exportMd}>
						<Download size={12} />
						Markdown
					</Button>
					<Button variant="kbd" size="sm" onClick={exportHtml}>
						<Download size={12} />
						HTML
					</Button>
				</div>
			</GlassPanel>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
				<GlassPanel className="p-4">
					<LabelText>Markdown</LabelText>
					<Textarea
						value={markdown}
						onChange={(e) => setMarkdown(e.target.value)}
						className="h-96 mt-2 text-xs"
					/>
				</GlassPanel>
				<GlassPanel className="p-4 overflow-auto">
					<LabelText>Preview</LabelText>
					<div className="prose prose-invert max-w-none text-sm mt-2">
						<pre className="text-xs text-ctp-subtext0 whitespace-pre-wrap">
							{markdown || "Generate documentation to see preview"}
						</pre>
					</div>
				</GlassPanel>
			</div>
		</div>
	);
}
