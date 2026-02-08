"use client";

import { RequestBar } from "./request-bar";
import { RequestPanel } from "./request-panel";
import { ResponsePanel } from "./response-panel";

export function HttpClientPanel() {
	return (
		<div className="flex-1 flex flex-col gap-4 overflow-hidden">
			<RequestBar />
			<div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0">
				<div className="flex-1 flex flex-col min-h-0 overflow-auto">
					<RequestPanel />
				</div>
				<div className="flex-1 flex flex-col min-h-0 overflow-auto">
					<ResponsePanel />
				</div>
			</div>
		</div>
	);
}
