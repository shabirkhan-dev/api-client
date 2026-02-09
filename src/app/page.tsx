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
import { cn } from "@/shared/lib/utils";
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
	const { compactMode } = useAppStore();

	const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
	const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);

	// Apply compact mode class to document
	useEffect(() => {
		document.documentElement.classList.toggle("compact", compactMode);
	}, [compactMode]);

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

			{/* Main Layout */}
			<div className="h-screen flex flex-col overflow-hidden">
				{/* Floating Header */}
				<Header onOpenCommandPalette={openCommandPalette} />

				{/* Content Area - Below header */}
				<div 
					className={cn(
						"flex-1 flex overflow-hidden",
						compactMode ? "pt-[calc(var(--header-h)+8px)]" : "pt-[calc(var(--header-h)+16px)]"
					)}
				>
					{/* Sidebar */}
					<Sidebar />

					{/* Main Workspace */}
					<main 
						className={cn(
							"flex-1 flex flex-col overflow-hidden min-w-0",
							compactMode ? "px-2 pb-2" : "px-3 pb-3"
						)}
					>
						{/* Floating Tab Bar */}
						<div 
							className={cn(
								"flex justify-center shrink-0",
								compactMode ? "py-1" : "py-2"
							)}
						>
							<WorkspaceTabs />
						</div>

						{/* Active Panel - Card Style */}
						<div 
							className={cn(
								"flex-1 overflow-hidden bg-gradient-to-b from-ctp-mantle/60 to-ctp-crust/60 backdrop-blur-xl backdrop-saturate-150 border border-ctp-surface0/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.3)]",
								compactMode ? "rounded-xl p-2" : "rounded-2xl p-3"
							)}
						>
							<div className="h-full overflow-hidden">
								<WorkspaceContent />
							</div>
						</div>
					</main>
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
