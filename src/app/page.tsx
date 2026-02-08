"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { ToastProvider } from "@/shared/components/ui/toast-provider";
import { Header } from "./layout-parts/header";
import { WorkspaceTabs } from "./layout-parts/workspace-tabs";
import { Sidebar } from "@/agents/collections";
import { HttpClientPanel } from "@/agents/http-client";
import { WebSocketPanel } from "@/agents/websocket";
import { LoadTestingPanel } from "@/agents/load-testing";
import { GraphQLPanel } from "@/agents/graphql";
import { ApiDocsPanel } from "@/agents/api-docs";
import { DiffViewerPanel } from "@/agents/diff-viewer";
import { RequestChainPanel } from "@/agents/request-chain";
import { SecurityScannerPanel } from "@/agents/security-scanner";
import { AutoRetryPanel } from "@/agents/auto-retry";
import { DataGeneratorPanel } from "@/agents/data-generator";
import { CollaborationPanel } from "@/agents/collaboration";
import { ProfilerPanel } from "@/agents/profiler";
import { MockServerPanel } from "@/agents/mock-server";
import { CommandPalette } from "@/agents/command-palette";
import { useHttpRequest } from "@/agents/http-client";
import { useState, useCallback, useEffect } from "react";

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
		<>
			<ToastProvider />
			<div className="min-h-screen flex flex-col">
				<Header onOpenCommandPalette={openCommandPalette} />

				<div className="flex flex-1 overflow-hidden">
					<Sidebar />

					<main className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
						<WorkspaceTabs />
						<WorkspaceContent />
					</main>
				</div>
			</div>

			<CommandPalette
				open={commandPaletteOpen}
				onClose={closeCommandPalette}
				onSendRequest={sendRequest}
			/>
		</>
	);
}
