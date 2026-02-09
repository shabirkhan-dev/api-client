import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			{/* Ambient glow decoration */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				<div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-ctp-lavender/[0.04] blur-[120px]" />
				<div className="absolute bottom-0 right-0 w-[400px] h-[350px] rounded-full bg-ctp-mauve/[0.03] blur-[100px]" />
			</div>

			<div className="relative w-full max-w-[420px] animate-scale-in">
				{/* Logo + Branding */}
				<div className="flex flex-col items-center gap-3 mb-8">
					<div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-ctp-lavender to-ctp-mauve shadow-[0_4px_24px] shadow-ctp-lavender/30">
						<span className="text-[18px] font-extrabold text-ctp-crust leading-none tracking-tight">
							A
						</span>
					</div>
					<div className="text-center">
						<h1 className="text-[18px] font-semibold text-ctp-text tracking-tight">
							Nebula API Client
						</h1>
						<p className="text-[13px] text-ctp-overlay1 mt-0.5">
							Open-source API development platform
						</p>
					</div>
				</div>

				{/* Card */}
				<div className="bg-gradient-to-b from-ctp-base/80 to-ctp-mantle/85 backdrop-blur-[24px] backdrop-saturate-[1.4] border border-ctp-surface1/20 shadow-[0_0_0_0.5px_inset] shadow-ctp-surface0/10 rounded-[var(--radius-xl)] p-6">
					{children}
				</div>

				{/* Footer */}
				<p className="text-center text-[11px] text-ctp-overlay0/60 mt-6">
					Self-hosted &middot; End-to-end encrypted &middot; Open source
				</p>
			</div>
		</div>
	);
}
