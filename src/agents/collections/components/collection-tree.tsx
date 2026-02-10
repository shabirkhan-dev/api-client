"use client";

import {
  ArrowRight01Icon,
  Copy01Icon,
  Delete01Icon,
  Edit02Icon,
  Folder01Icon,
  FolderAddIcon,
  MoreHorizontalIcon,
  PlusSignIcon,
  RocketIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import {
  ConfirmDialog,
  MethodBadge,
  PromptDialog,
  RequestEditDialog,
  RequestFormDialog,
} from "@/shared/components/ui";
import type { CollectionTreeNode } from "@/shared/hooks/use-collections";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";
import { useWorkspaceContext } from "@/shared/providers/workspace-provider";
import { useAppStore } from "@/shared/stores/app-store";

// Simple Menu Component
function SimpleMenu({
  trigger,
  items,
}: {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    danger?: boolean;
    onClick: () => void;
  }>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] py-1 rounded-lg bg-ctp-mantle border border-ctp-surface0/30 shadow-xl animate-scale-in">
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); item.onClick(); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-ctp-surface0/30",
                  item.danger ? "text-ctp-red hover:bg-ctp-red/10" : "text-ctp-subtext1"
                )}
              >
                {item.icon && <span className="w-3.5">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Collection Node
function CollectionNode({ node }: { node: CollectionTreeNode }) {
  const { deleteCollection, renameCollection, addItem } = useWorkspaceContext();
  const { compactMode, loadRequestFromNode, activeRequestItemId } = useAppStore();
  const [expanded, setExpanded] = useState(true);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addFolderOpen, setAddFolderOpen] = useState(false);
  const [addRouteOpen, setAddRouteOpen] = useState(false);

  const collectionId = node.serverCollectionId ?? "";
  const childCount = node.children?.length ?? 0;

  const handleAddFolder = useCallback(async (name: string) => {
    await addItem(collectionId, { type: "FOLDER", name });
  }, [collectionId, addItem]);

  const handleAddRoute = useCallback(async (name: string, method: HttpMethod) => {
    await addItem(collectionId, { type: "REQUEST", name, method });
  }, [collectionId, addItem]);

  const handleExport = useCallback(() => {
    const data = { name: node.name, exportedAt: new Date().toISOString(), items: node.children };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${node.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [node]);

  return (
    <>
      <div className="mb-0.5">
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-ctp-surface0/20 group">
          <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-ctp-overlay0">
            <HugeiconsIcon icon={expanded ? ArrowRight01Icon : ArrowRight01Icon} size={10} className={cn("transition-transform", expanded && "rotate-90")} />
          </button>

          <div className="w-5 h-5 rounded bg-ctp-mauve/15 flex items-center justify-center">
            <HugeiconsIcon icon={Folder01Icon} size={12} className="text-ctp-mauve" />
          </div>

          <span className="flex-1 text-[11px] font-medium text-ctp-text truncate">{node.name}</span>

          {childCount > 0 && (
            <span className="text-[9px] text-ctp-overlay0 px-1 bg-ctp-surface0/30 rounded">{childCount}</span>
          )}

          <SimpleMenu
            trigger={
              <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-ctp-surface0/30 text-ctp-overlay0 hover:text-ctp-text">
                <HugeiconsIcon icon={MoreHorizontalIcon} size={14} />
              </button>
            }
            items={[
              { label: "New Request", icon: <HugeiconsIcon icon={RocketIcon} size={14} className="text-ctp-green" />, onClick: () => setAddRouteOpen(true) },
              { label: "New Folder", icon: <HugeiconsIcon icon={FolderAddIcon} size={14} className="text-ctp-yellow" />, onClick: () => setAddFolderOpen(true) },
              { label: "Rename", icon: <HugeiconsIcon icon={Edit02Icon} size={14} />, onClick: () => setRenameOpen(true) },
              { label: "Export", onClick: handleExport },
              { label: "Delete", icon: <HugeiconsIcon icon={Delete01Icon} size={14} />, danger: true, onClick: () => setDeleteOpen(true) },
            ]}
          />
        </div>

        {expanded && (
          <div className="ml-4 pl-2 border-l border-ctp-surface0/20">
            {node.children?.length ? (
              <div className="space-y-px">
                {node.children.map((child) => (
                  <TreeNode key={child.id} node={child} depth={1} collectionId={collectionId} />
                ))}
              </div>
            ) : (
              <div className="py-2 text-[10px] text-ctp-overlay0/50 italic">Empty</div>
            )}
          </div>
        )}
      </div>

      <PromptDialog open={renameOpen} onClose={() => setRenameOpen(false)} onConfirm={(n) => renameCollection(collectionId, n)} title="Rename" defaultValue={node.name} confirmLabel="Save" />
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => deleteCollection(collectionId)} title="Delete Collection" message={`Delete "${node.name}"?`} confirmLabel="Delete" variant="danger" />
      <PromptDialog open={addFolderOpen} onClose={() => setAddFolderOpen(false)} onConfirm={handleAddFolder} title="New Folder" placeholder="Name" confirmLabel="Create" />
      <RequestFormDialog open={addRouteOpen} onClose={() => setAddRouteOpen(false)} onConfirm={handleAddRoute} title="New Request" confirmLabel="Create" />
    </>
  );
}

// Tree Node (Folder or Request)
function TreeNode({ node, depth, collectionId }: { node: CollectionTreeNode; depth: number; collectionId: string }) {
  const { loadRequestFromNode, activeRequestItemId, compactMode } = useAppStore();
  const { deleteItem, renameItem, addItem, duplicateItem } = useWorkspaceContext();
  const [expanded, setExpanded] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addRouteOpen, setAddRouteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const isActive = node.serverItemId === activeRequestItemId;
  const isFolder = node.type === "folder";
  const childCount = node.children?.length ?? 0;

  const handleLoad = useCallback(() => {
    if (!isFolder) {
      loadRequestFromNode({
        id: node.id, name: node.name, type: node.type, method: node.method, url: node.url,
        headers: node.headers, body: node.body, params: node.params,
        serverItemId: node.serverItemId, serverCollectionId: node.serverCollectionId,
      });
    }
  }, [node, isFolder, loadRequestFromNode]);

  if (isFolder) {
    return (
      <>
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-ctp-surface0/15 group">
          <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-ctp-overlay0">
            <HugeiconsIcon icon={ArrowRight01Icon} size={10} className={cn("transition-transform", expanded && "rotate-90")} />
          </button>

          <div className="w-4 h-4 rounded bg-ctp-yellow/10 flex items-center justify-center">
            <HugeiconsIcon icon={Folder01Icon} size={10} className="text-ctp-yellow/70" />
          </div>

          <span className="flex-1 text-[11px] text-ctp-subtext1 truncate">{node.name}</span>
          {childCount > 0 && <span className="text-[9px] text-ctp-overlay0/50">{childCount}</span>}

          <SimpleMenu
            trigger={
              <button className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-ctp-surface0/30 text-ctp-overlay0">
                <HugeiconsIcon icon={MoreHorizontalIcon} size={13} />
              </button>
            }
            items={[
              { label: "New Request", onClick: () => setAddRouteOpen(true) },
              { label: "Rename", onClick: () => setRenameOpen(true) },
              { label: "Delete", danger: true, onClick: () => setDeleteOpen(true) },
            ]}
          />
        </div>

        {expanded && (
          <div className="ml-4 pl-2 border-l border-ctp-surface0/10">
            {node.children?.length ? (
              <div className="space-y-px">
                {node.children.map((child) => (
                  <TreeNode key={child.id} node={child} depth={depth + 1} collectionId={collectionId} />
                ))}
              </div>
            ) : (
              <div className="py-1 text-[9px] text-ctp-overlay0/40 italic">Empty</div>
            )}
          </div>
        )}

        <PromptDialog open={renameOpen} onClose={() => setRenameOpen(false)} onConfirm={(n) => node.serverItemId && renameItem(node.serverItemId, n)} title="Rename Folder" defaultValue={node.name} confirmLabel="Save" />
        <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => node.serverItemId && deleteItem(node.serverItemId)} title="Delete Folder" message={`Delete "${node.name}"?`} confirmLabel="Delete" variant="danger" />
        <RequestFormDialog open={addRouteOpen} onClose={() => setAddRouteOpen(false)} onConfirm={(name, method) => addItem(collectionId, { type: "REQUEST", name, method, parentId: node.serverItemId })} title="New Request" confirmLabel="Create" />
      </>
    );
  }

  // Request
  return (
    <>
      <div
        className={cn(
          "flex items-center gap-1.5 px-1.5 py-1 rounded-lg cursor-pointer group",
          isActive ? "bg-ctp-lavender/10" : "hover:bg-ctp-surface0/15"
        )}
        onClick={handleLoad}
      >
        <MethodBadge method={(node.method as HttpMethod) || "GET"} size="xs" />

        <span className={cn("flex-1 text-[11px] truncate", isActive ? "text-ctp-lavender font-medium" : "text-ctp-subtext0")}>
          {node.name}
        </span>

        <SimpleMenu
          trigger={
            <button
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-ctp-surface0/30 text-ctp-overlay0"
              onClick={(e) => e.stopPropagation()}
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} size={13} />
            </button>
          }
          items={[
            { label: "Duplicate", icon: <HugeiconsIcon icon={Copy01Icon} size={13} />, onClick: () => node.serverItemId && duplicateItem(node.serverItemId) },
            { label: "Edit", icon: <HugeiconsIcon icon={Edit02Icon} size={13} />, onClick: () => setEditOpen(true) },
            { label: "Delete", icon: <HugeiconsIcon icon={Delete01Icon} size={13} />, danger: true, onClick: () => setDeleteOpen(true) },
          ]}
        />
      </div>

      <RequestEditDialog open={editOpen} onClose={() => setEditOpen(false)} onConfirm={(data) => node.serverItemId && renameItem(node.serverItemId, data.name)} title="Edit" defaultName={node.name} defaultMethod={(node.method as HttpMethod) || "GET"} defaultUrl={node.url || ""} />
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => node.serverItemId && deleteItem(node.serverItemId)} title="Delete Request" message={`Delete "${node.name}"?`} confirmLabel="Delete" variant="danger" />
    </>
  );
}

// Main Export
interface CollectionTreeProps {
  collections: CollectionTreeNode[];
}

import { Layers01Icon } from "@hugeicons/core-free-icons";

export function CollectionTree({ collections }: CollectionTreeProps) {
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <HugeiconsIcon icon={Layers01Icon} size={20} className="text-ctp-overlay0/40 mb-2" />
        <p className="text-[11px] text-ctp-overlay0">No collections</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {collections.map((node) => (
        <CollectionNode key={node.id} node={node} />
      ))}
    </div>
  );
}
