"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui";
import { useSession } from "@/shared/lib/auth-client";

export default function AcceptInvitePage() {
	const router = useRouter();
	const params = useParams<{ token: string }>();
	const { data: session, isPending } = useSession();

	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [message, setMessage] = useState("");
	const [workspaceName, setWorkspaceName] = useState("");

	useEffect(() => {
		if (isPending) return;

		if (!session?.user) {
			// Redirect to sign-in with callback
			router.replace(`/sign-in?callbackUrl=/invite/${params.token}`);
			return;
		}

		// Accept the invite
		async function accept() {
			try {
				const res = await fetch("/api/invites/accept", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token: params.token }),
				});

				const data = await res.json();

				if (!res.ok) {
					setStatus("error");
					setMessage(data.error ?? "Failed to accept invite");
					return;
				}

				setStatus("success");
				setWorkspaceName(data.workspace?.name ?? "Workspace");
			} catch {
				setStatus("error");
				setMessage("Something went wrong");
			}
		}

		accept();
	}, [session, isPending, params.token, router]);

	if (isPending || status === "loading") {
		return (
			<div className="text-center py-8">
				<div className="w-6 h-6 border-2 border-ctp-lavender/30 border-t-ctp-lavender rounded-full animate-spin-slow mx-auto" />
				<p className="text-[13px] text-ctp-overlay1 mt-3">
					Accepting invite&hellip;
				</p>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="text-center py-4">
				<div className="w-10 h-10 rounded-xl bg-ctp-red/10 flex items-center justify-center mx-auto mb-3">
					<span className="text-[18px]">!</span>
				</div>
				<h2 className="text-[16px] font-semibold text-ctp-text">
					Invite failed
				</h2>
				<p className="text-[13px] text-ctp-overlay1 mt-1">{message}</p>
				<Button
					variant="secondary"
					size="md"
					onClick={() => router.push("/")}
					className="mt-4"
				>
					Go to dashboard
				</Button>
			</div>
		);
	}

	return (
		<div className="text-center py-4">
			<div className="w-10 h-10 rounded-xl bg-ctp-green/10 flex items-center justify-center mx-auto mb-3">
				<span className="text-[18px] text-ctp-green">&#10003;</span>
			</div>
			<h2 className="text-[16px] font-semibold text-ctp-text">
				You&apos;ve joined {workspaceName}
			</h2>
			<p className="text-[13px] text-ctp-overlay1 mt-1">
				You now have access to this workspace&apos;s collections, environments, and history.
			</p>
			<Button
				variant="primary"
				size="md"
				onClick={() => router.push("/")}
				className="mt-4"
			>
				Open workspace
			</Button>
		</div>
	);
}
