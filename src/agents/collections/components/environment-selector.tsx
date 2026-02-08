"use client";

import { LabelText, StatusDot } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/app-store";

const envColors: Record<string, "green" | "yellow" | "red"> = {
	development: "green",
	staging: "yellow",
	production: "red",
};

export function EnvironmentSelector() {
	const { activeEnv, setActiveEnv } = useAppStore();

	return (
		<div className="space-y-1.5">
			<LabelText>Environment</LabelText>
			<div className="flex items-center gap-2">
				<StatusDot color={envColors[activeEnv] || "green"} />
				<select
					value={activeEnv}
					onChange={(e) => setActiveEnv(e.target.value)}
					className="flex-1 bg-transparent border border-ctp-surface0/40 rounded-lg px-2 py-1 text-[11px] text-ctp-subtext1 outline-none"
				>
					<option value="development" className="bg-ctp-base">
						Development
					</option>
					<option value="staging" className="bg-ctp-base">
						Staging
					</option>
					<option value="production" className="bg-ctp-base">
						Production
					</option>
				</select>
			</div>
			<div className="text-[9px] text-ctp-overlay0">Use {"{{variable}}"} syntax in inputs</div>
		</div>
	);
}
