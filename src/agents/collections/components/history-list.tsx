"use client";

import { Clock01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { Input, MethodBadge } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/app-store";

const IC = 13;

export function HistoryList() {
	const { history, setMethod, setUrl, toggleFavorite, isFavorite } = useAppStore();
	const [search, setSearch] = useState("");

	const filtered = useMemo(
		() => history.filter((item) => item.url.toLowerCase().includes(search.toLowerCase())),
		[history, search],
	);

	return (
		<div className="space-y-[var(--space-sm)]">
			<Input
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Filter history..."
				className="text-[12px]"
			/>

			<div className="max-h-48 overflow-y-auto space-y-px">
				{filtered.map((item) => {
					const fav = isFavorite(item.url, item.method);
					return (
						<div
							key={item.id}
							className="flex items-center gap-[var(--space-sm)] px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-sm)] text-[12px] hover:bg-ctp-surface0/20 cursor-pointer transition-colors duration-150 group"
						>
							<button
								type="button"
								onClick={() => {
									setMethod(item.method);
									setUrl(item.url);
								}}
								className="flex items-center gap-[var(--space-sm)] flex-1 min-w-0"
							>
								<MethodBadge method={item.method} />
								<span className="truncate text-ctp-overlay1 group-hover:text-ctp-text transition-colors duration-150">
									{item.url}
								</span>
							</button>

							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									toggleFavorite(item);
								}}
								className="shrink-0 flex items-center justify-center w-6 h-6 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150 hover:bg-ctp-surface0/30"
								aria-label={fav ? "Remove from favorites" : "Add to favorites"}
							>
								<HugeiconsIcon
									icon={StarIcon}
									size={IC}
									className={fav ? "text-ctp-yellow" : "text-ctp-overlay0 hover:text-ctp-yellow/70"}
									fill={fav ? "currentColor" : "none"}
								/>
							</button>
						</div>
					);
				})}

				{filtered.length === 0 && (
					<div className="flex flex-col items-center justify-center py-[var(--space-xl)] px-[var(--space-lg)] text-center text-ctp-overlay0 text-[11px] gap-[var(--space-xs)]">
						<HugeiconsIcon
							icon={Clock01Icon}
							size={20}
							className="opacity-30 text-ctp-overlay0"
						/>
						<span>
							{history.length === 0 ? "No history yet" : "No matching requests"}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
