"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";

export function ChatHeader() {
	return (
		<header
			className={cn(
				"sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-black px-4 font-sans"
			)}
		>
			<CustomSidebarTrigger />
			<Separator
				className="h-4 bg-white/10 data-[orientation=vertical]:self-center"
				orientation="vertical"
			/>
			<div className="flex flex-1 items-center gap-2.5">
				<img src="/LOGO.png" alt="Bol Logo" className="size-5 rounded-sm object-contain" />
				<span className="text-sm font-semibold tracking-tight text-white font-sans">Agent Builder</span>
				<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
					Local Engine
				</span>
			</div>
		</header>
	);
}
