"use client";

import Link from "next/link";
import { useState } from "react";
import PredictiveArc03 from "../components/predictive-arc-03";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

export default function TechLanding({ agents = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedSpanIndex, setSelectedSpanIndex] = useState(1);

  // Real trace spans for voice AI observability pipeline
  const eventStream = [
    { id: "evt_0981a", span: "audio.voice_ingress", status: "PASS", startOffset: 0, duration: 18, durationText: "18ms" },
    { id: "evt_0981b", span: "stt.stream_transcribe", status: "PASS", startOffset: 12, duration: 84, durationText: "84ms" },
    { id: "evt_0981c", span: "vad.endpoint_detect", status: "PASS", startOffset: 65, duration: 22, durationText: "22ms" },
    { id: "evt_0981d", span: "agent.boundary_eval", status: "PASS", startOffset: 92, duration: 14, durationText: "14ms" },
    { id: "evt_0981e", span: "llm.stream_tokens_first", status: "PASS", startOffset: 104, duration: 96, durationText: "96ms" },
    { id: "evt_0981f", span: "tts.stream_synthesize", status: "PASS", startOffset: 168, duration: 62, durationText: "62ms" },
    { id: "evt_0981g", span: "audio.playback_stream", status: "PASS", startOffset: 202, duration: 39, durationText: "39ms" },
  ];

  return (
    <div className="dt-root">
      {/* ====================================================================
          HEADER: Absolute-positioned at top (top: 38px, px: 56px)
          ==================================================================== */}
      <header className="dt-header">
        <div className="dt-header-left">
          <Link href="/" className="dt-logo">
            <img src="/LOGO.png" alt="Bol Logo" width="28" height="28" className="w-7 h-7 object-contain rounded-sm" />
            <span className="dt-brand-title">BOL</span>
          </Link>
        </div>

        <nav className="dt-header-nav" aria-label="Main Navigation">
          <a href="#event-stream" className="dt-nav-item">Voice Pipeline</a>
          <a href="#bento-grid" className="dt-nav-item">Capabilities</a>
          <a href="#metrics-grid" className="dt-nav-item">Performance</a>
          <Link href="/auth" className="dt-nav-item">Voice Builder</Link>
          {agents.length > 0 && (
            <Link href={`/agents/${agents[0].id}`} className="dt-nav-item dt-nav-active">
              Active Agent ({agents.length})
            </Link>
          )}
        </nav>

        <div className="dt-header-right">
          <Link href="/auth" className="btn-square dt-header-btn">
            <span>Create Agent</span>
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="w-3 h-3" />
          </Link>

          <button
            type="button"
            className="dt-burger"
            aria-label="Open mobile navigation"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Full-screen Mobile Menu */}
      {mobileMenuOpen && (
        <div className="dt-fullscreen-mobile-menu">
          <div className="dt-mobile-menu-head">
            <div className="dt-logo">
              <img src="/LOGO.png" alt="Bol Logo" width="28" height="28" className="w-7 h-7 object-contain rounded-sm" />
              <span className="dt-brand-title">BOL</span>
            </div>
            <button
              type="button"
              className="dt-mobile-close-btn flex items-center justify-center"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
            </button>
          </div>

          <nav className="dt-mobile-nav">
            <a href="#event-stream" onClick={() => setMobileMenuOpen(false)}>Voice Pipeline</a>
            <a href="#bento-grid" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
            <a href="#metrics-grid" onClick={() => setMobileMenuOpen(false)}>Performance</a>
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>Voice Builder</Link>
          </nav>

          <div className="dt-mobile-bottom">
            <Link href="/auth" className="btn-square dt-cta-large dt-w-full" onClick={() => setMobileMenuOpen(false)}>
              <span>Create Agent</span>
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* ====================================================================
          HERO SECTION: Full-height (100svh) canvas frame with predictive arc
          ==================================================================== */}
      <section className="dt-hero">
        <div className="dt-hero-media" aria-hidden="true">
          <PredictiveArc03 className="dt-hero-canvas" speed={0.9} dotSize={22} />
          <div className="dt-hero-scrim-arc" />
        </div>

        <div className="dt-hero-content">
          <div className="dt-hero-badges">
            <span className="v-chip">
              <span className="v-chip-dot pass" />
              <span>CONVERSATIONAL VOICE BUILDER</span>
            </span>
            <span className="v-chip">
              <span className="v-chip-dot blue" />
              <span>REAL-TIME BARGE-IN RUNTIME</span>
            </span>
          </div>

          <h1 className="headline-fluid">
            Build intelligent voice agents. Just by talking.
          </h1>

          <p className="dt-hero-subtext">
            Bol turns plain conversation into production-ready voice assistants.
            Describe your workflow, ground your agent in verified documents, and run
            responsive voice sessions with sub-second turnaround and natural barge-in.
          </p>

          <div className="dt-hero-cta-wrap">
            <Link href="/auth" className="btn-square dt-cta-large">
              <span>Create Your Agent</span>
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="w-3 h-3" />
            </Link>

            <a href="#event-stream" className="dt-sub-link">
              <span>Inspect Voice Engine</span>
            </a>
          </div>
        </div>
      </section>

      {/* ====================================================================
          EVENT STREAM TABLE: Split view (240px sidebar + table with timeline)
          ==================================================================== */}
      <section id="event-stream" className="dt-section">
        <div className="dt-section-top">
          <div className="dt-section-title-group">
            <span className="v-chip">
              <span className="v-chip-dot blue" />
              <span>VOICE RUNTIME TELEMETRY</span>
            </span>
            <h2 className="dt-section-h2">Sub-Second Voice Pipeline Execution</h2>
          </div>

          <div className="dt-header-chips">
            <span className="v-chip">
              <span className="v-chip-dot pass" />
              <span>TRACE #BOL-9941</span>
            </span>
            <span className="v-chip">
              <span className="v-chip-dot pass" />
              <span>241MS TURNAROUND</span>
            </span>
            <span className="v-chip">
              <span className="v-chip-dot warn" />
              <span>0MS JITTER</span>
            </span>
          </div>
        </div>

        <div className="dt-card dt-table-card-container">
          <div className="dt-split-table-layout">
            {/* Left sidebar (240px): scrollable list of event IDs with status dots */}
            <aside className="dt-sidebar-events">
              <div className="dt-sidebar-events-head">
                <span>SESSION SPAN</span>
                <span>STATUS</span>
              </div>
              <ul className="dt-events-scroll-list">
                {eventStream.map((evt, idx) => {
                  const isSelected = idx === selectedSpanIndex;
                  return (
                    <li
                      key={evt.id}
                      className={`dt-event-row ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedSpanIndex(idx)}
                    >
                      <span className="dt-event-id-text">{evt.id}</span>
                      <span className="v-chip">
                        <span className={`v-chip-dot ${isSelected ? "blue" : "pass"}`} />
                        <span>{evt.status}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Right side: SPAN, START (relative progress-bar), DURATION */}
            <div className="dt-table-area">
              <table className="dt-table">
                <thead>
                  <tr>
                    <th style={{ width: "32%" }}>PIPELINE STAGE</th>
                    <th style={{ width: "52%" }}>STREAM PROGRESS</th>
                    <th style={{ width: "16%", textAlign: "right" }}>LATENCY</th>
                  </tr>
                </thead>
                <tbody>
                  {eventStream.map((evt, idx) => {
                    const isFocus = idx === selectedSpanIndex;
                    // Timeline calculation based on 241ms total trace window
                    const leftPct = Math.min(88, (evt.startOffset / 241) * 100);
                    const widthPct = Math.max(4, Math.min(100 - leftPct, (evt.duration / 241) * 100));

                    return (
                      <tr
                        key={evt.id}
                        className={isFocus ? "dt-tr-focus" : ""}
                        onClick={() => setSelectedSpanIndex(idx)}
                      >
                        <td className="dt-td-span">
                          <span
                            className="dt-span-indicator-dot"
                            style={{ background: isFocus ? "#52a8ff" : "#62c073" }}
                          />
                          <code>{evt.span}</code>
                        </td>

                        {/* START column: Timeline Progress Bar (Container: w-full, h-1.5, bg-transparent) */}
                        <td className="dt-td-timeline">
                          <div className="timeline-progress-container">
                            <div
                              className="timeline-progress-bar"
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                background: isFocus ? "#52a8ff" : "rgba(255, 255, 255, 0.18)",
                                boxShadow: isFocus ? "0 0 10px rgba(82, 168, 255, 0.6)" : "none",
                              }}
                            />
                          </div>
                        </td>

                        <td className="dt-td-duration">
                          <code>{evt.durationText}</code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          BENTO FEATURE GRID: 3-column grid of cards (#0a0a0a)
          ==================================================================== */}
      <section id="bento-grid" className="dt-section">
        <div className="dt-section-top">
          <div className="dt-section-title-group">
            <span className="v-chip">
              <span className="v-chip-dot blue" />
              <span>VOICE ARCHITECTURE</span>
            </span>
            <h2 className="dt-section-h2">Engineered for Natural Spoken Interaction</h2>
          </div>
        </div>

        <div className="dt-bento-3col">
          {/* Card 1 (Interruption & Barge-in): Vertical list of status rows */}
          <div className="dt-card dt-bento-card">
            <div className="dt-bento-card-top">
              <span className="dt-bento-card-kicker">BARGE-IN & ACTIVE LISTENING</span>
              <span className="v-chip">
                <span className="v-chip-dot pass" />
                <span>100% PASS</span>
              </span>
            </div>

            <h3 className="dt-bento-card-title">Zero-Latency Interruption Handling</h3>
            <p className="dt-bento-card-sub">
              Natural human speech requires fluid interruptions. Bol halts audio playback the millisecond the caller speaks—eliminating awkward voice collisions.
            </p>

            <div className="dt-regression-rows">
              <div className="dt-regression-row">
                <span className="dt-reg-name">vad.interrupt_detection</span>
                <span className="v-chip">
                  <span className="v-chip-dot pass" />
                  <span>PASS</span>
                </span>
                <span className="dt-reg-pct positive">-12.4ms</span>
              </div>

              <div className="dt-regression-row">
                <span className="dt-reg-name">audio.playback_halt</span>
                <span className="v-chip">
                  <span className="v-chip-dot pass" />
                  <span>PASS</span>
                </span>
                <span className="dt-reg-pct positive">0.00ms</span>
              </div>

              <div className="dt-regression-row">
                <span className="dt-reg-name">context.interruption_recovery</span>
                <span className="v-chip">
                  <span className="v-chip-dot pass" />
                  <span>PASS</span>
                </span>
                <span className="dt-reg-pct positive">100%</span>
              </div>

              <div className="dt-regression-row">
                <span className="dt-reg-name">stream.buffer_underrun</span>
                <span className="v-chip">
                  <span className="v-chip-dot pass" />
                  <span>PASS</span>
                </span>
                <span className="dt-reg-pct positive">0.00%</span>
              </div>
            </div>
          </div>

          {/* Card 2 (Knowledge Grounding): Stacked horizontal bar charts for accuracy metrics */}
          <div className="dt-card dt-bento-card">
            <div className="dt-bento-card-top">
              <span className="dt-bento-card-kicker">KNOWLEDGE GROUNDING</span>
              <span className="v-chip">
                <span className="v-chip-dot pass" />
                <span>STRICT GROUNDING</span>
              </span>
            </div>

            <h3 className="dt-bento-card-title">Deterministic Domain Accuracy</h3>
            <p className="dt-bento-card-sub">
              Zero hallucinated policies or rates. Bol anchors your agent directly in your verified documentation, menus, and URLs with strict guardrail enforcement.
            </p>

            <div className="dt-barchart-stack">
              <div className="dt-bar-group">
                <div className="dt-bar-info">
                  <span>knowledge.document_precision</span>
                  <code>99.8%</code>
                </div>
                <div className="dt-bar-rail">
                  <div className="dt-bar-val active" style={{ width: "99.8%" }} />
                </div>
              </div>

              <div className="dt-bar-group">
                <div className="dt-bar-info">
                  <span>guardrails.unsupported_claim_block</span>
                  <code>100%</code>
                </div>
                <div className="dt-bar-rail">
                  <div className="dt-bar-val green" style={{ width: "100%" }} />
                </div>
              </div>

              <div className="dt-bar-group">
                <div className="dt-bar-info">
                  <span>citations.source_attribution</span>
                  <code>94.2%</code>
                </div>
                <div className="dt-bar-rail">
                  <div className="dt-bar-val neutral" style={{ width: "94.2%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 (Conversational Builder): Code-diff view */}
          <div className="dt-card dt-bento-card">
            <div className="dt-bento-card-top">
              <span className="dt-bento-card-kicker">CONVERSATIONAL BUILDER</span>
              <span className="v-chip">
                <span className="v-chip-dot blue" />
                <span>ZERO CODE</span>
              </span>
            </div>

            <h3 className="dt-bento-card-title">Designed Through Natural Conversation</h3>
            <p className="dt-bento-card-sub">
              No prompt engineering, flow diagrams, or technical configuration. Bol guides you through a focused interview to capture role, tone, greeting, and guardrails.
            </p>

            <div className="dt-diff-container">
              <div className="dt-diff-row normal">
                <span className="dt-diff-line-no">18</span>
                <code>- &quot;persona&quot;: &quot;rigid rule-based automated attendant&quot;</code>
              </div>

              <div className="dt-diff-row added">
                <span className="dt-diff-line-no">19</span>
                <code>+ &quot;persona&quot;: &quot;warm, attentive concierge with natural pacing&quot;</code>
              </div>

              <div className="dt-diff-row modified">
                <span className="dt-diff-line-no">20</span>
                <code>~ &quot;barge_in&quot;: true /* instant audio halt */</code>
              </div>

              <div className="dt-diff-row normal">
                <span className="dt-diff-line-no">21</span>
                <code>  &quot;ground_rules&quot;: &quot;answer from verified documents only&quot;</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          METRICS GRID: 4-column border-connected grid
          ==================================================================== */}
      <section id="metrics-grid" className="dt-section">
        <div className="dt-card dt-metrics-card">
          <div className="dt-metrics-4col">
            {/* Cell 1 */}
            <div className="dt-metrics-cell">
              <span className="dt-metrics-kicker">FIRST AUDIO SPAN</span>
              <div className="dt-metrics-num-row">
                <span className="dt-metric-large-number">240</span>
                <span className="dt-metric-unit-text">MS</span>
              </div>
              <p className="dt-metrics-desc">
                Sub-second glass-to-glass turnaround from caller speech to synthesized voice response.
              </p>
            </div>

            {/* Cell 2 */}
            <div className="dt-metrics-cell">
              <span className="dt-metrics-kicker">CREATION TIME</span>
              <div className="dt-metrics-num-row">
                <span className="dt-metric-large-number">&lt; 3</span>
                <span className="dt-metric-unit-text">MIN</span>
              </div>
              <p className="dt-metrics-desc">
                From your initial chat prompt to a fully configured, grounded, and testable voice assistant.
              </p>
            </div>

            {/* Cell 3 */}
            <div className="dt-metrics-cell">
              <span className="dt-metrics-kicker">FACTUAL PRECISION</span>
              <div className="dt-metrics-num-row">
                <span className="dt-metric-large-number">99.9</span>
                <span className="dt-metric-unit-text">%</span>
              </div>
              <p className="dt-metrics-desc">
                Rigorous instruction boundaries and source grounding ensure zero unverified claims.
              </p>
            </div>

            {/* Cell 4 */}
            <div className="dt-metrics-cell">
              <span className="dt-metrics-kicker">BARGE-IN CUTOFF</span>
              <div className="dt-metrics-num-row">
                <span className="dt-metric-large-number">&lt; 35</span>
                <span className="dt-metric-unit-text">MS</span>
              </div>
              <p className="dt-metrics-desc">
                Instant speech activity cutoff halts audio playback the millisecond the caller interrupts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer className="dt-footer">
        <div className="dt-footer-main">
          <div className="dt-footer-col">
            <div className="flex items-center gap-2.5 mb-2">
              <img src="/LOGO.png" alt="Bol Logo" width="24" height="24" className="w-6 h-6 object-contain rounded-sm" />
              <span className="dt-brand-title">BOL</span>
            </div>
            <p className="dt-footer-desc">
              The local-first conversational voice agent platform. Build, customize, and run hands-free voice agents with natural turn-taking and zero code.
            </p>
          </div>

          <div className="dt-footer-actions">
            <Link href="/auth" className="btn-square dt-cta-large">
              <span>Create Your Agent</span>
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="dt-footer-bar">
          <span>&copy; {new Date().getFullYear()} BOL TECHNOLOGIES. ALL RIGHTS RESERVED.</span>
          <span>LOCAL-FIRST VOICE AGENT RUNTIME · ZERO-CODE CREATION</span>
        </div>
      </footer>
    </div>
  );
}
