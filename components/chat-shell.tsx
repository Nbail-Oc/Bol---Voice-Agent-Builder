"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatHeader } from "@/components/chat-header";
import { ChatSidebarClient } from "@/components/chat-sidebar-client";

export function ChatShell({
	children,
	sessionId,
}: {
	children: React.ReactNode;
	sessionId?: string;
}) {
	return (
		<SidebarProvider className="h-dvh max-h-dvh overflow-hidden">
			<ChatSidebarClient currentSessionId={sessionId} />
			<SidebarInset className="flex h-dvh max-h-dvh flex-col overflow-hidden p-0">
				<ChatHeader />
				<div className="flex flex-1 min-h-0 flex-col overflow-hidden">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
