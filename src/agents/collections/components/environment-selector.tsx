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
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<LabelText>Environment</LabelText>
				<StatusDot color={envColors[activeEnv] || "green"} pulse={activeEnv === "production"} />
			</div>

			<select
				value={activeEnv}
				onChange={(e) => setActiveEnv(e.target.value)}
				className="w-full h-9 px-3.5 text-[13px] font-medium rounded-lg border border-ctp-surface0/40 bg-ctp-mantle/40 text-ctp-subtext1 outline-none cursor-pointer transition-all duration-[180ms] hover:border-ctp-surface1/50 focus-visible:border-ctp-lavender/45 focus-visible:shadow-[0_0_0_1px_inset,0_0_0_3px] focus-visible:shadow-ctp-lavender/15"
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

			<p className="text-[11px] text-ctp-overlay0/70 leading-relaxed">
				Use <code className="text-ctp-lavender/60 font-mono text-[11px]">{"{{variable}}"}</code>{" "}
				syntax in request fields
			</p>
		</div>
	);
}
