"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { Button, GlassPanel, Input, LabelText, Textarea } from "@/shared/components/ui";
import { generateId } from "@/shared/lib/utils";
import { Server, Plus, Trash2 } from "lucide-react";

export function MockServerPanel() {
	const { mockRoutes, addMockRoute, removeMockRoute, setMockRoutes } = useAppStore();

	const handleAdd = () => {
		addMockRoute({
			id: generateId("mock"),
			path: "/mock",
			status: 200,
			latency: 300,
			contentType: "application/json",
			body: '{"message":"mock response"}',
			condition: "",
		});
	};

	const updateRoute = (id: string, field: string, value: string | number) => {
		setMockRoutes(
			mockRoutes.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
		);
	};

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-auto">
			<GlassPanel className="p-4 flex items-center justify-between">
				<div>
					<div className="text-sm font-semibold">Mock Server</div>
					<div className="text-xs text-ctp-overlay0">
						Create endpoints with latency & conditions
					</div>
				</div>
				<Button variant="primary" size="sm" onClick={handleAdd}>
					<Plus size={14} />
					Add Mock Route
				</Button>
			</GlassPanel>

			<GlassPanel className="p-4">
				<div className="space-y-4">
					{mockRoutes.map((route) => (
						<div key={route.id} className="glass rounded-xl p-3 space-y-3">
							<div className="flex items-center justify-between">
								<Input
									value={route.path}
									onChange={(e) => updateRoute(route.id, "path", e.target.value)}
									className="flex-1 font-mono text-xs"
								/>
								<Button
									variant="danger"
									size="sm"
									onClick={() => removeMockRoute(route.id)}
									className="ml-2"
								>
									<Trash2 size={12} />
								</Button>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
								<div className="space-y-1">
									<label className="text-[10px] uppercase text-ctp-overlay0">
										Status
									</label>
									<Input
										type="number"
										value={route.status}
										onChange={(e) =>
											updateRoute(route.id, "status", Number(e.target.value))
										}
										className="text-xs"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-[10px] uppercase text-ctp-overlay0">
										Latency (ms)
									</label>
									<Input
										type="number"
										value={route.latency}
										onChange={(e) =>
											updateRoute(route.id, "latency", Number(e.target.value))
										}
										className="text-xs"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-[10px] uppercase text-ctp-overlay0">
										Content Type
									</label>
									<Input
										value={route.contentType}
										onChange={(e) =>
											updateRoute(route.id, "contentType", e.target.value)
										}
										className="text-xs"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-[10px] uppercase text-ctp-overlay0">
										Condition
									</label>
									<Input
										value={route.condition}
										onChange={(e) =>
											updateRoute(route.id, "condition", e.target.value)
										}
										placeholder="Optional"
										className="text-xs"
									/>
								</div>
							</div>
							<div className="space-y-1">
								<label className="text-[10px] uppercase text-ctp-overlay0">
									Response Body
								</label>
								<Textarea
									value={route.body}
									onChange={(e) => updateRoute(route.id, "body", e.target.value)}
									className="h-20 text-xs"
								/>
							</div>
						</div>
					))}
					{mockRoutes.length === 0 && (
						<div className="text-xs text-ctp-overlay0 text-center py-8">
							No mock routes configured. Add one to get started.
						</div>
					)}
				</div>
			</GlassPanel>
		</div>
	);
}
