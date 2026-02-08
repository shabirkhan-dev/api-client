"use client";

import { Comment01Icon, Refresh01Icon, Share01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, LabelText, Textarea } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/app-store";

interface Comment {
	id: string;
	text: string;
	timestamp: number;
}
interface AuditEntry {
	id: string;
	message: string;
	timestamp: number;
}

export function CollaborationPanel() {
	const { method, url, headersText, bodyText } = useAppStore();
	const [commentText, setCommentText] = useState("");
	const [comments, setComments] = useState<Comment[]>([]);
	const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

	const log = useCallback(
		(msg: string) =>
			setAuditLog((prev) => [
				{ id: `a-${Date.now()}`, message: msg, timestamp: Date.now() },
				...prev,
			]),
		[],
	);

	const shareRequest = useCallback(async () => {
		const encoded = btoa(JSON.stringify({ method, url, headers: headersText, body: bodyText }));
		await navigator.clipboard.writeText(`${window.location.origin}#share=${encoded}`);
		toast.success("Link copied");
		log("Shared request");
	}, [method, url, headersText, bodyText, log]);

	const addComment = useCallback(() => {
		if (!commentText.trim()) return;
		setComments((prev) => [
			...prev,
			{ id: `c-${Date.now()}`, text: commentText, timestamp: Date.now() },
		]);
		setCommentText("");
		log("Comment added");
		toast.success("Comment added");
	}, [commentText, log]);

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-auto">
			<GlassPanel className="p-3 flex items-center justify-between">
				<div>
					<div className="text-[13px] font-semibold">Collaboration</div>
					<div className="text-[11px] text-ctp-overlay0">Share, comment, audit</div>
				</div>
				<Button variant="primary" size="sm" onClick={shareRequest}>
					<HugeiconsIcon icon={Share01Icon} size={13} /> Share
				</Button>
			</GlassPanel>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
				<GlassPanel className="p-3">
					<LabelText>Workspace</LabelText>
					<div className="text-[11px] text-ctp-overlay0 mt-1.5">Nebula Team</div>
					<Button
						variant="outline"
						size="sm"
						className="mt-2"
						onClick={() => {
							toast.success("Synced");
							log("Collections synced");
						}}
					>
						<HugeiconsIcon icon={Refresh01Icon} size={11} /> Sync
					</Button>
				</GlassPanel>
				<GlassPanel className="p-3 space-y-2">
					<LabelText>Comments</LabelText>
					<Textarea
						value={commentText}
						onChange={(e) => setCommentText(e.target.value)}
						className="h-20 text-[11px]"
						placeholder="Add a comment..."
					/>
					<Button variant="outline" size="sm" onClick={addComment}>
						<HugeiconsIcon icon={Comment01Icon} size={11} /> Add
					</Button>
					<div className="space-y-1 max-h-28 overflow-y-auto">
						{comments.map((c) => (
							<div
								key={c.id}
								className="bg-ctp-crust/30 rounded-md p-1.5 text-[10px] text-ctp-subtext0"
							>
								{c.text}
								<div className="text-[8px] text-ctp-overlay0 mt-0.5">
									{new Date(c.timestamp).toLocaleTimeString()}
								</div>
							</div>
						))}
					</div>
				</GlassPanel>
				<GlassPanel className="p-3">
					<LabelText>Audit Log</LabelText>
					<div className="space-y-0.5 mt-1.5 max-h-48 overflow-y-auto">
						{auditLog.map((e) => (
							<div key={e.id} className="text-[10px] text-ctp-overlay0">
								{e.message}
							</div>
						))}
						{auditLog.length === 0 && (
							<div className="text-[10px] text-ctp-overlay0 text-center py-3">No activity</div>
						)}
					</div>
				</GlassPanel>
			</div>
		</div>
	);
}
