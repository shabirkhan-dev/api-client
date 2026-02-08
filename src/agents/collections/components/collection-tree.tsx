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

const ICON = 14;
const ICON_SM = 12;

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

	const paddingLeft = depth * 14 + 8;

	if (node.type === "folder") {
		return (
			<div>
				<button
					type="button"
					onClick={toggleCollapse}
					className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-[13px] hover:bg-ctp-surface0/25 transition-colors duration-150 text-ctp-subtext1 group"
					style={{ paddingLeft: `${paddingLeft}px` }}
				>
					<HugeiconsIcon
						icon={node.collapsed ? ArrowRight01Icon : ArrowDown01Icon}
						size={ICON_SM}
						className="text-ctp-overlay0 shrink-0"
					/>
					<HugeiconsIcon
						icon={node.collapsed ? Folder01Icon : FolderOpenIcon}
						size={ICON}
						className="text-ctp-lavender/60 shrink-0"
					/>
					<span className="truncate font-medium">{node.name}</span>
					{node.children && (
						<span className="text-[11px] p-2 text-ctp-overlay0/60 ml-auto opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
							{node.children.length}
						</span>
					)}
				</button>

				{!node.collapsed && node.children && (
					<div className="relative">
						<div
							className="absolute top-0 bottom-2 w-px bg-ctp-surface0/20"
							style={{ left: `${paddingLeft + 6}px` }}
						/>
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
			className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-[13px] hover:bg-ctp-surface0/25 transition-colors duration-150 cursor-pointer group"
			style={{ paddingLeft: `${paddingLeft}px` }}
		>
			<MethodBadge method={(node.method as HttpMethod) || "GET"} />
			<span className="truncate text-ctp-subtext0 group-hover:text-ctp-text transition-colors duration-150">
				{node.name}
			</span>
		</button>
	);
}

export function CollectionTree() {
	const { collections } = useAppStore();

	if (collections.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-10 px-4 text-center text-ctp-overlay0 text-[12px] gap-2">
				<HugeiconsIcon
					icon={Folder01Icon}
					size={24}
					className="opacity-30 mb-1.5 text-ctp-overlay0"
				/>
				<span className="text-[12px] text-ctp-overlay0">No collections yet</span>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto space-y-0.5">
			{collections.map((node) => (
				<TreeNode key={node.id} node={node} />
			))}
		</div>
	);
}
