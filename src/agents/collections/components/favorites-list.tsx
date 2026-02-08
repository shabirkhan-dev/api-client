"use client";

import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { MethodBadge } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/app-store";

export function FavoritesList() {
	const { favorites, setMethod, setUrl } = useAppStore();

	if (favorites.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-10 px-4 text-center text-ctp-overlay0 text-[12px] gap-2">
				<HugeiconsIcon
					icon={StarIcon}
					size={24}
					className="opacity-30 mb-1.5 text-ctp-overlay0"
				/>
				<span className="text-[12px] text-ctp-overlay0">No favorites yet</span>
			</div>
		);
	}

	return (
		<div className="space-y-1 max-h-36 overflow-y-auto">
			{favorites.map((item) => (
				<button
					key={item.id}
					type="button"
					onClick={() => {
						setMethod(item.method);
						setUrl(item.url);
					}}
					className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] hover:bg-ctp-surface0/25 cursor-pointer transition-colors duration-150 group"
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
