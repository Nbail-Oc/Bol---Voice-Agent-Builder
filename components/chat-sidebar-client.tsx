"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoIcon } from "@/components/logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Comment01Icon, AiAudioIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface Session {
	id: string;
	title: string;
	createdAt: string;
	updatedAt: string;
}

export function ChatSidebarClient({ currentSessionId }: { currentSessionId?: string }) {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [loading, setLoading] = useState(true);

	async function loadSessions() {
		try {
			const res = await fetch("/api/opencode/sessions");
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data?.sessions)) {
					setSessions(data.sessions);
				}
			}
		} catch {
			// Silent fail
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadSessions();
	}, []);

	return (
		<Sidebar collapsible="icon" variant="floating" className="border-r border-white/10 font-sans">
			<SidebarHeader className="h-14 justify-center border-b border-white/10 px-3">
				<SidebarMenuButton
					render={<Link href="/" />}
					className="h-10 rounded-none hover:bg-white/5 gap-2.5 px-2"
					tooltip="Bol Home"
				>
					<LogoIcon className="size-5 shrink-0 object-contain rounded-sm" />
					<span className="font-sans text-base font-semibold tracking-tight text-white group-data-[collapsible=icon]:hidden">
						Bol
					</span>
				</SidebarMenuButton>
			</SidebarHeader>

			<SidebarContent className="px-2 py-2 gap-2">
				{/* Primary actions: New chat & All Agents */}
				<SidebarGroup className="p-0">
					<SidebarMenu className="gap-1.5">
						<SidebarMenuItem>
							<SidebarMenuButton
								render={<Link href="/chat" />}
								className="min-w-8 bg-white text-black font-medium hover:bg-neutral-200 rounded-none border border-white/20 uppercase text-xs tracking-wider font-sans"
								tooltip="Start new chat"
							>
								<HugeiconsIcon icon={Add01Icon} className="size-4 shrink-0" />
								<span className="font-sans font-medium">New chat</span>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								render={<Link href="/agents" />}
								className="min-w-8 text-neutral-300 hover:text-white hover:bg-white/5 rounded-none border border-transparent hover:border-white/10 uppercase text-xs tracking-wider font-sans"
								tooltip="All Agents"
							>
								<HugeiconsIcon icon={AiAudioIcon} className="size-4 shrink-0" />
								<span className="font-sans font-medium">All Agents</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>

				{/* Recent chats: hidden when collapsed */}
				<SidebarGroup className="group-data-[collapsible=icon]:hidden border-t border-white/10 pt-3 p-0">
					<div className="px-2 py-1.5 font-mono text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
						Recent Chats
					</div>
					<SidebarMenu className="gap-0.5">
						{loading ? (
							<div className="px-2 py-2 font-mono text-xs text-neutral-500">
								Loading...
							</div>
						) : sessions.length === 0 ? (
							<div className="flex flex-col items-center justify-center px-3 py-6 text-center">
								<div className="relative mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-white/[0.02] border border-white/5 p-2">
									<img
										src="/empty-state.svg"
										alt="Empty State"
										className="h-24 w-24 object-contain opacity-85 pointer-events-none"
									/>
								</div>
								<p className="font-sans text-xs font-medium text-neutral-300">
									No chats yet
								</p>
								<p className="mt-1 font-sans text-[11px] text-neutral-500 leading-tight">
									Start a conversation to draft your first voice agent.
								</p>
							</div>
						) : (
							sessions.map((session) => (
								<SidebarMenuItem key={session.id}>
									<SidebarMenuButton
										render={<Link href={`/chat/${session.id}`} />}
										isActive={session.id === currentSessionId}
										tooltip={session.title}
										className="rounded-none font-sans text-xs text-neutral-300 hover:text-white hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-white data-[active=true]:border-l-2 data-[active=true]:border-white"
									>
										<HugeiconsIcon icon={Comment01Icon} className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
										<span className="truncate">{session.title}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))
						)}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
