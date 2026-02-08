"use client";

import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, GlassPanel, Input, Textarea } from "@/shared/components/ui";
import { generateId } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";

export function MockServerPanel() {
	const { mockRoutes, addMockRoute, removeMockRoute, setMockRoutes } = useAppStore();

	const handleAdd = () =>
		addMockRoute({
			id: generateId("mock"),
			path: "/mock",
			status: 200,
			latency: 300,
			contentType: "application/json",
			body: '{"message":"mock response"}',
			condition: "",
		});
	const updateRoute = (id: string, field: string, value: string | number) =>
		setMockRoutes(mockRoutes.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-auto">
			<GlassPanel className="p-3 flex items-center justify-between">
				<div>
					<div className="text-[13px] font-semibold">Mock Server</div>
					<div className="text-[11px] text-ctp-overlay0">Define mock endpoints</div>
				</div>
				<Button variant="primary" size="sm" onClick={handleAdd}>
					<HugeiconsIcon icon={Add01Icon} size={13} /> Add Route
				</Button>
			</GlassPanel>
			<GlassPanel className="p-3 space-y-3">
				{mockRoutes.map((route) => (
					<div key={route.id} className="bg-ctp-crust/30 rounded-lg p-3 space-y-2">
						<div className="flex items-center gap-2">
							<Input
								value={route.path}
								onChange={(e) => updateRoute(route.id, "path", e.target.value)}
								className="flex-1 font-mono text-[11px]"
							/>
							<Button variant="danger" size="xs" onClick={() => removeMockRoute(route.id)}>
								<HugeiconsIcon icon={Delete02Icon} size={11} />
							</Button>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
							<label className="space-y-0.5">
								<span className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">
									Status
								</span>
								<Input
									type="number"
									value={route.status}
									onChange={(e) => updateRoute(route.id, "status", Number(e.target.value))}
									className="text-[11px]"
								/>
							</label>
							<label className="space-y-0.5">
								<span className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">
									Latency
								</span>
								<Input
									type="number"
									value={route.latency}
									onChange={(e) => updateRoute(route.id, "latency", Number(e.target.value))}
									className="text-[11px]"
								/>
							</label>
							<label className="space-y-0.5">
								<span className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Type</span>
								<Input
									value={route.contentType}
									onChange={(e) => updateRoute(route.id, "contentType", e.target.value)}
									className="text-[11px]"
								/>
							</label>
							<label className="space-y-0.5">
								<span className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">
									Condition
								</span>
								<Input
									value={route.condition}
									onChange={(e) => updateRoute(route.id, "condition", e.target.value)}
									className="text-[11px]"
								/>
							</label>
						</div>
						<label className="block space-y-0.5">
							<span className="text-[9px] uppercase text-ctp-overlay0 tracking-wider">Body</span>
							<Textarea
								value={route.body}
								onChange={(e) => updateRoute(route.id, "body", e.target.value)}
								className="h-16 text-[11px]"
							/>
						</label>
					</div>
				))}
				{mockRoutes.length === 0 && (
					<div className="text-[10px] text-ctp-overlay0 text-center py-6">No mock routes</div>
				)}
			</GlassPanel>
		</div>
	);
}
