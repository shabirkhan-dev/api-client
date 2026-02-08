"use client";

import {
	ArrowDown01Icon,
	ArrowRight01Icon,
	Folder01Icon,
	FolderOpenIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback } from "react";
import { MethodBadge } from "@/shared/components/ui";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { useAppStore } from "@/shared/stores/app-store";
import type { CollectionNode } from "@/shared/types";

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
			<div>
				<button
					type="button"
					onClick={toggleCollapse}
					className="w-full flex items-center gap-2 px-2 py-[6px] rounded-lg text-[11px] hover:bg-ctp-surface0/30 transition-colors text-ctp-subtext1 group"
					style={{ paddingLeft: `${depth * 14 + 6}px` }}
				>
					<HugeiconsIcon
						icon={node.collapsed ? ArrowRight01Icon : ArrowDown01Icon}
						size={10}
						className="text-ctp-overlay0 shrink-0"
					/>
					<HugeiconsIcon
						icon={node.collapsed ? Folder01Icon : FolderOpenIcon}
						size={12}
						className="text-ctp-lavender/70 shrink-0"
					/>
					<span className="truncate font-medium">{node.name}</span>
					{node.children && (
						<span className="text-[9px] text-ctp-overlay0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
							{node.children.length}
						</span>
					)}
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
			className="w-full flex items-center gap-2 px-2 py-[6px] rounded-lg text-[11px] hover:bg-ctp-surface0/30 transition-colors cursor-pointer group"
			style={{ paddingLeft: `${depth * 14 + 6}px` }}
		>
			<MethodBadge method={(node.method as HttpMethod) || "GET"} />
			<span className="truncate text-ctp-subtext0 group-hover:text-ctp-text transition-colors">
				{node.name}
			</span>
		</button>
	);
}

export function CollectionTree() {
	const { collections } = useAppStore();

	return (
		<div className="flex-1 overflow-y-auto space-y-px pr-0.5">
			{collections.map((node) => (
				<TreeNode key={node.id} node={node} />
			))}
		</div>
	);
}
