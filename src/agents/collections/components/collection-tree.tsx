"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { MethodBadge } from "@/shared/components/ui";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import type { CollectionNode } from "@/shared/types";
import { ChevronDown, ChevronRight, FolderOpen, Folder } from "lucide-react";
import { useCallback } from "react";

function TreeNode({ node, depth = 0 }: { node: CollectionNode; depth?: number }) {
	const { setCollections, collections, loadRequestFromNode } = useAppStore();

	const toggleCollapse = useCallback(() => {
		const toggle = (nodes: CollectionNode[]): CollectionNode[] =>
			nodes.map((n) => {
				if (n.id === node.id) return { ...n, collapsed: !n.collapsed };
				if (n.children) return { ...n, children: toggle(n.children) };
				return n;
			});
		setCollections(toggle(collections));
	}, [node.id, collections, setCollections]);

	if (node.type === "folder") {
		return (
			<div className="space-y-0.5">
				<button
					type="button"
					onClick={toggleCollapse}
					className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-ctp-lavender/5 transition-colors text-ctp-text"
					style={{ paddingLeft: `${depth * 12 + 8}px` }}
				>
					{node.collapsed ? (
						<ChevronRight size={12} className="text-ctp-overlay0" />
					) : (
						<ChevronDown size={12} className="text-ctp-overlay0" />
					)}
					{node.collapsed ? (
						<Folder size={13} className="text-ctp-lavender" />
					) : (
						<FolderOpen size={13} className="text-ctp-lavender" />
					)}
					<span className="truncate font-medium">{node.name}</span>
				</button>
				{!node.collapsed && node.children && (
					<div>
						{node.children.map((child) => (
							<TreeNode key={child.id} node={child} depth={depth + 1} />
						))}
					</div>
				)}
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={() => loadRequestFromNode(node)}
			className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-ctp-lavender/5 transition-colors cursor-pointer"
			style={{ paddingLeft: `${depth * 12 + 8}px` }}
		>
			<MethodBadge method={(node.method as HttpMethod) || "GET"} />
			<span className="truncate text-ctp-subtext1">{node.name}</span>
		</button>
	);
}

export function CollectionTree() {
	const { collections } = useAppStore();

	return (
		<div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
			{collections.map((node) => (
				<TreeNode key={node.id} node={node} />
			))}
		</div>
	);
}
