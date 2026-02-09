"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";

/* ─── Base Modal ─────────────────────────────────────── */

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
	className?: string;
	/** Prevent closing while an operation is in progress */
	busy?: boolean;
}

export function Modal({ open, onClose, title, children, className, busy }: ModalProps) {
	const overlayRef = useRef<HTMLDivElement>(null);

	const safeClose = useCallback(() => {
		if (!busy) onClose();
	}, [busy, onClose]);

	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") safeClose();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [open, safeClose]);

	const handleOverlay = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === overlayRef.current) safeClose();
		},
		[safeClose],
	);

	if (!open) return null;

	return (
		<div
			ref={overlayRef}
			onClick={handleOverlay}
			onKeyDown={(e) => {
				if (e.key === "Escape") safeClose();
			}}
			role="dialog"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
		>
			<div
				className={cn(
					"bg-gradient-to-b from-ctp-base to-ctp-mantle border border-ctp-surface1/25 rounded-[var(--radius-xl)] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.7)] w-full max-w-sm animate-scale-in overflow-hidden",
					className,
				)}
			>
				{title && (
					<div className="flex items-center justify-between px-[var(--space-xl)] py-[var(--space-lg)] border-b border-ctp-surface0/20">
						<h2 className="text-[13px] font-semibold text-ctp-text">{title}</h2>
						<button
							type="button"
							onClick={safeClose}
							disabled={busy}
							className="flex items-center justify-center w-6 h-6 rounded-md text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/30 transition-colors cursor-pointer disabled:opacity-30"
						>
							<HugeiconsIcon icon={Cancel01Icon} size={14} />
						</button>
					</div>
				)}
				<div className="px-[var(--space-xl)] py-[var(--space-lg)]">{children}</div>
			</div>
		</div>
	);
}

/* ─── Shared footer buttons ──────────────────────────── */

function DialogFooter({
	onClose,
	confirmLabel,
	confirmVariant = "primary",
	loading,
	isSubmit,
	onConfirm,
}: {
	onClose: () => void;
	confirmLabel: string;
	confirmVariant?: "primary" | "danger";
	loading?: boolean;
	isSubmit?: boolean;
	onConfirm?: () => void;
}) {
	return (
		<div className="flex items-center justify-end gap-[var(--space-sm)]">
			<button
				type="button"
				onClick={onClose}
				disabled={loading}
				className="h-8 px-[var(--space-md)] text-[12px] font-medium text-ctp-subtext0 hover:text-ctp-text rounded-md hover:bg-ctp-surface0/25 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
			>
				Cancel
			</button>
			<button
				type={isSubmit ? "submit" : "button"}
				onClick={onConfirm}
				disabled={loading}
				className={cn(
					"h-8 px-[var(--space-lg)] text-[12px] font-semibold rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60 disabled:pointer-events-none",
					confirmVariant === "danger"
						? "bg-ctp-red/15 text-ctp-red hover:bg-ctp-red/25 border border-ctp-red/20"
						: "bg-gradient-to-br from-ctp-lavender to-ctp-mauve text-ctp-crust hover:brightness-110",
				)}
			>
				{loading && <Spinner />}
				{confirmLabel}
			</button>
		</div>
	);
}

function Spinner() {
	return (
		<span className="inline-block w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
	);
}

/* ─── Prompt Dialog ──────────────────────────────────── */

interface PromptDialogProps {
	open: boolean;
	onClose: () => void;
	/** Return a Promise — dialog stays open with spinner until it resolves */
	onConfirm: (value: string) => void | Promise<void>;
	title: string;
	placeholder?: string;
	defaultValue?: string;
	confirmLabel?: string;
	confirmVariant?: "primary" | "danger";
}

export function PromptDialog({
	open,
	onClose,
	onConfirm,
	title,
	placeholder = "",
	defaultValue = "",
	confirmLabel = "Create",
	confirmVariant = "primary",
}: PromptDialogProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (open) {
			setBusy(false);
			setTimeout(() => inputRef.current?.select(), 50);
		}
	}, [open]);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const val = inputRef.current?.value.trim();
			if (!val || busy) return;

			setBusy(true);
			try {
				await onConfirm(val);
				onClose();
			} catch {
				/* toast is handled in the hook */
			} finally {
				setBusy(false);
			}
		},
		[onConfirm, onClose, busy],
	);

	return (
		<Modal open={open} onClose={onClose} title={title} busy={busy}>
			<form onSubmit={handleSubmit} className="space-y-[var(--space-lg)]">
				<input
					ref={inputRef}
					defaultValue={defaultValue}
					placeholder={placeholder}
					spellCheck={false}
					disabled={busy}
					className="flex w-full h-9 rounded-md bg-ctp-mantle/40 border border-ctp-surface0/30 px-[var(--space-md)] text-[13px] text-ctp-text placeholder:text-ctp-overlay0/40 outline-none focus:border-ctp-lavender/45 transition-colors disabled:opacity-50"
				/>
				<DialogFooter
					onClose={onClose}
					confirmLabel={confirmLabel}
					confirmVariant={confirmVariant}
					loading={busy}
					isSubmit
				/>
			</form>
		</Modal>
	);
}

/* ─── Confirm Dialog ─────────────────────────────────── */

interface ConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	/** Return a Promise — dialog stays open with spinner until it resolves */
	onConfirm: () => void | Promise<void>;
	title: string;
	message: string;
	confirmLabel?: string;
	variant?: "danger" | "primary";
}

export function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = "Confirm",
	variant = "danger",
}: ConfirmDialogProps) {
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (open) setBusy(false);
	}, [open]);

	const handleConfirm = useCallback(async () => {
		if (busy) return;
		setBusy(true);
		try {
			await onConfirm();
			onClose();
		} catch {
			/* toast is handled in the hook */
		} finally {
			setBusy(false);
		}
	}, [onConfirm, onClose, busy]);

	return (
		<Modal open={open} onClose={onClose} title={title} busy={busy}>
			<div className="space-y-[var(--space-lg)]">
				<p className="text-[12px] text-ctp-subtext0 leading-relaxed">{message}</p>
				<DialogFooter
					onClose={onClose}
					confirmLabel={confirmLabel}
					confirmVariant={variant}
					loading={busy}
					onConfirm={handleConfirm}
				/>
			</div>
		</Modal>
	);
}

/* ─── Request Form Dialog (name + method picker) ─────── */

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const methodColors: Record<string, string> = {
	GET: "bg-ctp-green/12 text-ctp-green border-ctp-green/25 hover:bg-ctp-green/20",
	POST: "bg-ctp-blue/12 text-ctp-blue border-ctp-blue/25 hover:bg-ctp-blue/20",
	PUT: "bg-ctp-yellow/12 text-ctp-yellow border-ctp-yellow/25 hover:bg-ctp-yellow/20",
	DELETE: "bg-ctp-red/12 text-ctp-red border-ctp-red/25 hover:bg-ctp-red/20",
	PATCH: "bg-ctp-mauve/12 text-ctp-mauve border-ctp-mauve/25 hover:bg-ctp-mauve/20",
};

const methodColorsActive: Record<string, string> = {
	GET: "bg-ctp-green/25 text-ctp-green border-ctp-green/50 ring-1 ring-ctp-green/20",
	POST: "bg-ctp-blue/25 text-ctp-blue border-ctp-blue/50 ring-1 ring-ctp-blue/20",
	PUT: "bg-ctp-yellow/25 text-ctp-yellow border-ctp-yellow/50 ring-1 ring-ctp-yellow/20",
	DELETE: "bg-ctp-red/25 text-ctp-red border-ctp-red/50 ring-1 ring-ctp-red/20",
	PATCH: "bg-ctp-mauve/25 text-ctp-mauve border-ctp-mauve/50 ring-1 ring-ctp-mauve/20",
};

interface RequestFormDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (name: string, method: HttpMethod) => void | Promise<void>;
	title: string;
	defaultName?: string;
	defaultMethod?: HttpMethod;
	confirmLabel?: string;
}

export function RequestFormDialog({
	open,
	onClose,
	onConfirm,
	title,
	defaultName = "",
	defaultMethod = "GET",
	confirmLabel = "Create",
}: RequestFormDialogProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [method, setMethod] = useState<HttpMethod>(defaultMethod);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (open) {
			setMethod(defaultMethod);
			setBusy(false);
			setTimeout(() => inputRef.current?.select(), 50);
		}
	}, [open, defaultMethod]);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const val = inputRef.current?.value.trim();
			if (!val || busy) return;

			setBusy(true);
			try {
				await onConfirm(val, method);
				onClose();
			} catch {
				/* error handled by caller */
			} finally {
				setBusy(false);
			}
		},
		[onConfirm, onClose, method, busy],
	);

	return (
		<Modal open={open} onClose={onClose} title={title} busy={busy}>
			<form onSubmit={handleSubmit} className="space-y-[var(--space-lg)]">
				{/* Method picker */}
				<div className="space-y-[var(--space-sm)]">
					<label className="text-[11px] font-medium text-ctp-subtext0 uppercase tracking-wider">
						Method
					</label>
					<div className="flex gap-1">
						{METHODS.map((m) => (
							<button
								key={m}
								type="button"
								disabled={busy}
								onClick={() => setMethod(m)}
								className={cn(
									"px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider rounded-md border cursor-pointer transition-all duration-150 disabled:opacity-40",
									method === m ? methodColorsActive[m] : `${methodColors[m]} opacity-60`,
								)}
							>
								{m}
							</button>
						))}
					</div>
				</div>

				{/* Name input */}
				<div className="space-y-[var(--space-sm)]">
					<label className="text-[11px] font-medium text-ctp-subtext0 uppercase tracking-wider">
						Name
					</label>
					<input
						ref={inputRef}
						defaultValue={defaultName}
						placeholder="e.g. List Users, Create Post..."
						spellCheck={false}
						disabled={busy}
						className="flex w-full h-9 rounded-md bg-ctp-mantle/40 border border-ctp-surface0/30 px-[var(--space-md)] text-[13px] text-ctp-text placeholder:text-ctp-overlay0/40 outline-none focus:border-ctp-lavender/45 transition-colors disabled:opacity-50"
					/>
				</div>

				<DialogFooter onClose={onClose} confirmLabel={confirmLabel} loading={busy} isSubmit />
			</form>
		</Modal>
	);
}

/* ─── Request Edit Dialog (name + method + URL) ──────── */

interface RequestEditDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (data: { name: string; method: HttpMethod; url: string }) => void | Promise<void>;
	title: string;
	defaultName?: string;
	defaultMethod?: HttpMethod;
	defaultUrl?: string;
}

export function RequestEditDialog({
	open,
	onClose,
	onConfirm,
	title,
	defaultName = "",
	defaultMethod = "GET",
	defaultUrl = "",
}: RequestEditDialogProps) {
	const nameRef = useRef<HTMLInputElement>(null);
	const urlRef = useRef<HTMLInputElement>(null);
	const [method, setMethod] = useState<HttpMethod>(defaultMethod);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (open) {
			setMethod(defaultMethod);
			setBusy(false);
			setTimeout(() => nameRef.current?.select(), 50);
		}
	}, [open, defaultMethod]);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const name = nameRef.current?.value.trim();
			const url = urlRef.current?.value.trim() ?? "";
			if (!name || busy) return;

			setBusy(true);
			try {
				await onConfirm({ name, method, url });
				onClose();
			} catch {
				/* error handled by caller */
			} finally {
				setBusy(false);
			}
		},
		[onConfirm, onClose, method, busy],
	);

	return (
		<Modal open={open} onClose={onClose} title={title} className="max-w-md" busy={busy}>
			<form onSubmit={handleSubmit} className="space-y-[var(--space-lg)]">
				{/* Method picker */}
				<div className="space-y-[var(--space-sm)]">
					<label className="text-[11px] font-medium text-ctp-subtext0 uppercase tracking-wider">
						Method
					</label>
					<div className="flex gap-1">
						{METHODS.map((m) => (
							<button
								key={m}
								type="button"
								disabled={busy}
								onClick={() => setMethod(m)}
								className={cn(
									"px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider rounded-md border cursor-pointer transition-all duration-150 disabled:opacity-40",
									method === m ? methodColorsActive[m] : `${methodColors[m]} opacity-60`,
								)}
							>
								{m}
							</button>
						))}
					</div>
				</div>

				{/* Name */}
				<div className="space-y-[var(--space-sm)]">
					<label className="text-[11px] font-medium text-ctp-subtext0 uppercase tracking-wider">
						Name
					</label>
					<input
						ref={nameRef}
						defaultValue={defaultName}
						placeholder="Request name"
						spellCheck={false}
						disabled={busy}
						className="flex w-full h-9 rounded-md bg-ctp-mantle/40 border border-ctp-surface0/30 px-[var(--space-md)] text-[13px] text-ctp-text placeholder:text-ctp-overlay0/40 outline-none focus:border-ctp-lavender/45 transition-colors disabled:opacity-50"
					/>
				</div>

				{/* URL */}
				<div className="space-y-[var(--space-sm)]">
					<label className="text-[11px] font-medium text-ctp-subtext0 uppercase tracking-wider">
						URL
					</label>
					<input
						ref={urlRef}
						defaultValue={defaultUrl}
						placeholder="https://api.example.com/v1/resource"
						spellCheck={false}
						disabled={busy}
						className="flex w-full h-9 rounded-md bg-ctp-mantle/40 border border-ctp-surface0/30 px-[var(--space-md)] text-[13px] font-mono text-ctp-text placeholder:text-ctp-overlay0/40 outline-none focus:border-ctp-lavender/45 transition-colors disabled:opacity-50"
					/>
				</div>

				<DialogFooter onClose={onClose} confirmLabel="Save" loading={busy} isSubmit />
			</form>
		</Modal>
	);
}
