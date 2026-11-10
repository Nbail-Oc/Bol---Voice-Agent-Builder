import Link from "next/link";
import { listAgents, seedDemoAgent } from "../../lib/agent-store.js";
import { HugeiconsIcon } from "@hugeicons/react";
import { BotIcon, ArrowRight01Icon, Mic01Icon, Add01Icon } from "@hugeicons/core-free-icons";

export const dynamic = "force-dynamic";

export default function AgentsIndexPage() {
  seedDemoAgent();
  const agents = listAgents();

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-white/30">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <img src="/LOGO.png" alt="Bol Logo" className="w-5 h-5 object-contain rounded-sm" />
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Agent Roster
              </div>
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Configured Voice Agents</h1>
            <p className="text-sm text-neutral-400">All local-first voice agents active in your Bol runtime.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="h-9 px-4 border border-white/15 bg-transparent text-white hover:bg-white/5 text-xs font-medium uppercase tracking-wider inline-flex items-center"
            >
              Back to Home
            </Link>
            <Link
              href="/chat"
              className="h-9 px-4 bg-white text-black hover:bg-neutral-200 text-xs font-medium uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" />
              Build Agent
            </Link>
          </div>
        </header>

        {/* Agents Grid */}
        {agents.length === 0 ? (
          <div className="border border-white/10 bg-[#0a0a0a] p-12 text-center space-y-4">
            <HugeiconsIcon icon={BotIcon} className="h-10 w-10 text-neutral-600 mx-auto" />
            <h2 className="text-lg font-medium text-white">No agents deployed yet</h2>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Start a new chat to build your first voice agent with natural spoken turn-taking and custom knowledge.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 h-9 px-4 bg-white text-black hover:bg-neutral-200 text-xs font-medium uppercase tracking-wider"
            >
              <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" />
              Create First Agent
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <article
                key={agent.id}
                className="border border-white/15 bg-[#0a0a0a] p-6 flex flex-col justify-between space-y-6 hover:border-white/30 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                      ID: {agent.id}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  </div>

                  <h2 className="text-xl font-medium tracking-tight text-white">{agent.name}</h2>
                  <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">{agent.purpose}</p>

                  <div className="font-mono text-xs text-neutral-400 flex flex-wrap gap-x-3 gap-y-1 pt-1">
                    <span>Lang: {agent.language || "en-IN"}</span>
                    <span>·</span>
                    <span>Voice: {agent.voice || "Default"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <Link
                    href={`/agents/${agent.id}/voice`}
                    className="flex-1 h-9 bg-white text-black hover:bg-neutral-200 text-xs font-medium uppercase tracking-wider inline-flex items-center justify-center gap-1.5"
                  >
                    <HugeiconsIcon icon={Mic01Icon} className="h-3.5 w-3.5" />
                    Start Voice
                  </Link>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="h-9 px-3 border border-white/15 bg-transparent text-white hover:bg-white/5 text-xs font-medium uppercase tracking-wider inline-flex items-center justify-center gap-1"
                  >
                    Edit
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

