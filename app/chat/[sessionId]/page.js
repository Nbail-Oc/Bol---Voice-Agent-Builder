import { ChatShell } from "@/components/chat-shell";
import { ChatContent } from "../chat-content";

export default async function ExistingChatPage({ params }) {
  const { sessionId } = await params;
  return (
    <ChatShell sessionId={sessionId}>
      <ChatContent initialSessionId={sessionId} />
    </ChatShell>
  );
}
