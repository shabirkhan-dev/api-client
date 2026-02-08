"use client";

import { Button, GlassPanel, LabelText, Textarea } from "@/shared/components/ui";
import { Database, Play } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

function resolveTemplate(template: string): string {
	return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
		const trimmed = key.trim();
		const generators: Record<string, () => string> = {
			"person.fullName": () =>
				["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince"][
					Math.floor(Math.random() * 4)
				],
			"internet.email": () =>
				`user${Math.floor(Math.random() * 1000)}@example.com`,
			"string.uuid": () =>
				"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
					const r = (Math.random() * 16) | 0;
					return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
				}),
			"number.int": () => String(Math.floor(Math.random() * 1000)),
			"lorem.sentence": () => "Lorem ipsum dolor sit amet consectetur.",
			"date.recent": () => new Date().toISOString(),
		};
		const gen = generators[trimmed];
		return gen ? gen() : trimmed;
	});
}

export function DataGeneratorPanel() {
	const [template, setTemplate] = useState(
		'{"name":"{{person.fullName}}","email":"{{internet.email}}","id":"{{string.uuid}}"}',
	);
	const [output, setOutput] = useState("");

	const generate = useCallback(() => {
		if (!template.trim()) return;
		try {
			const results = Array.from({ length: 5 }, () => {
				const resolved = resolveTemplate(template);
				try {
					return JSON.parse(resolved);
				} catch {
					return resolved;
				}
			});
			setOutput(JSON.stringify(results, null, 2));
			toast.success("Data generated");
		} catch {
			toast.error("Failed to generate data");
		}
	}, [template]);

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-auto">
			<GlassPanel className="p-4 flex items-center justify-between">
				<div>
					<div className="text-sm font-semibold">Data Generator</div>
					<div className="text-xs text-ctp-overlay0">
						Templates with dynamic rules
					</div>
				</div>
				<Button variant="primary" size="sm" onClick={generate}>
					<Play size={14} />
					Generate
				</Button>
			</GlassPanel>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
				<GlassPanel className="p-4">
					<LabelText>Template</LabelText>
					<Textarea
						value={template}
						onChange={(e) => setTemplate(e.target.value)}
						className="h-64 mt-2 text-xs"
						placeholder={'{"name":"{{person.fullName}}","email":"{{internet.email}}"}'}
					/>
					<div className="mt-2 text-[10px] text-ctp-overlay0 space-y-0.5">
						<div>Available: person.fullName, internet.email, string.uuid</div>
						<div>number.int, lorem.sentence, date.recent</div>
					</div>
				</GlassPanel>
				<GlassPanel className="p-4">
					<LabelText>Generated Output</LabelText>
					<Textarea
						value={output}
						readOnly
						className="h-64 mt-2 text-xs"
					/>
				</GlassPanel>
			</div>
		</div>
	);
}
