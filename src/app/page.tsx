"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiDocsPanel } from "@/agents/api-docs";
import { AutoRetryPanel } from "@/agents/auto-retry";
import { CollaborationPanel } from "@/agents/collaboration";
import { Sidebar } from "@/agents/collections";
import { CommandPalette } from "@/agents/command-palette";
import { DataGeneratorPanel } from "@/agents/data-generator";
import { DiffViewerPanel } from "@/agents/diff-viewer";
import { GraphQLPanel } from "@/agents/graphql";
import { HttpClientPanel, useHttpRequest } from "@/agents/http-client";
import { LoadTestingPanel } from "@/agents/load-testing";
import { MockServerPanel } from "@/agents/mock-server";
import { ProfilerPanel } from "@/agents/profiler";
import { RequestChainPanel } from "@/agents/request-chain";
import { SecurityScannerPanel } from "@/agents/security-scanner";
import { WebSocketPanel } from "@/agents/websocket";
import { ToastProvider } from "@/shared/components/ui/toast-provider";
import { WorkspaceProvider } from "@/shared/providers/workspace-provider";
import { useAppStore } from "@/shared/stores/app-store";
import { Header } from "./layout-parts/header";
import { WorkspaceTabs } from "./layout-parts/workspace-tabs";

function WorkspaceContent() {
	const { activeTab } = useAppStore();

	switch (activeTab) {
		case "http":
			return <HttpClientPanel />;
		case "websocket":
			return <WebSocketPanel />;
		case "loadtest":
			return <LoadTestingPanel />;
		case "graphql":
			return <GraphQLPanel />;
		case "docs":
			return <ApiDocsPanel />;
		case "diff":
			return <DiffViewerPanel />;
		case "chain":
			return <RequestChainPanel />;
		case "security":
			return <SecurityScannerPanel />;
		case "retry":
			return <AutoRetryPanel />;
		case "data":
			return <DataGeneratorPanel />;
		case "collab":
			return <CollaborationPanel />;
		case "profiler":
			return <ProfilerPanel />;
		case "mock":
			return <MockServerPanel />;
		default:
			return <HttpClientPanel />;
	}
}

export default function Home() {
	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
	const { sendRequest } = useHttpRequest();

	const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
	const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && (e.key === "p" || e.key === "k")) {
				e.preventDefault();
				setCommandPaletteOpen((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	return (
		<WorkspaceProvider>
			<ToastProvider />

			<div className="min-h-screen p-[var(--space-md)]">
				<div className="min-h-[calc(100vh-var(--space-xl))] flex flex-col rounded-[calc(var(--radius-xl)+4px)] bg-gradient-to-b from-ctp-base/92 to-ctp-base/86 border border-ctp-surface1/20 shadow-[0_0_0_1px_inset] shadow-ctp-surface0/12 overflow-hidden">
					{/* Header */}
					<Header onOpenCommandPalette={openCommandPalette} />

					{/* Main Content */}
					<div className="flex flex-1 overflow-hidden min-h-0">
						{/* Sidebar */}
						<Sidebar />

						{/* Workspace */}
						<main className="flex-1 flex flex-col overflow-hidden min-w-0">
							{/* Tab Bar */}
							<div className="shrink-0 px-[var(--space-lg)] pt-[var(--space-md)]">
								<WorkspaceTabs />
							</div>

							{/* Active Panel */}
							<div className="flex-1 overflow-hidden p-[var(--space-lg)] min-h-0">
								<WorkspaceContent />
							</div>
						</main>
					</div>
				</div>
			</div>

			{/* Command Palette */}
			<CommandPalette
				open={commandPaletteOpen}
				onClose={closeCommandPalette}
				onSendRequest={sendRequest}
			/>
		</WorkspaceProvider>
	);
}
