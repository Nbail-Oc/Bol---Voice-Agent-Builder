import { ChatShell } from "@/components/chat-shell";
import { ChatContent } from "./chat-content";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <ChatShell>
      <ChatContent />
    </ChatShell>
  );
}
