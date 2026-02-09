"use client";

import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { MethodBadge } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/app-store";

export function FavoritesList() {
	const { favorites, setMethod, setUrl } = useAppStore();

	if (favorites.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-[var(--space-xl)] px-[var(--space-lg)] text-center text-ctp-overlay0 text-[11px] gap-[var(--space-xs)]">
				<HugeiconsIcon icon={StarIcon} size={20} className="opacity-30 text-ctp-overlay0" />
				<span>No favorites yet</span>
			</div>
		);
	}

	return (
		<div className="space-y-px max-h-36 overflow-y-auto">
			{favorites.map((item) => (
				<button
					key={item.id}
					type="button"
					onClick={() => {
						setMethod(item.method);
						setUrl(item.url);
					}}
					className="w-full flex items-center gap-[var(--space-sm)] px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-sm)] text-[12px] hover:bg-ctp-surface0/20 cursor-pointer transition-colors duration-150 group"
				>
					<MethodBadge method={item.method} />
					<span className="truncate text-ctp-overlay1 group-hover:text-ctp-text transition-colors duration-150">
						{item.url}
					</span>
				</button>
			))}
		</div>
	);
}
