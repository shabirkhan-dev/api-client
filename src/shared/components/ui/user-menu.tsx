"use client";

import { Logout01Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { signOut, useSession } from "@/shared/lib/auth-client";

interface UserMenuProps {
	onOpenSettings: () => void;
}

export function UserMenu({ onOpenSettings }: UserMenuProps) {
	const { data: session } = useSession();
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const handleSignOut = useCallback(async () => {
		await signOut({ fetchOptions: { onSuccess: () => window.location.replace("/sign-in") } });
	}, []);

	const handleOpenSettings = useCallback(() => { setOpen(false); onOpenSettings(); }, [onOpenSettings]);

	if (!session?.user) return null;

	const user = session.user;
	const initials = (user.name ?? user.email ?? "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className={cn(
					"flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer hover:bg-ctp-surface0/30 active:scale-[0.95]",
					open && "bg-ctp-surface0/30",
					"w-8 h-8"
				)}
			>
				{user.image ? (
					<Image src={user.image} alt={user.name ?? "Avatar"} width={24} height={24} unoptimized className="w-6 h-6 rounded-lg object-cover ring-1 ring-ctp-surface1/30" />
				) : (
					<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-ctp-lavender/30 to-ctp-mauve/20 flex items-center justify-center ring-1 ring-ctp-surface1/20">
						<span className="text-[10px] font-bold text-ctp-lavender leading-none">{initials}</span>
					</div>
				)}
			</button>

			{open && (
				<div className="absolute right-0 top-full mt-2 bg-gradient-to-b from-ctp-mantle/98 to-ctp-crust/98 backdrop-blur-xl backdrop-saturate-150 border border-ctp-surface0/30 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.7)] rounded-2xl w-56 animate-scale-in z-50 overflow-hidden">
					{/* User info */}
					<div className="px-4 py-3 border-b border-ctp-surface0/20">
						<div className="flex items-center gap-3">
							{user.image ? (
								<Image src={user.image} alt={user.name ?? "Avatar"} width={36} height={36} unoptimized className="w-9 h-9 rounded-xl object-cover ring-1 ring-ctp-surface1/30" />
							) : (
								<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ctp-lavender/30 to-ctp-mauve/20 flex items-center justify-center ring-1 ring-ctp-surface1/20">
									<span className="text-[12px] font-bold text-ctp-lavender">{initials}</span>
								</div>
							)}
							<div className="flex-1 min-w-0">
								<p className="text-[13px] font-semibold text-ctp-text truncate">{user.name}</p>
								<p className="text-[11px] text-ctp-overlay0 truncate">{user.email}</p>
							</div>
						</div>
					</div>

					{/* Menu items */}
					<div className="p-2 space-y-0.5">
						<MenuItem icon={UserIcon} label="Profile" onClick={handleOpenSettings} shortcuts={{ mac: "⌘,", win: "Ctrl+," }} />
						<MenuItem icon={Settings01Icon} label="Settings" onClick={handleOpenSettings} />
						<div className="my-1 border-t border-ctp-surface0/15" />
						<MenuItem icon={Logout01Icon} label="Sign out" onClick={handleSignOut} danger />
					</div>
				</div>
			)}
		</div>
	);
}

interface MenuItemProps {
	icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
	label: string;
	onClick: () => void;
	shortcuts?: { mac: string; win: string };
	danger?: boolean;
}

function MenuItem({ icon, label, onClick, shortcuts, danger }: MenuItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] cursor-pointer transition-all duration-150",
				danger ? "text-ctp-red hover:bg-ctp-red/10" : "text-ctp-subtext0 hover:bg-ctp-surface0/40 hover:text-ctp-text"
			)}
		>
			<HugeiconsIcon icon={icon} size={16} strokeWidth={1.5} />
			<span className="flex-1 text-left font-medium">{label}</span>
			{shortcuts && <kbd className="text-[10px] text-ctp-overlay0 font-mono bg-ctp-surface0/30 px-1.5 py-0.5 rounded">{shortcuts.mac}</kbd>}
		</button>
	);
}
