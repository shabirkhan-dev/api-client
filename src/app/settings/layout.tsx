"use client";

import type { ReactNode } from "react";
import { WorkspaceProvider } from "@/shared/providers/workspace-provider";

export default function SettingsLayout({ children }: { children: ReactNode }) {
	return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
