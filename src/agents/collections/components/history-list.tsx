"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { MethodBadge, Input } from "@/shared/components/ui";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { Star } from "lucide-react";
import { useState, useMemo } from "react";

export function HistoryList() {
	const { history, favorites, setMethod, setUrl, toggleFavorite, isFavorite } = useAppStore();
	const [search, setSearch] = useState("");

	const filtered = useMemo(
		() =>
			history.filter((item) =>
				item.url.toLowerCase().includes(search.toLowerCase()),
			),
		[history, search],
	);

	return (
		<div className="space-y-2">
			<Input
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Search history..."
				className="h-7 text-xs"
			/>
			<div className="max-h-40 overflow-y-auto space-y-1">
				{filtered.map((item) => (
					<div
						key={item.id}
						className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-ctp-lavender/5 cursor-pointer transition-colors group"
					>
						<button
							type="button"
							onClick={() => {
								setMethod(item.method);
								setUrl(item.url);
							}}
							className="flex items-center gap-2 flex-1 min-w-0"
						>
							<MethodBadge method={item.method} />
							<span className="truncate text-ctp-subtext0">{item.url}</span>
						</button>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								toggleFavorite(item);
							}}
							className="opacity-0 group-hover:opacity-100 transition-opacity"
						>
							<Star
								size={12}
								className={
									isFavorite(item.url, item.method)
										? "text-ctp-yellow fill-ctp-yellow"
										: "text-ctp-overlay0"
								}
							/>
						</button>
					</div>
				))}
				{filtered.length === 0 && (
					<div className="text-xs text-ctp-overlay0 text-center py-3">
						No history yet
					</div>
				)}
			</div>
		</div>
	);
}
