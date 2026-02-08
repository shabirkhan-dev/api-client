"use client";

import { MethodBadge } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/app-store";

export function FavoritesList() {
	const { favorites, setMethod, setUrl } = useAppStore();

	if (favorites.length === 0) {
		return <div className="text-[10px] text-ctp-overlay0 text-center py-2">No favorites</div>;
	}

	return (
		<div className="space-y-1 max-h-28 overflow-y-auto">
			{favorites.map((item) => (
				<button
					key={item.id}
					type="button"
					onClick={() => {
						setMethod(item.method);
						setUrl(item.url);
					}}
					className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] hover:bg-ctp-surface0/30 cursor-pointer transition-colors"
				>
					<MethodBadge method={item.method} />
					<span className="truncate text-ctp-overlay1">{item.url}</span>
				</button>
			))}
		</div>
	);
}
