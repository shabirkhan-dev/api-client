"use client";

import { RequestBar } from "./request-bar";
import { RequestPanel } from "./request-panel";
import { ResponsePanel } from "./response-panel";

export function HttpClientPanel() {
	return (
		<div className="flex-1 flex flex-col gap-3 overflow-hidden min-h-0">
			{/* Request URL Bar */}
			<RequestBar />

			{/* Request / Response Split */}
			<div className="flex-1 flex flex-col lg:flex-row gap-3 overflow-hidden min-h-0">
				<div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
					<RequestPanel />
				</div>
				<div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
					<ResponsePanel />
				</div>
			</div>
		</div>
	);
}
