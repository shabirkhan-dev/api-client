"use client";

import {
	Add01Icon,
	Copy01Icon,
	Delete01Icon,
	Edit02Icon,
	LinkSquare01Icon,
	Logout01Icon,
	Mail01Icon,
	Settings01Icon,
	Tick01Icon,
	UserIcon,
	UserMultiple02Icon,
	WorkflowSquare06Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { signOut, useSession } from "@/shared/lib/auth-client";
import { applyTheme, getThemeById, themes } from "@/shared/lib/themes";
import { cn } from "@/shared/lib/utils";
import { useWorkspaceContext } from "@/shared/providers/workspace-provider";
import { useAppStore } from "@/shared/stores/app-store";
import { Button } from "./button";
import { Input } from "./input";
import { ConfirmDialog, PromptDialog } from "./modal";

type SettingsTab = "profile" | "workspaces" | "members" | "invites" | "appearance" | "shortcuts";

interface SettingsModalProps {
	open: boolean;
	onClose: () => void;
	initialTab?: SettingsTab;
}

interface Member {
	id: string;
	role: string;
	user: { id: string; name: string | null; email: string; image: string | null };
}

interface Invite {
	id: string;
	token: string;
	email: string | null;
	role: string;
	expiresAt: string;
	createdBy: { name: string | null; email: string };
}

const tabs: { id: SettingsTab; label: string; icon: typeof UserIcon; shortcut?: string }[] = [
	{ id: "profile", label: "Profile", icon: UserIcon, shortcut: "1" },
	{ id: "workspaces", label: "Workspaces", icon: WorkflowSquare06Icon, shortcut: "2" },
	{ id: "members", label: "Members", icon: UserMultiple02Icon, shortcut: "3" },
	{ id: "invites", label: "Invites", icon: LinkSquare01Icon, shortcut: "4" },
	{ id: "appearance", label: "Appearance", icon: Settings01Icon, shortcut: "5" },
	{ id: "shortcuts", label: "Shortcuts", icon: Mail01Icon, shortcut: "6" },
];

/* ─── Main Modal Component ─────────────────────────────── */

export function SettingsModal({ open, onClose, initialTab = "profile" }: SettingsModalProps) {
	const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
	const overlayRef = useRef<HTMLDivElement>(null);

	// Reset tab when modal opens
	useEffect(() => {
		if (open) {
			setActiveTab(initialTab);
		}
	}, [open, initialTab]);

	// Keyboard shortcuts for tabs
	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.altKey && e.key >= "1" && e.key <= "6") {
				const index = parseInt(e.key) - 1;
				if (tabs[index]) {
					setActiveTab(tabs[index].id);
				}
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [open]);

	const handleOverlayClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === overlayRef.current) onClose();
		},
		[onClose],
	);

	if (!open) return null;

	return (
		<div
			ref={overlayRef}
			onClick={handleOverlayClick}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl animate-fade-in p-4"
		>
			<div className="w-full max-w-4xl h-[min(800px,calc(100vh-48px))] bg-gradient-to-b from-ctp-mantle/98 to-ctp-crust/98 border border-ctp-surface0/30 rounded-2xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8)] animate-scale-in overflow-hidden flex">
				{/* Sidebar */}
				<aside className="w-56 bg-ctp-mantle/40 border-r border-ctp-surface0/20 flex flex-col shrink-0">
					{/* Header */}
					<div className="px-4 py-4 border-b border-ctp-surface0/15">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ctp-lavender/20 to-ctp-mauve/15 flex items-center justify-center ring-1 ring-ctp-surface1/20">
								<HugeiconsIcon icon={Settings01Icon} size={16} className="text-ctp-lavender" />
							</div>
							<div>
								<h2 className="text-[14px] font-semibold text-ctp-text">Settings</h2>
								<p className="text-[10px] text-ctp-overlay0">Manage your workspace</p>
							</div>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
						<div className="text-[9px] uppercase tracking-wider text-ctp-overlay0 font-semibold px-3 py-2">
							General
						</div>
						{tabs.slice(0, 4).map((tab) => (
							<TabButton
								key={tab.id}
								tab={tab}
								isActive={activeTab === tab.id}
								onClick={() => setActiveTab(tab.id)}
							/>
						))}

						<div className="text-[9px] uppercase tracking-wider text-ctp-overlay0 font-semibold px-3 py-2 mt-4">
							Preferences
						</div>
						{tabs.slice(4).map((tab) => (
							<TabButton
								key={tab.id}
								tab={tab}
								isActive={activeTab === tab.id}
								onClick={() => setActiveTab(tab.id)}
							/>
						))}
					</nav>

					{/* Footer */}
					<div className="p-2 border-t border-ctp-surface0/15">
						<button
							type="button"
							onClick={onClose}
							className="flex items-center gap-2 w-full px-3 py-2 rounded-[var(--radius-sm)] text-[12px] text-ctp-subtext0 hover:bg-ctp-surface0/25 hover:text-ctp-text transition-all cursor-pointer"
						>
							<span className="text-[11px] text-ctp-overlay0">Close</span>
							<kbd className="ml-auto text-[10px] px-1.5 py-0.5 bg-ctp-surface0/30 rounded text-ctp-overlay0 font-mono">
								Esc
							</kbd>
						</button>
					</div>
				</aside>

				{/* Content */}
				<main className="flex-1 overflow-hidden flex flex-col min-w-0 bg-gradient-to-br from-ctp-base/50 to-transparent">
					{/* Tab Content */}
					<div className="flex-1 overflow-y-auto p-6">
						<div className="max-w-2xl mx-auto">
							{activeTab === "profile" && <ProfileTab onClose={onClose} />}
							{activeTab === "workspaces" && <WorkspaceTab />}
							{activeTab === "members" && <MembersTab />}
							{activeTab === "invites" && <InvitesTab />}
							{activeTab === "appearance" && <AppearanceTab />}
							{activeTab === "shortcuts" && <ShortcutsTab />}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

/* ─── Tab Button ───────────────────────────────────────── */

function TabButton({
	tab,
	isActive,
	onClick,
}: {
	tab: (typeof tabs)[0];
	isActive: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-2.5 w-full px-3 py-2 rounded-[var(--radius-sm)] text-[12px] cursor-pointer transition-all duration-[130ms] group",
				isActive
					? "bg-ctp-lavender/10 text-ctp-lavender font-medium"
					: "text-ctp-subtext0 hover:bg-ctp-surface0/20 hover:text-ctp-text",
			)}
		>
			<HugeiconsIcon
				icon={tab.icon}
				size={14}
				strokeWidth={isActive ? 2 : 1.5}
				className={cn("transition-colors", isActive && "text-ctp-lavender")}
			/>
			<span className="flex-1 text-left">{tab.label}</span>
			{tab.shortcut && (
				<kbd
					className={cn(
						"text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors",
						isActive
							? "bg-ctp-lavender/20 text-ctp-lavender"
							: "bg-ctp-surface0/30 text-ctp-overlay0 group-hover:bg-ctp-surface0/50",
					)}
				>
					Alt {tab.shortcut}
				</kbd>
			)}
		</button>
	);
}

/* ─── Profile Tab ──────────────────────────────────────── */

function ProfileTab({ onClose }: { onClose: () => void }) {
	const { data: session } = useSession();
	const user = session?.user;

	if (!user) return null;

	const initials = (user.name ?? user.email ?? "?")
		.split(" ")
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<div className="space-y-6">
			<SectionHeader title="Profile" description="Your personal account information and preferences" />

			{/* Avatar & Name Card */}
			<div className="p-5 rounded-[var(--radius-lg)] bg-ctp-mantle/30 border border-ctp-surface0/15">
				<div className="flex items-center gap-4">
					<div className="w-16 h-16 rounded-xl bg-gradient-to-br from-ctp-lavender/25 to-ctp-mauve/20 flex items-center justify-center ring-2 ring-ctp-surface1/20">
						{user.image ? (
							<img
								src={user.image}
								alt={user.name ?? "Avatar"}
								className="w-full h-full rounded-xl object-cover"
							/>
						) : (
							<span className="text-[20px] font-bold text-ctp-lavender">{initials}</span>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-[16px] font-semibold text-ctp-text truncate">{user.name ?? "—"}</h3>
						<p className="text-[13px] text-ctp-subtext0 truncate">{user.email}</p>
					</div>
				</div>
			</div>

			{/* Details */}
			<div className="space-y-4">
				<DetailRow label="Full Name" value={user.name ?? "Not set"} />
				<DetailRow label="Email Address" value={user.email} />
				<DetailRow label="User ID" value={user.id} mono copyable />
			</div>

			{/* Sign Out */}
			<div className="pt-4 border-t border-ctp-surface0/15">
				<Button
					variant="danger"
					size="sm"
					onClick={() =>
						signOut({ fetchOptions: { onSuccess: () => window.location.replace("/sign-in") } })
					}
					className="flex items-center gap-2"
				>
					<HugeiconsIcon icon={Logout01Icon} size={14} />
					Sign out
				</Button>
			</div>
		</div>
	);
}

/* ─── Workspace Tab ────────────────────────────────────── */

function WorkspaceTab() {
	const {
		workspaces,
		activeWorkspace,
		switchWorkspace,
		createWorkspace,
		renameWorkspace,
		deleteWorkspace,
		workspaceBusy,
	} = useWorkspaceContext();

	const [createOpen, setCreateOpen] = useState(false);
	const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

	return (
		<div className="space-y-6">
			<SectionHeader
				title="Workspaces"
				description="Manage your workspaces and switch between them"
			/>

			{/* Active Workspace Card */}
			{activeWorkspace && (
				<div className="p-5 rounded-[var(--radius-lg)] bg-gradient-to-br from-ctp-lavender/8 to-ctp-mauve/5 border border-ctp-lavender/20">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ctp-blue/25 to-ctp-sapphire/15 flex items-center justify-center ring-1 ring-ctp-surface1/20">
							<span className="text-[14px] font-bold text-ctp-blue">
								{activeWorkspace.name.charAt(0).toUpperCase()}
							</span>
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<h3 className="text-[14px] font-semibold text-ctp-text truncate">
									{activeWorkspace.name}
								</h3>
								<span className="text-[10px] px-2 py-0.5 bg-ctp-green/15 text-ctp-green rounded-full font-medium">
									Active
								</span>
							</div>
							<p className="text-[11px] text-ctp-overlay0 font-mono">{activeWorkspace.slug}</p>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3 text-[11px]">
						<div className="p-2.5 rounded-md bg-ctp-base/40">
							<span className="text-ctp-overlay0">ID</span>
							<p className="font-mono text-ctp-text truncate">{activeWorkspace.id}</p>
						</div>
						<div className="p-2.5 rounded-md bg-ctp-base/40">
							<span className="text-ctp-overlay0">Slug</span>
							<p className="font-mono text-ctp-text truncate">{activeWorkspace.slug}</p>
						</div>
					</div>
				</div>
			)}

			{/* Workspaces List */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<h4 className="text-[12px] font-medium text-ctp-subtext0 uppercase tracking-wider flex items-center gap-2">
						All Workspaces
						{workspaceBusy && (
							<span className="inline-block w-3 h-3 border-2 border-ctp-lavender/30 border-t-ctp-lavender rounded-full animate-spin" />
						)}
					</h4>
					<Button variant="secondary" size="sm" onClick={() => setCreateOpen(true)}>
						<HugeiconsIcon icon={Add01Icon} size={13} />
						New workspace
					</Button>
				</div>

				<div className="space-y-1">
					{workspaces.map((ws) => {
						const isActive = ws.id === activeWorkspace?.id;
						return (
							<div
								key={ws.id}
								className={cn(
									"flex items-center gap-3 p-3 rounded-[var(--radius-md)] transition-all duration-150 group",
									isActive
										? "bg-ctp-lavender/8 border border-ctp-lavender/20"
										: "bg-ctp-mantle/30 border border-transparent hover:bg-ctp-surface0/15 hover:border-ctp-surface0/25",
								)}
							>
								<button
									type="button"
									onClick={() => switchWorkspace(ws.id)}
									className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
								>
									<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ctp-blue/20 to-ctp-sapphire/15 flex items-center justify-center ring-1 ring-ctp-surface1/15 shrink-0">
										<span className="text-[12px] font-bold text-ctp-blue">
											{ws.name.charAt(0).toUpperCase()}
										</span>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<p className="text-[13px] font-medium text-ctp-text truncate">{ws.name}</p>
											{isActive && (
												<HugeiconsIcon
													icon={Tick01Icon}
													size={12}
													className="text-ctp-lavender shrink-0"
												/>
											)}
										</div>
										<p className="text-[10px] text-ctp-overlay0 truncate font-mono">{ws.slug}</p>
									</div>
								</button>

								<div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										type="button"
										onClick={() => setRenameTarget({ id: ws.id, name: ws.name })}
										className="w-7 h-7 flex items-center justify-center rounded-md text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/30 cursor-pointer transition-colors"
										aria-label="Rename"
									>
										<HugeiconsIcon icon={Edit02Icon} size={13} />
									</button>
									{workspaces.length > 1 && (
										<button
											type="button"
											onClick={() => setDeleteTarget({ id: ws.id, name: ws.name })}
											className="w-7 h-7 flex items-center justify-center rounded-md text-ctp-overlay0 hover:text-ctp-red hover:bg-ctp-red/10 cursor-pointer transition-colors"
											aria-label="Delete"
										>
											<HugeiconsIcon icon={Delete01Icon} size={13} />
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<PromptDialog
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				onConfirm={async (name) => {
					await createWorkspace(name);
				}}
				title="New workspace"
				placeholder="Workspace name"
				confirmLabel="Create"
			/>
			<PromptDialog
				open={!!renameTarget}
				onClose={() => setRenameTarget(null)}
				onConfirm={async (name) => {
					if (renameTarget) await renameWorkspace(renameTarget.id, name);
				}}
				title="Rename workspace"
				placeholder="Workspace name"
				defaultValue={renameTarget?.name ?? ""}
				confirmLabel="Save"
			/>
			<ConfirmDialog
				open={!!deleteTarget}
				onClose={() => setDeleteTarget(null)}
				onConfirm={async () => {
					if (deleteTarget) await deleteWorkspace(deleteTarget.id);
				}}
				title="Delete workspace"
				message={`Delete "${deleteTarget?.name}"? All collections and data will be permanently lost.`}
				confirmLabel="Delete"
				variant="danger"
			/>
		</div>
	);
}

/* ─── Members Tab ──────────────────────────────────────── */

function MembersTab() {
	const { activeWorkspace } = useWorkspaceContext();
	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchMembers = useCallback(async () => {
		if (!activeWorkspace) return;
		setLoading(true);
		const res = await fetch(`/api/workspaces/${activeWorkspace.id}/members`);
		if (res.ok) setMembers(await res.json());
		setLoading(false);
	}, [activeWorkspace]);

	useEffect(() => {
		fetchMembers();
	}, [fetchMembers]);

	const handleRoleChange = useCallback(
		async (memberId: string, role: string) => {
			if (!activeWorkspace) return;
			const res = await fetch(`/api/workspaces/${activeWorkspace.id}/members/${memberId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role }),
			});
			if (res.ok) {
				toast.success("Role updated");
				fetchMembers();
			} else {
				const err = await res.json().catch(() => ({}));
				toast.error(err.error ?? "Failed to update role");
			}
		},
		[activeWorkspace, fetchMembers],
	);

	const handleRemove = useCallback(
		async (memberId: string) => {
			if (!activeWorkspace) return;
			const res = await fetch(`/api/workspaces/${activeWorkspace.id}/members/${memberId}`, {
				method: "DELETE",
			});
			if (res.ok) {
				toast.success("Member removed");
				fetchMembers();
			} else {
				const err = await res.json().catch(() => ({}));
				toast.error(err.error ?? "Failed to remove member");
			}
		},
		[activeWorkspace, fetchMembers],
	);

	const ownerCount = members.filter((m) => m.role === "OWNER").length;

	return (
		<div className="space-y-6">
			<SectionHeader
				title="Members"
				description="Manage who has access to this workspace and their permissions"
			/>

			{/* Stats */}
			<div className="grid grid-cols-3 gap-3">
				<StatCard label="Total Members" value={members.length} color="blue" />
				<StatCard label="Admins" value={members.filter((m) => m.role === "ADMIN").length} color="peach" />
				<StatCard label="Viewers" value={members.filter((m) => m.role === "VIEWER").length} color="green" />
			</div>

			{/* Members List */}
			<div className="space-y-2">
				<h4 className="text-[12px] font-medium text-ctp-subtext0 uppercase tracking-wider">Team Members</h4>
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="w-5 h-5 border-2 border-ctp-lavender/30 border-t-ctp-lavender rounded-full animate-spin" />
					</div>
				) : members.length === 0 ? (
					<div className="text-center py-12">
						<div className="w-12 h-12 rounded-full bg-ctp-surface0/30 flex items-center justify-center mx-auto mb-3">
							<HugeiconsIcon icon={UserMultiple02Icon} size={20} className="text-ctp-overlay0" />
						</div>
						<p className="text-[13px] text-ctp-subtext0">No members found</p>
					</div>
				) : (
					<div className="space-y-2">
						{members.map((m) => (
							<div
								key={m.id}
								className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-ctp-mantle/30 border border-ctp-surface0/10 hover:border-ctp-surface0/25 transition-all group"
							>
								<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ctp-lavender/20 to-ctp-mauve/15 flex items-center justify-center ring-1 ring-ctp-surface1/15 shrink-0">
									<span className="text-[12px] font-bold text-ctp-lavender">
										{(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
									</span>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-[13px] font-medium text-ctp-text truncate">
										{m.user.name ?? m.user.email}
									</p>
									<p className="text-[11px] text-ctp-overlay0 truncate">{m.user.email}</p>
								</div>
								{m.role === "OWNER" ? (
									<span className="text-[10px] font-semibold text-ctp-peach bg-ctp-peach/10 px-2.5 py-1 rounded-full">
										Owner
									</span>
								) : (
									<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<select
											value={m.role}
											onChange={(e) => handleRoleChange(m.id, e.target.value)}
											className="h-7 px-2 text-[11px] font-medium rounded-md border border-ctp-surface0/30 bg-ctp-base/50 text-ctp-subtext0 outline-none cursor-pointer"
										>
											<option value="ADMIN">Admin</option>
											<option value="MEMBER">Member</option>
											<option value="VIEWER">Viewer</option>
										</select>
										<Button variant="danger" size="xs" onClick={() => handleRemove(m.id)}>
											Remove
										</Button>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

/* ─── Invites Tab ──────────────────────────────────────── */

function InvitesTab() {
	const { activeWorkspace } = useWorkspaceContext();
	const [invites, setInvites] = useState<Invite[]>([]);
	const [loading, setLoading] = useState(true);
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("MEMBER");
	const [creating, setCreating] = useState(false);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const fetchInvites = useCallback(async () => {
		if (!activeWorkspace) return;
		setLoading(true);
		const res = await fetch(`/api/workspaces/${activeWorkspace.id}/invites`);
		if (res.ok) setInvites(await res.json());
		setLoading(false);
	}, [activeWorkspace]);

	useEffect(() => {
		fetchInvites();
	}, [fetchInvites]);

	const handleCreate = useCallback(async () => {
		if (!activeWorkspace) return;
		setCreating(true);

		const res = await fetch(`/api/workspaces/${activeWorkspace.id}/invites`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				workspaceId: activeWorkspace.id,
				email: email.trim() || undefined,
				role,
			}),
		});

		if (res.ok) {
			const data = await res.json();
			toast.success("Invite created successfully");

			if (data.inviteUrl) {
				navigator.clipboard.writeText(data.inviteUrl).then(() => {
					toast.success("Invite link copied to clipboard");
				});
			}

			setEmail("");
			fetchInvites();
		} else {
			toast.error("Failed to create invite");
		}

		setCreating(false);
	}, [activeWorkspace, email, role, fetchInvites]);

	const copyInviteLink = useCallback((token: string, id: string) => {
		const url = `${window.location.origin}/invite/${token}`;
		navigator.clipboard.writeText(url);
		setCopiedId(id);
		toast.success("Link copied to clipboard");
		setTimeout(() => setCopiedId(null), 2000);
	}, []);

	return (
		<div className="space-y-6">
			<SectionHeader
				title="Invites"
				description="Create and manage invite links for your workspace"
			/>

			{/* Create Form */}
			<div className="p-5 rounded-[var(--radius-lg)] bg-ctp-mantle/30 border border-ctp-surface0/15 space-y-4">
				<h4 className="text-[13px] font-medium text-ctp-text">Create New Invite</h4>
				<div className="flex gap-3">
					<Input
						placeholder="Email (optional)"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="flex-1"
					/>
					<select
						value={role}
						onChange={(e) => setRole(e.target.value)}
						className="h-8 px-3 text-[12px] font-medium rounded-md border border-ctp-surface0/30 bg-ctp-base/50 text-ctp-subtext0 outline-none cursor-pointer"
					>
						<option value="ADMIN">Admin</option>
						<option value="MEMBER">Member</option>
						<option value="VIEWER">Viewer</option>
					</select>
				</div>
				<Button variant="primary" size="sm" onClick={handleCreate} disabled={creating}>
					{creating ? (
						<>
							<span className="inline-block w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
							Creating...
						</>
					) : (
						<>
							<HugeiconsIcon icon={Add01Icon} size={13} className="mr-1.5" />
							Create invite
						</>
					)}
				</Button>
			</div>

			{/* Pending Invites */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h4 className="text-[12px] font-medium text-ctp-subtext0 uppercase tracking-wider">
						Pending Invites
					</h4>
					{invites.length > 0 && (
						<span className="text-[11px] text-ctp-overlay0">{invites.length} active</span>
					)}
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div className="w-5 h-5 border-2 border-ctp-lavender/30 border-t-ctp-lavender rounded-full animate-spin" />
					</div>
				) : invites.length === 0 ? (
					<div className="text-center py-8">
						<div className="w-12 h-12 rounded-full bg-ctp-surface0/30 flex items-center justify-center mx-auto mb-3">
							<HugeiconsIcon icon={LinkSquare01Icon} size={20} className="text-ctp-overlay0" />
						</div>
						<p className="text-[13px] text-ctp-subtext0">No pending invites</p>
						<p className="text-[11px] text-ctp-overlay0 mt-1">Create an invite to add team members</p>
					</div>
				) : (
					<div className="space-y-2">
						{invites.map((inv) => (
							<div
								key={inv.id}
								className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-md)] bg-ctp-mantle/30 border border-ctp-surface0/10 hover:border-ctp-surface0/25 transition-all group"
							>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<p className="text-[13px] font-medium text-ctp-text truncate">
											{inv.email ?? "Open invite link"}
										</p>
										<span
											className={cn(
												"text-[9px] px-1.5 py-0.5 rounded font-medium",
												inv.role === "ADMIN" && "bg-ctp-peach/15 text-ctp-peach",
												inv.role === "MEMBER" && "bg-ctp-blue/15 text-ctp-blue",
												inv.role === "VIEWER" && "bg-ctp-green/15 text-ctp-green",
											)}
										>
											{inv.role}
										</span>
									</div>
									<p className="text-[11px] text-ctp-overlay0">
										Expires {new Date(inv.expiresAt).toLocaleDateString()} &middot; Created by{" "}
										{inv.createdBy.name ?? inv.createdBy.email}
									</p>
								</div>
								<button
									type="button"
									onClick={() => copyInviteLink(inv.token, inv.id)}
									className={cn(
										"flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer",
										copiedId === inv.id
											? "bg-ctp-green/15 text-ctp-green"
											: "bg-ctp-surface0/20 text-ctp-subtext0 hover:bg-ctp-surface0/30 hover:text-ctp-text",
									)}
								>
									<HugeiconsIcon
										icon={copiedId === inv.id ? Tick01Icon : Copy01Icon}
										size={12}
									/>
									{copiedId === inv.id ? "Copied" : "Copy Link"}
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

/* ─── Appearance Tab ───────────────────────────────────── */

function AppearanceTab() {
	const [themeId, setThemeId] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("theme") ?? "catppuccin-mocha";
		}
		return "catppuccin-mocha";
	});
	const { compactMode, setCompactMode } = useAppStore();

	const handleThemeChange = useCallback((id: string) => {
		setThemeId(id);
		localStorage.setItem("theme", id);
		applyTheme(getThemeById(id));
	}, []);

	return (
		<div className="space-y-6">
			<SectionHeader title="Appearance" description="Customize the look and feel of your workspace" />

			{/* Compact Mode Toggle */}
			<div className="p-4 rounded-xl bg-ctp-mantle/30 border border-ctp-surface0/20">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="text-[13px] font-semibold text-ctp-text">Compact Mode</h4>
						<p className="text-[11px] text-ctp-subtext0 mt-0.5">
							Reduce spacing and padding for a more dense interface
						</p>
					</div>
					<button
						type="button"
						onClick={() => setCompactMode(!compactMode)}
						className={cn(
							"relative w-12 h-7 rounded-full transition-colors duration-200",
							compactMode ? "bg-ctp-lavender" : "bg-ctp-surface0/50"
						)}
					>
						<span
							className={cn(
								"absolute top-1 left-1 w-5 h-5 rounded-full bg-ctp-text transition-transform duration-200 shadow-sm",
								compactMode ? "translate-x-5" : "translate-x-0"
							)}
					/>
					</button>
				</div>
			</div>

			{/* Theme Selection */}
			<div className="space-y-3">
				<h4 className="text-[12px] font-medium text-ctp-subtext0 uppercase tracking-wider">Theme</h4>
				<div className="grid grid-cols-2 gap-3">
					{themes.map((theme) => {
						const isActive = themeId === theme.id;
						return (
							<button
								key={theme.id}
								type="button"
								onClick={() => handleThemeChange(theme.id)}
								className={cn(
									"flex items-center gap-3 p-4 rounded-[var(--radius-lg)] text-left transition-all duration-150 cursor-pointer",
									isActive
										? "bg-ctp-lavender/8 border-2 border-ctp-lavender/40"
										: "bg-ctp-mantle/30 border-2 border-transparent hover:border-ctp-surface0/30",
								)}
							>
								<div className="flex gap-1">
									{[
										theme.colors.lavender,
										theme.colors.green,
										theme.colors.red,
										theme.colors.yellow,
									].map((c) => (
										<div
											key={c}
											className="w-5 h-5 rounded-full ring-2 ring-ctp-surface0/50"
											style={{ background: c }}
										/>
										))}
									</div>
									<div>
										<p className="text-[13px] font-medium text-ctp-text">{theme.name}</p>
										{isActive && (
											<p className="text-[10px] text-ctp-lavender">Active</p>
										)}
									</div>
								</button>
							);
						})}
					</div>
				</div>
			</div>
		);
}

/* ─── Shortcuts Tab ────────────────────────────────────── */

function ShortcutsTab() {
	const shortcuts = [
		{ key: "⌘K", description: "Open command palette", scope: "Global" },
		{ key: "⌘P", description: "Send request", scope: "HTTP Client" },
		{ key: "Esc", description: "Close modal / Cancel", scope: "Global" },
		{ key: "Alt + 1-6", description: "Switch settings tabs", scope: "Settings" },
		{ key: "⌘,", description: "Open settings", scope: "Global" },
	];

	return (
		<div className="space-y-6">
			<SectionHeader title="Keyboard Shortcuts" description="Quick shortcuts to navigate the app faster" />

			<div className="space-y-2">
				{shortcuts.map((shortcut) => (
					<div
						key={shortcut.key}
						className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-ctp-mantle/30 border border-ctp-surface0/10"
					>
						<div>
							<p className="text-[13px] font-medium text-ctp-text">{shortcut.description}</p>
							<p className="text-[11px] text-ctp-overlay0">{shortcut.scope}</p>
						</div>
						<kbd className="px-2.5 py-1 bg-ctp-surface0/30 rounded-md text-[12px] font-mono text-ctp-subtext0">
							{shortcut.key}
						</kbd>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─── Helper Components ────────────────────────────────── */

function SectionHeader({ title, description }: { title: string; description?: string }) {
	return (
		<div className="pb-4 border-b border-ctp-surface0/15">
			<h2 className="text-[18px] font-semibold text-ctp-text">{title}</h2>
			{description && <p className="text-[13px] text-ctp-subtext0 mt-1">{description}</p>}
		</div>
	);
}

function DetailRow({
	label,
	value,
	mono,
	copyable,
}: {
	label: string;
	value: string;
	mono?: boolean;
	copyable?: boolean;
}) {
	return (
		<div className="space-y-1">
			<label className="text-[11px] font-medium text-ctp-subtext0 uppercase tracking-wider">{label}</label>
			<div className="flex items-center gap-2">
				<div
					className={cn(
						"flex-1 px-3 py-2 rounded-md bg-ctp-mantle/40 border border-ctp-surface0/15 text-[13px] text-ctp-text",
						mono && "font-mono text-[12px] text-ctp-subtext0",
					)}
				>
					{value}
				</div>
				{copyable && (
					<button
						type="button"
						onClick={() => {
							navigator.clipboard.writeText(value);
							toast.success("Copied to clipboard");
						}}
						className="p-2 rounded-md text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/20 transition-colors cursor-pointer"
					>
						<HugeiconsIcon icon={Copy01Icon} size={14} />
					</button>
				)}
			</div>
		</div>
	);
}

function StatCard({ label, value, color }: { label: string; value: number; color: "blue" | "peach" | "green" }) {
	const colorClasses = {
		blue: "from-ctp-blue/15 to-ctp-sapphire/10 text-ctp-blue",
		peach: "from-ctp-peach/15 to-ctp-peach/5 text-ctp-peach",
		green: "from-ctp-green/15 to-ctp-green/5 text-ctp-green",
	};

	return (
		<div className={cn("p-4 rounded-[var(--radius-lg)] bg-gradient-to-br border border-ctp-surface0/10", colorClasses[color])}>
			<p className="text-[11px] font-medium opacity-80">{label}</p>
			<p className="text-[24px] font-bold mt-1">{value}</p>
		</div>
	);
}
