"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useWorkspaceContext } from "@/shared/providers/workspace-provider";
import { useAppStore } from "@/shared/stores/app-store";

/**
 * Hook that saves the current HTTP client state back to the
 * server-backed collection item.
 */
export function useSaveRequest() {
	const store = useAppStore();
	const { updateItem, refetchCollections } = useWorkspaceContext();

	const saveRequest = useCallback(async () => {
		const { activeRequestItemId, method, url, headersText, bodyText, paramsText } = store;

		if (!activeRequestItemId) {
			toast.error("No collection item loaded — use 'Save As' to create one first");
			return;
		}

		let headers: Record<string, string> = {};
		try {
			headers = headersText.trim() ? JSON.parse(headersText) : {};
		} catch {
			headers = {};
		}

		await updateItem(activeRequestItemId, {
			method,
			url,
			headers,
			body: bodyText || undefined,
			params: paramsText || undefined,
		});

		store.markRequestClean();
		await refetchCollections();
	}, [store, updateItem, refetchCollections]);

	return { saveRequest };
}
