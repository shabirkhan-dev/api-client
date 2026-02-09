"use client";

import {
	Add01Icon,
	ArrowLeft02Icon,
	Copy01Icon,
	Delete01Icon,
	Edit02Icon,
	LinkSquare01Icon,
	Tick01Icon,
	UserIcon,
	UserMultiple02Icon,
	WorkflowSquare06Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, ConfirmDialog, Input, PromptDialog } from "@/shared/components/ui";
import { signOut, useSession } from "@/shared/lib/auth-client";
import { cn } from "@/shared/lib/utils";
import { useWorkspaceContext } from "@/shared/providers/workspace-provider";

type SettingsTab = "profile" | "workspaces" | "members" | "invites";

export default function SettingsPage() {
	return (
		<Suspense>
			<SettingsContent />
		</Suspense>
	);
}

function SettingsContent() {
	const searchParams = useSearchParams();
	const initialTab = (searchParams.get("tab") as SettingsTab) || "profile";
	const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

	const tabs: { id: SettingsTab; label: string; icon: typeof UserIcon }[] = [
		{ id: "profile", label: "Profile", icon: UserIcon },
		{ id: "workspaces", label: "Workspace", icon: WorkflowSquare06Icon },
		{ id: "members", label: "Members", icon: UserMultiple02Icon },
		{ id: "invites", label: "Invites", icon: LinkSquare01Icon },
	];

	return (
		<div className="min-h-screen p-[var(--space-md)]">
			<div className="min-h-[calc(100vh-var(--space-xl))] flex flex-col rounded-[calc(var(--radius-xl)+4px)] bg-gradient-to-b from-ctp-base/92 to-ctp-base/86 border border-ctp-surface1/20 shadow-[0_0_0_1px_inset] shadow-ctp-surface0/12 overflow-hidden">
				{/* Header */}
				<header className="bg-gradient-to-b from-ctp-mantle/96 to-ctp-crust/90 border-b border-ctp-surface0/30 backdrop-blur-[16px] h-[var(--header-h)] flex items-center gap-[var(--space-md)] px-[var(--space-lg)] shrink-0">
					<Link
						href="/"
						className="flex items-center gap-1.5 text-ctp-subtext0 hover:text-ctp-text transition-colors text-[12px] font-medium"
					>
						<HugeiconsIcon icon={ArrowLeft02Icon} size={14} strokeWidth={1.5} />
						Back
					</Link>
					<div className="w-px h-4 bg-ctp-surface0/25" />
					<span className="text-[13px] font-semibold text-ctp-text">Settings</span>
				</header>

				<div className="flex flex-1 overflow-hidden">
					{/* Sidebar */}
					<nav className="w-48 bg-ctp-mantle/20 border-r border-ctp-surface0/15 p-[var(--space-sm)] shrink-0">
						<div className="space-y-px">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									className={cn(
										"flex items-center gap-2 w-full px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-sm)] text-[12px] cursor-pointer transition-all duration-[130ms]",
										activeTab === tab.id
											? "bg-ctp-lavender/10 text-ctp-lavender font-medium"
											: "text-ctp-subtext0 hover:bg-ctp-surface0/25 hover:text-ctp-text",
									)}
								>
									<HugeiconsIcon icon={tab.icon} size={14} strokeWidth={1.5} />
									{tab.label}
								</button>
							))}
						</div>
					</nav>

					{/* Content */}
					<main className="flex-1 overflow-y-auto p-[var(--space-2xl)]">
						<div className="max-w-lg">
							{activeTab === "profile" && <ProfileTab />}
							{activeTab === "workspaces" && <WorkspaceTab />}
							{activeTab === "members" && <MembersTab />}
							{activeTab === "invites" && <InvitesTab />}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

/* ─── Section wrapper ────────────────────────────────── */

function Section({
	title,
	description,
	children,
}: {
	title: React.ReactNode;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-[var(--space-lg)]">
			<div>
				<h2 className="text-[14px] font-semibold text-ctp-text">{title}</h2>
				{description && <p className="text-[12px] text-ctp-overlay1 mt-0.5">{description}</p>}
			</div>
			{children}
		</section>
	);
}

/* ─── Profile Tab ─────────────────────────────────────── */

function ProfileTab() {
	const { data: session } = useSession();
	const user = session?.user;

	if (!user) return null;

	return (
		<div className="space-y-[var(--space-xl)]">
			<Section title="Profile" description="Your personal account information.">
				<div className="space-y-[var(--space-md)]">
					<Field label="Name" value={user.name ?? "—"} />
					<Field label="Email" value={user.email} />
				</div>
			</Section>

			<div className="border-t border-ctp-surface0/15 pt-[var(--space-lg)]">
				<Button
					variant="danger"
					size="sm"
					onClick={() =>
						signOut({ fetchOptions: { onSuccess: () => window.location.replace("/sign-in") } })
					}
				>
					Sign out
				</Button>
			</div>
		</div>
	);
}

/* ─── Workspace Tab ───────────────────────────────────── */

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
		<>
			<div className="space-y-[var(--space-xl)]">
				<Section
					title={
						<span className="inline-flex items-center gap-2">
							Workspaces
							{workspaceBusy && (
								<span className="inline-block w-3 h-3 border-2 border-ctp-lavender/25 border-t-ctp-lavender rounded-full animate-spin" />
							)}
						</span>
					}
					description="Manage all your workspaces. Click on one to switch to it."
				>
					<div className="space-y-px">
						{workspaces.map((ws) => {
							const isActive = ws.id === activeWorkspace?.id;
							return (
								<div
									key={ws.id}
									className={cn(
										"flex items-center gap-[var(--space-md)] px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-sm)] transition-colors group",
										isActive ? "bg-ctp-lavender/8" : "hover:bg-ctp-surface0/10",
									)}
								>
									<button
										type="button"
										onClick={() => switchWorkspace(ws.id)}
										className="flex items-center gap-[var(--space-sm)] flex-1 min-w-0 cursor-pointer"
									>
										<div className="w-7 h-7 rounded-md bg-gradient-to-br from-ctp-blue/20 to-ctp-sapphire/15 flex items-center justify-center ring-1 ring-ctp-surface1/15 shrink-0">
											<span className="text-[10px] font-bold text-ctp-blue leading-none">
												{ws.name.charAt(0).toUpperCase()}
											</span>
										</div>
										<div className="min-w-0">
											<p className="text-[12px] font-medium text-ctp-text truncate flex items-center gap-1.5">
												{ws.name}
												{isActive && (
													<HugeiconsIcon
														icon={Tick01Icon}
														size={12}
														className="text-ctp-lavender shrink-0"
													/>
												)}
											</p>
											<p className="text-[10px] text-ctp-overlay0 truncate font-mono">{ws.slug}</p>
										</div>
									</button>

									<div className="flex items-center gap-px shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
										<button
											type="button"
											onClick={() => setRenameTarget({ id: ws.id, name: ws.name })}
											className="w-6 h-6 flex items-center justify-center rounded text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/30 cursor-pointer transition-colors"
											aria-label="Rename"
										>
											<HugeiconsIcon icon={Edit02Icon} size={13} />
										</button>
										{workspaces.length > 1 && (
											<button
												type="button"
												onClick={() => setDeleteTarget({ id: ws.id, name: ws.name })}
												className="w-6 h-6 flex items-center justify-center rounded text-ctp-overlay0 hover:text-ctp-red hover:bg-ctp-red/10 cursor-pointer transition-colors"
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

					<Button
						variant="secondary"
						size="sm"
						onClick={() => setCreateOpen(true)}
						className="mt-[var(--space-md)]"
					>
						<HugeiconsIcon icon={Add01Icon} size={13} />
						New workspace
					</Button>
				</Section>

				{/* Active workspace details */}
				{activeWorkspace && (
					<Section title="Current workspace">
						<div className="space-y-[var(--space-md)]">
							<Field label="Name" value={activeWorkspace.name} />
							<Field label="Slug" value={activeWorkspace.slug} />
							<Field label="ID" value={activeWorkspace.id} mono copyable />
						</div>
					</Section>
				)}
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
		</>
	);
}

/* ─── Members Tab ─────────────────────────────────────── */

interface Member {
	id: string;
	role: string;
	user: { id: string; name: string | null; email: string; image: string | null };
}

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

	return (
		<Section title="Members" description="Manage who has access to this workspace.">
			{loading ? (
				<div className="text-[12px] text-ctp-overlay0 py-[var(--space-lg)]">Loading...</div>
			) : members.length === 0 ? (
				<p className="text-[12px] text-ctp-overlay0">No members found.</p>
			) : (
				<div className="space-y-px">
					{members.map((m) => (
						<div
							key={m.id}
							className="flex items-center gap-[var(--space-md)] px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-sm)] hover:bg-ctp-surface0/10 transition-colors group"
						>
							<div className="w-7 h-7 rounded-md bg-gradient-to-br from-ctp-lavender/20 to-ctp-mauve/15 flex items-center justify-center ring-1 ring-ctp-surface1/15 shrink-0">
								<span className="text-[10px] font-bold text-ctp-lavender leading-none">
									{(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
								</span>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-[12px] font-medium text-ctp-text truncate">
									{m.user.name ?? m.user.email}
								</p>
								<p className="text-[10px] text-ctp-overlay0 truncate">{m.user.email}</p>
							</div>
							{m.role === "OWNER" ? (
								<span className="text-[10px] font-semibold text-ctp-peach bg-ctp-peach/8 px-2 py-0.5 rounded">
									Owner
								</span>
							) : (
								<div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
									<select
										value={m.role}
										onChange={(e) => handleRoleChange(m.id, e.target.value)}
										className="h-6 px-1.5 text-[10px] font-medium rounded border border-ctp-surface0/35 bg-ctp-mantle/40 text-ctp-subtext0 outline-none cursor-pointer"
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
		</Section>
	);
}

/* ─── Invites Tab ─────────────────────────────────────── */

interface Invite {
	id: string;
	token: string;
	email: string | null;
	role: string;
	expiresAt: string;
	createdBy: { name: string | null; email: string };
}

function InvitesTab() {
	const { activeWorkspace } = useWorkspaceContext();
	const [invites, setInvites] = useState<Invite[]>([]);
	const [loading, setLoading] = useState(true);
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("MEMBER");
	const [creating, setCreating] = useState(false);

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
			toast.success("Invite created");

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

	return (
		<div className="space-y-[var(--space-xl)]">
			<Section title="Invites" description="Create invite links to share with team members.">
				{/* Create form */}
				<div className="p-[var(--space-md)] rounded-[var(--radius-md)] bg-ctp-mantle/20 border border-ctp-surface0/12 space-y-[var(--space-sm)]">
					<div className="flex gap-[var(--space-sm)]">
						<Input
							placeholder="Email (optional)"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="flex-1"
						/>
						<select
							value={role}
							onChange={(e) => setRole(e.target.value)}
							className="h-8 px-2 text-[12px] font-medium rounded-md border border-ctp-surface0/35 bg-ctp-mantle/40 text-ctp-subtext0 outline-none cursor-pointer"
						>
							<option value="ADMIN">Admin</option>
							<option value="MEMBER">Member</option>
							<option value="VIEWER">Viewer</option>
						</select>
					</div>
					<Button variant="primary" size="sm" onClick={handleCreate} disabled={creating}>
						{creating ? "Creating..." : "Create invite"}
					</Button>
				</div>
			</Section>

			{/* Pending invites */}
			{loading ? (
				<div className="text-[12px] text-ctp-overlay0">Loading...</div>
			) : invites.length === 0 ? (
				<p className="text-[12px] text-ctp-overlay0">No pending invites.</p>
			) : (
				<div className="space-y-px">
					{invites.map((inv) => (
						<div
							key={inv.id}
							className="flex items-center justify-between gap-[var(--space-md)] px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-sm)] hover:bg-ctp-surface0/10 transition-colors group"
						>
							<div className="min-w-0">
								<p className="text-[12px] text-ctp-text truncate">{inv.email ?? "Open link"}</p>
								<p className="text-[10px] text-ctp-overlay0">
									{inv.role} &middot; Expires {new Date(inv.expiresAt).toLocaleDateString()}
								</p>
							</div>
							<button
								type="button"
								onClick={() => {
									const url = `${window.location.origin}/invite/${inv.token}`;
									navigator.clipboard.writeText(url);
									toast.success("Link copied");
								}}
								className="flex items-center gap-1 text-[11px] text-ctp-subtext0 hover:text-ctp-text transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
							>
								<HugeiconsIcon icon={Copy01Icon} size={12} />
								Copy
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

/* ─── Shared ─────────────────────────────────────────── */

function Field({
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
		<div className="space-y-0.5">
			<p className="text-[11px] font-medium text-ctp-subtext0 uppercase tracking-wider">{label}</p>
			<div className="flex items-center gap-[var(--space-xs)]">
				<p
					className={cn(
						"text-[12px] text-ctp-text bg-ctp-mantle/15 border border-ctp-surface0/12 rounded-md px-[var(--space-md)] py-[var(--space-sm)] flex-1",
						mono && "font-mono text-[11px] text-ctp-overlay1",
					)}
				>
					{value}
				</p>
				{copyable && (
					<button
						type="button"
						onClick={() => {
							navigator.clipboard.writeText(value);
							toast.success("Copied");
						}}
						className="text-ctp-overlay0 hover:text-ctp-text transition-colors cursor-pointer"
					>
						<HugeiconsIcon icon={Copy01Icon} size={13} />
					</button>
				)}
			</div>
		</div>
	);
}
