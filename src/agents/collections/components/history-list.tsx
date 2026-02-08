"use client";

import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { Input, MethodBadge } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/app-store";

export function HistoryList() {
	const { history, setMethod, setUrl, toggleFavorite, isFavorite } = useAppStore();
	const [search, setSearch] = useState("");

	const filtered = useMemo(
		() => history.filter((item) => item.url.toLowerCase().includes(search.toLowerCase())),
		[history, search],
	);

	return (
		<div className="space-y-1.5">
			<Input
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Filter history..."
				className="h-7 text-[11px]"
			/>
			<div className="max-h-36 overflow-y-auto space-y-1">
				{filtered.map((item) => (
					<div
						key={item.id}
						className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] hover:bg-ctp-surface0/30 cursor-pointer transition-colors group"
					>
						<button
							type="button"
							onClick={() => {
								setMethod(item.method);
								setUrl(item.url);
							}}
							className="flex items-center gap-1.5 flex-1 min-w-0"
						>
							<MethodBadge method={item.method} />
							<span className="truncate text-ctp-overlay1 group-hover:text-ctp-text transition-colors">
								{item.url}
							</span>
						</button>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								toggleFavorite(item);
							}}
							className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
						>
							<HugeiconsIcon
								icon={StarIcon}
								size={11}
								className={
									isFavorite(item.url, item.method) ? "text-ctp-yellow" : "text-ctp-overlay0"
								}
								fill={isFavorite(item.url, item.method) ? "currentColor" : "none"}
							/>
						</button>
					</div>
				))}
				{filtered.length === 0 && (
					<div className="text-[10px] text-ctp-overlay0 text-center py-3">No history</div>
				)}
			</div>
		</div>
	);
}
