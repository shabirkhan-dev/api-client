"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { Button, GlassPanel, LabelText, Textarea } from "@/shared/components/ui";
import { Users, Share2, MessageSquare, RefreshCw } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

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

	const shareRequest = useCallback(async () => {
		const payload = { method, url, headers: headersText, body: bodyText };
		const encoded = btoa(JSON.stringify(payload));
		const shareUrl = `${window.location.origin}#share=${encoded}`;
		await navigator.clipboard.writeText(shareUrl);
		toast.success("Shareable link copied to clipboard");
		setAuditLog((prev) => [
			{
				id: `audit-${Date.now()}`,
				message: `Shared request link at ${new Date().toLocaleTimeString()}`,
				timestamp: Date.now(),
			},
			...prev,
		]);
	}, [method, url, headersText, bodyText]);

	const addComment = useCallback(() => {
		if (!commentText.trim()) return;
		setComments((prev) => [
			...prev,
			{ id: `comment-${Date.now()}`, text: commentText, timestamp: Date.now() },
		]);
		setCommentText("");
		setAuditLog((prev) => [
			{
				id: `audit-${Date.now()}`,
				message: `Comment added at ${new Date().toLocaleTimeString()}`,
				timestamp: Date.now(),
			},
			...prev,
		]);
		toast.success("Comment added");
	}, [commentText]);

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-auto">
			<GlassPanel className="p-4 flex items-center justify-between">
				<div>
					<div className="text-sm font-semibold">Collaboration</div>
					<div className="text-xs text-ctp-overlay0">
						Share links, comments, audit log
					</div>
				</div>
				<Button variant="primary" size="sm" onClick={shareRequest}>
					<Share2 size={14} />
					Share Request
				</Button>
			</GlassPanel>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<GlassPanel className="p-4">
					<LabelText>Team Workspace</LabelText>
					<div className="text-xs text-ctp-overlay0 mt-2">
						Workspace: Nebula Team
					</div>
					<Button
						variant="kbd"
						size="sm"
						className="mt-3"
						onClick={() => toast.success("Collections synced")}
					>
						<RefreshCw size={12} />
						Sync Collections
					</Button>
				</GlassPanel>

				<GlassPanel className="p-4 space-y-3">
					<LabelText>Comments</LabelText>
					<Textarea
						value={commentText}
						onChange={(e) => setCommentText(e.target.value)}
						className="h-24 text-xs"
						placeholder="Add a comment..."
					/>
					<Button variant="kbd" size="sm" onClick={addComment}>
						<MessageSquare size={12} />
						Add Comment
					</Button>
					<div className="space-y-1 max-h-32 overflow-y-auto">
						{comments.map((c) => (
							<div key={c.id} className="glass rounded-lg p-2 text-xs text-ctp-subtext0">
								{c.text}
								<div className="text-[9px] text-ctp-overlay0 mt-1">
									{new Date(c.timestamp).toLocaleTimeString()}
								</div>
							</div>
						))}
					</div>
				</GlassPanel>

				<GlassPanel className="p-4">
					<LabelText>Audit Log</LabelText>
					<div className="space-y-1 mt-2 max-h-48 overflow-y-auto">
						{auditLog.map((entry) => (
							<div key={entry.id} className="text-xs text-ctp-overlay0">
								{entry.message}
							</div>
						))}
						{auditLog.length === 0 && (
							<div className="text-xs text-ctp-overlay0 text-center py-4">
								No activity yet
							</div>
						)}
					</div>
				</GlassPanel>
			</div>
		</div>
	);
}
