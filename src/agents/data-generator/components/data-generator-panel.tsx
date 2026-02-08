"use client";

import { PlayIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, LabelText, Textarea } from "@/shared/components/ui";

function resolveTemplate(template: string): string {
	return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
		const k = key.trim();
		const gen: Record<string, () => string> = {
			"person.fullName": () =>
				["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince"][
					Math.floor(Math.random() * 4)
				],
			"internet.email": () => `user${Math.floor(Math.random() * 9999)}@example.com`,
			"string.uuid": () =>
				"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
					const r = (Math.random() * 16) | 0;
					return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
				}),
			"number.int": () => String(Math.floor(Math.random() * 10000)),
			"lorem.sentence": () => "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
			"date.recent": () => new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
			"address.city": () =>
				["New York", "London", "Tokyo", "Berlin", "Sydney"][Math.floor(Math.random() * 5)],
		};
		return gen[k]?.() ?? k;
	});
}

export function DataGeneratorPanel() {
	const [template, setTemplate] = useState(
		'{"name":"{{person.fullName}}","email":"{{internet.email}}","id":"{{string.uuid}}"}',
	);
	const [output, setOutput] = useState("");
	const [count, setCount] = useState(5);

	const generate = useCallback(() => {
		if (!template.trim()) return;
		try {
			const results = Array.from({ length: count }, () => {
				const r = resolveTemplate(template);
				try {
					return JSON.parse(r);
				} catch {
					return r;
				}
			});
			setOutput(JSON.stringify(results, null, 2));
			toast.success(`${count} records generated`);
		} catch {
			toast.error("Failed");
		}
	}, [template, count]);

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-auto">
			<GlassPanel className="p-3 flex items-center justify-between">
				<div>
					<div className="text-[13px] font-semibold">Data Generator</div>
					<div className="text-[11px] text-ctp-overlay0">
						Template-based with dynamic placeholders
					</div>
				</div>
				<div className="flex items-center gap-2">
					<label className="text-[10px] text-ctp-overlay0">
						Count:{" "}
						<input
							type="number"
							value={count}
							onChange={(e) => setCount(Number(e.target.value))}
							className="w-12 h-6 bg-ctp-crust/50 border border-ctp-surface0/50 rounded px-1.5 text-[10px] text-ctp-text outline-none text-center"
						/>
					</label>
					<Button variant="primary" size="sm" onClick={generate}>
						<HugeiconsIcon icon={PlayIcon} size={13} /> Generate
					</Button>
				</div>
			</GlassPanel>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1">
				<GlassPanel className="p-3">
					<LabelText>Template</LabelText>
					<Textarea
						value={template}
						onChange={(e) => setTemplate(e.target.value)}
						className="h-52 mt-1.5 text-[11px]"
					/>
					<div className="mt-1.5 text-[9px] text-ctp-overlay0">
						Available: person.fullName, internet.email, string.uuid, number.int, lorem.sentence,
						date.recent, address.city
					</div>
				</GlassPanel>
				<GlassPanel className="p-3">
					<LabelText>Output</LabelText>
					<Textarea value={output} readOnly className="h-52 mt-1.5 text-[11px]" />
				</GlassPanel>
			</div>
		</div>
	);
}
