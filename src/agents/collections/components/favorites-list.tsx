"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { MethodBadge } from "@/shared/components/ui";

export function FavoritesList() {
	const { favorites, setMethod, setUrl } = useAppStore();

	if (favorites.length === 0) {
		return <div className="text-xs text-ctp-overlay0 text-center py-2">No favorites</div>;
	}

	return (
		<div className="space-y-1">
			{favorites.map((item) => (
				<button
					key={item.id}
					type="button"
					onClick={() => {
						setMethod(item.method);
						setUrl(item.url);
					}}
					className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-ctp-lavender/5 cursor-pointer transition-colors"
				>
					<MethodBadge method={item.method} />
					<span className="truncate text-ctp-subtext0">{item.url}</span>
				</button>
			))}
		</div>
	);
}
