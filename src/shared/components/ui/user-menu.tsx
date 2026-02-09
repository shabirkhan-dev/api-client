"use client";

import { Logout01Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { signOut, useSession } from "@/shared/lib/auth-client";

export function UserMenu() {
	const { data: session } = useSession();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const handleSignOut = useCallback(async () => {
		await signOut({ fetchOptions: { onSuccess: () => window.location.replace("/sign-in") } });
	}, []);

	if (!session?.user) return null;

	const user = session.user;
	const initials = (user.name ?? user.email ?? "?")
		.split(" ")
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className={cn(
					"flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150 cursor-pointer",
					"hover:bg-ctp-surface0/30",
					open && "bg-ctp-surface0/30",
				)}
			>
				{user.image ? (
					<Image
						src={user.image}
						alt={user.name ?? "Avatar"}
						width={22}
						height={22}
						unoptimized
						className="w-[22px] h-[22px] rounded-md object-cover ring-1 ring-ctp-surface1/30"
					/>
				) : (
					<div className="w-[22px] h-[22px] rounded-md bg-gradient-to-br from-ctp-lavender/25 to-ctp-mauve/20 flex items-center justify-center ring-1 ring-ctp-surface1/20">
						<span className="text-[9px] font-bold text-ctp-lavender leading-none">
							{initials}
						</span>
					</div>
				)}
			</button>

			{open && (
				<div className="absolute right-0 top-full mt-1.5 bg-gradient-to-b from-ctp-base/96 to-ctp-mantle/96 backdrop-blur-[24px] backdrop-saturate-[1.5] border border-ctp-surface1/25 shadow-[0_0_0_0.5px_inset,0_16px_40px_-16px_rgba(0,0,0,0.65)] shadow-ctp-surface1/10 rounded-[var(--radius-lg)] w-48 animate-scale-in z-50 overflow-hidden">
					{/* User info */}
					<div className="px-3 py-2 border-b border-ctp-surface0/20">
						<p className="text-[12px] font-medium text-ctp-text truncate">{user.name}</p>
						<p className="text-[10px] text-ctp-overlay0 truncate">{user.email}</p>
					</div>

					{/* Menu items */}
					<div className="p-1">
						<MenuItem
							icon={UserIcon}
							label="Profile"
							onClick={() => { setOpen(false); router.push("/settings?tab=profile"); }}
						/>
						<MenuItem
							icon={Settings01Icon}
							label="Settings"
							onClick={() => { setOpen(false); router.push("/settings"); }}
						/>
						<div className="my-0.5 border-t border-ctp-surface0/15" />
						<MenuItem
							icon={Logout01Icon}
							label="Sign out"
							onClick={handleSignOut}
							danger
						/>
					</div>
				</div>
			)}
		</div>
	);
}

function MenuItem({
	icon,
	label,
	onClick,
	danger,
}: {
	icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
	label: string;
	onClick: () => void;
	danger?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-2 w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[12px] cursor-pointer transition-all duration-[130ms]",
				danger
					? "text-ctp-red hover:bg-ctp-red/10"
					: "text-ctp-subtext0 hover:bg-ctp-surface0/35 hover:text-ctp-text",
			)}
		>
			<HugeiconsIcon icon={icon} size={14} strokeWidth={1.5} />
			{label}
		</button>
	);
}
