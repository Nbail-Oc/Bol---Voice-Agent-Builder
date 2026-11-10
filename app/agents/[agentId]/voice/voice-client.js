"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";
import { selectVoiceOutput } from "../../../../lib/voice-output.js";

const MAX_ROWS = 150;
const stamp = () => new Date().toLocaleTimeString([], { hour12: false });

export default function VoiceClient({ agent }) {
  const [phase, setPhase] = useState("idle");
  const [transcript, setTranscript] = useState([]);
  const [events, setEvents] = useState([]);
  const [runtimeLogs, setRuntimeLogs] = useState("");
  const [partial, setPartial] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const [botLevel, setBotLevel] = useState(0);
  const [mics, setMics] = useState([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [speakers, setSpeakers] = useState([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState("default");
  const [interactionType, setInteractionType] = useState(agent.interactionType || "agent_first");
  const [outputError, setOutputError] = useState("");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [audioAttached, setAudioAttached] = useState(false);
  const clientRef = useRef(null);
  const audioRef = useRef(null);
  const selectedSpeakerRef = useRef("default");
  const attemptRef = useRef(0);
  const transcriptEndRef = useRef(null);
  const eventsEndRef = useRef(null);
  const lastUserInputRef = useRef("");
  const loggedBotSegmentsRef = useRef(new Set());

  const log = useCallback((message, kind = "info") => {
    setEvents((rows) => [...rows, { id: crypto.randomUUID(), time: stamp(), message, kind }].slice(-MAX_ROWS));
  }, []);

  const clearBotAudio = useCallback(() => {
    if (audioRef.current) audioRef.current.srcObject = null;
    setAudioAttached(false);
  }, []);

  const attachBotAudio = useCallback(async (track) => {
    if (track.kind !== "audio" || !audioRef.current) return;
    const audio = audioRef.current;
    audio.srcObject = new MediaStream([track]);
    try {
      if (selectedSpeakerRef.current !== "default" && !audio.setSinkId) {
        throw new Error("This browser cannot route audio to a selected speaker. Use the system default output instead.");
      }
      if (audio.setSinkId) await audio.setSinkId(selectedSpeakerRef.current);
      await audio.play();
      setAudioAttached(true);
      log("Bot audio track is playing through the selected speaker.", "success");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Browser could not play bot audio.";
      setOutputError(message);
      log(`Speaker output: ${message}`, "error");
    }
  }, [log]);

  async function start() {
    if (!agent || ["requesting", "starting", "connecting", "listening", "thinking", "speaking"].includes(phase)) return;
    const attempt = ++attemptRef.current;
    setError("");
    setTranscript([]);
    setEvents([]);
    setRuntimeLogs("");
    lastUserInputRef.current = "";
    loggedBotSegmentsRef.current.clear();
    setPhase("requesting");
    log("Requesting microphone and starting the voice runtime.");

    try {
      setOutputError("");

      const pc = new PipecatClient({
        transport: new SmallWebRTCTransport(),
        enableMic: true,
        enableCam: false,
        callbacks: {
          onConnected: () => log("WebRTC connected.", "success"),
          onDisconnected: () => log("WebRTC disconnected."),
          onTransportStateChanged: (state) => {
            log(`Transport: ${state}`, state === "error" ? "error" : "info");
            if (state === "error") setPhase("error");
            else if (state === "connected" || state === "ready") setPhase((p) => p === "speaking" ? p : "listening");
          },
          onDeviceError: (deviceError) => {
            const message = deviceError.message || "Could not access the microphone.";
            setError(message);
            log(`Microphone: ${message}`, "error");
            setPhase("error");
          },
          onAvailableMicsUpdated: (devices) => setMics(devices || []),
          onMicUpdated: (device) => setSelectedMic(device?.deviceId || ""),
          onAvailableSpeakersUpdated: (devices) => setSpeakers(devices || []),
          onSpeakerUpdated: (device) => {
            const deviceId = device?.deviceId || "default";
            selectedSpeakerRef.current = deviceId;
            setSelectedSpeaker(deviceId);
          },
          onTrackStarted: (track, participant) => {
            const localAudioId = pc.tracks().local.audio?.id;
            if (!participant?.local && track.id !== localAudioId) void attachBotAudio(track);
          },
          onTrackStopped: (track, participant) => {
            if (!participant?.local && track.id !== pc.tracks().local.audio?.id) {
              clearBotAudio();
              setBotLevel(0);
              log("Bot audio track ended.");
            }
          },
          onLocalAudioLevel: setMicLevel,
          onRemoteAudioLevel: setBotLevel,
          onUserStartedSpeaking: () => setPhase("listening"),
          onUserStoppedSpeaking: () => setPhase((p) => p === "listening" ? "thinking" : p),
          onUserInput: (data) => {
            if (!data?.text) return;
            if (!data.final) {
              setPartial(data.text);
              return;
            }
            setPartial("");
            const identity = data.timestamp || data.msg_id ? `${data.timestamp || data.msg_id}:${data.text.trim()}` : `${Date.now()}:${data.text.trim()}`;
            if (identity === lastUserInputRef.current) return;
            lastUserInputRef.current = identity;
            const id = `user:${identity}`;
            setTranscript((rows) => [...rows, { id, role: "You", text: data.text.trim(), final: true }].slice(-MAX_ROWS));
            log(`Caller: ${data.text.trim()}`, "user");
          },
          onBotOutput: (data) => {
            if (!data?.text || data.will_be_spoken === false) return;
            const id = data.segment_id == null ? `bot:${crypto.randomUUID()}` : `bot:${data.segment_id}`;
            const text = data.spoken_progress?.accumulated_text || data.text;
            setTranscript((rows) => {
              const index = rows.findIndex((row) => row.id === id);
              if (index < 0) return [...rows, { id, role: agent.name, text, final: data.spoken_status === "completed" }].slice(-MAX_ROWS);
              const updated = [...rows];
              updated[index] = { ...updated[index], text, final: data.spoken_status === "completed" };
              return updated;
            });
            if (!loggedBotSegmentsRef.current.has(id)) {
              loggedBotSegmentsRef.current.add(id);
              log(`Agent: ${text}`, "bot");
            }
          },
          onBotLlmStarted: () => { setPhase("thinking"); log("Agent is preparing a response."); },
          onBotLlmStopped: () => log("Response generated."),
          onBotStartedSpeaking: () => { setPhase("speaking"); log("Agent started speaking.", "bot"); },
          onBotStoppedSpeaking: () => { setPhase("listening"); log("Agent finished speaking."); },
          onBotInterrupted: () => { setPhase("listening"); log("Agent speech interrupted by caller."); },
          onServerMessage: (message) => {
            const type = message?.type || message?.label || "Pipecat event";
            if (!["bot-output", "user-input", "metrics"].includes(type)) log(`Pipecat: ${type}`);
          },
          onMessageError: (message) => log(`Pipecat message error: ${message?.data?.error || "unknown error"}`, "error"),
          onError: (message) => log(`Pipecat error: ${message?.data?.error || message?.type || "unknown error"}`, "error"),
        },
      });
      clientRef.current = pc;

      const micRequest = pc.initDevices().then(() => {
        if (attempt === attemptRef.current) setPhase("starting");
        log("Microphone ready.", "success");
        return true;
      });
      const runtimeRequest = fetch(`/api/agents/${agent.id}/voice-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interactionType }),
      })
        .then(async (response) => {
          const body = await response.json();
          if (!response.ok) throw new Error(body.error || "Could not start the voice runtime.");
          return body;
        });
      const [, runtime] = await Promise.all([micRequest, runtimeRequest]);
      if (attempt !== attemptRef.current) return;

      setPhase("connecting");
      log("Connecting to the agent over WebRTC.");
      await pc.startBotAndConnect({ endpoint: runtime.endpoint, requestData: { transport: "webrtc" } });
      if (attempt === attemptRef.current) {
        setPhase("listening");
        log("Voice session ready. Speak naturally.", "success");
      }
    } catch (e) {
      if (attempt !== attemptRef.current) return;
      const message = e instanceof Error ? e.message : "Could not start this voice session.";
      setError(message);
      setPhase("error");
      log(message, "error");
      await clientRef.current?.disconnect().catch(() => {});
      clientRef.current = null;
      await fetch(`/api/agents/${agent.id}/voice-session`, { method: "DELETE" }).catch(() => {});
      clearBotAudio();
    }
  }

  async function stop() {
    attemptRef.current++;
    await clientRef.current?.disconnect().catch(() => {});
    clientRef.current = null;
    clearBotAudio();
    if (agent) await fetch(`/api/agents/${agent.id}/voice-session`, { method: "DELETE" }).catch(() => {});
    setPhase("idle");
    setMicLevel(0);
    setBotLevel(0);
    setAudioAttached(false);
    setPartial("");
    log("Session ended.");
  }

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript, partial]);
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [events, runtimeLogs]);
  useEffect(() => {
    if (!["starting", "connecting", "listening", "thinking", "speaking"].includes(phase)) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/agents/${agent.id}/voice-session`, { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) setRuntimeLogs(data.logs || "");
        }
      } catch {}
    };
    poll();
    const timer = setInterval(poll, 900);
    return () => { cancelled = true; clearInterval(timer); };
  }, [agent?.id, phase]);
  useEffect(() => () => {
    attemptRef.current++;
    clientRef.current?.disconnect();
    clearBotAudio();
    if (agent) fetch(`/api/agents/${agent.id}/voice-session`, { method: "DELETE" });
  }, [agent?.id, clearBotAudio]);

  function toggleMic() {
    const next = !muted;
    clientRef.current?.enableMic(!next);
    setMuted(next);
    log(next ? "Microphone muted." : "Microphone unmuted.");
  }

  async function changeSpeaker(event) {
    const deviceId = event.target.value;
    const client = clientRef.current;
    if (!client || !audioRef.current) return;
    setOutputError("");
    try {
      const speaker = await selectVoiceOutput(client, audioRef.current, deviceId);
      selectedSpeakerRef.current = deviceId;
      setSelectedSpeaker(deviceId);
      log(`Speaker output changed to ${speaker.label || "selected device"}.`, "success");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not select that speaker.";
      setOutputError(message);
      log(`Speaker output: ${message}`, "error");
    }
  }

  function changeMic(event) {
    const deviceId = event.target.value;
    clientRef.current?.updateMic(deviceId);
    setSelectedMic(deviceId);
    log("Input microphone changed.");
  }

  if (!agent) return <main className="home"><p>Agent not found.</p><Link href="/">Back</Link></main>;
  const active = !["idle", "error"].includes(phase);
  const phaseLabel = ({ idle: "Ready", requesting: "Requesting microphone", starting: "Starting runtime", connecting: "Connecting", listening: "Listening", thinking: "Thinking", speaking: "Speaking", error: "Needs attention" })[phase] || phase;
  const bars = Array.from({ length: 32 }, (_, index) => {
    const level = botLevel;
    const variation = Math.abs(Math.sin(index * 0.78 + Date.now() / 180)) * 0.28;
    return Math.max(4, Math.min(100, 8 + level * 350 + variation * (active ? 22 : 0)));
  });

  return <main className="voice-console">
    <header className="voice-console-head">
      <div><Link href={`/agents/${agent.id}`} className="back-link">← {agent.name}</Link><div className="voice-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><img src="/LOGO.png" alt="Bol" style={{ width: '22px', height: '22px', objectFit: 'contain' }} /><h1>Voice session</h1><span className={`voice-state ${phase}`}>{phaseLabel}</span></div></div>
      <div className="voice-top-actions">
        <select
          aria-label="Interaction mode"
          value={interactionType}
          onChange={(e) => setInteractionType(e.target.value)}
          disabled={active}
          title="Interaction Mode: Agent greets first or User speaks first"
        >
          <option value="agent_first">1. Agent greets first</option>
          <option value="user_first">2. User speaks first</option>
        </select>
        <select aria-label="Microphone input" value={selectedMic} onChange={changeMic} disabled={!mics.length || !active}>
          {mics.length ? mics.map((mic) => <option key={mic.deviceId} value={mic.deviceId}>{mic.label || "Microphone"}</option>) : <option>Microphone appears after connecting</option>}
        </select>
        <select aria-label="Speaker output" value={selectedSpeaker} onChange={changeSpeaker} disabled={!speakers.length || !active}>
          {speakers.length ? speakers.map((speaker) => <option key={speaker.deviceId} value={speaker.deviceId}>{speaker.label || (speaker.deviceId === "default" ? "System default speaker" : "Speaker")}</option>) : <option>Speakers appear after connecting</option>}
        </select>
        {active && <button className={`voice-icon-button ${muted ? "muted" : ""}`} onClick={toggleMic} aria-label={muted ? "Unmute microphone" : "Mute microphone"}>{muted ? "Mic off" : "Mic on"}</button>}
        {active ? <button className="voice-stop" onClick={stop}>End session</button> : <button className="voice-start" onClick={start}>{phase === "error" ? "Try again" : "Start voice session"}</button>}
      </div>
    </header>

    {(error || outputError) && <div className="voice-error-banner" role="alert"><strong>{error ? "Voice session couldn’t start" : "Speaker output needs attention"}</strong><span>{error || outputError}</span></div>}
    <section className="voice-workspace">
      <aside className="console-panel event-panel">
        <div className="console-panel-head"><div><span className="panel-kicker">Diagnostics</span><h2>Logs</h2></div><span className="live-dot">{active ? "LIVE" : "LOCAL"}</span></div>
        <div className="console-log-list" aria-live="polite">
          {events.map((event) => <div className={`console-log ${event.kind}`} key={event.id}><time>{event.time}</time><span>{event.message}</span></div>)}
          {runtimeLogs && runtimeLogs.split(/\r?\n/).filter(Boolean).slice(-100).map((line, index) => <div className="console-log runtime" key={`runtime-${index}`}><time>PY</time><span>{line.replace(/\x1b\[[0-9;]*m/g, "")}</span></div>)}
          {!events.length && !runtimeLogs && <p className="panel-empty">Session events and runtime diagnostics will appear here.</p>}
          <div ref={eventsEndRef}/>
        </div>
      </aside>

      <section className="console-panel conversation-panel">
        <div className="console-panel-head"><div><span className="panel-kicker">Conversation</span><h2>Live transcript</h2></div><span className="transcript-count">{transcript.length} turns</span></div>
        <div className="console-transcript" aria-live="polite">
          {!transcript.length && !partial && <div className="panel-empty transcript-empty">Start a session to see caller speech and the agent’s spoken replies.</div>}
          {transcript.map((row) => <article className={`transcript-row ${row.role === "You" ? "caller" : "agent"}`} key={row.id}><div className="transcript-speaker">{row.role === "You" ? "CALLER · VOICE STREAM" : `${row.role.toUpperCase()} · SPOKEN OUTPUT`}</div><p>{row.text}</p></article>)}
          {partial && <article className="transcript-row caller interim"><div className="transcript-speaker">CALLER · LIVE TRANSCRIPTION</div><p>{partial}<span className="transcript-cursor">▋</span></p></article>}
          <div ref={transcriptEndRef}/>
        </div>
        <div className="transcript-footer"><span className={active ? "live-dot" : "muted-dot"}/>{active ? "Listening for speech" : "Transcript appears when connected"}</div>
      </section>

      <aside className="voice-side-stack">
        <section className="console-panel bot-audio-panel">
          <div className="console-panel-head"><div><span className="panel-kicker">Output</span><h2>Bot audio</h2></div><span className="audio-level-label">{Math.round(botLevel * 100)}%</span></div>
          <audio
            ref={audioRef}
            autoPlay
            playsInline
            className="voice-audio-output"
            aria-label="Agent voice output"
            onPlaying={() => log("Browser audio playback started through the selected output.", "success")}
            onWaiting={() => log("Browser audio is waiting for more voice data.", "error")}
            onStalled={() => log("Browser audio stream stalled while receiving voice data.", "error")}
            onError={(event) => {
              const code = event.currentTarget.error?.code;
              const message = `Browser could not decode or play the bot audio (media error ${code || "unknown"}).`;
              setOutputError(message);
              log(message, "error");
            }}
          />
          <div className="audio-visualizer" role="img" aria-label="Live bot audio level"><div className="audio-bars">{bars.map((height, i) => <i key={i} style={{ height: `${height}%`, opacity: botLevel > 0.008 ? 0.45 + Math.min(botLevel * 3, 0.55) : 0.25 }}/>)}</div><span>{audioAttached ? (speakers.find((speaker) => speaker.deviceId === selectedSpeaker)?.label || "Speaker output connected") : "Waiting for bot audio"}</span></div>
          <div className="audio-output-status"><span className={botLevel > 0.008 ? "level-indicator active" : "level-indicator"}/>{phase === "speaking" ? "Agent speaking" : outputError ? "Output needs attention" : "Audio output ready"}</div>
        </section>
        <section className="console-panel mic-panel">
          <div className="console-panel-head"><div><span className="panel-kicker">Input</span><h2>Microphone</h2></div><span className="audio-level-label">{Math.round(micLevel * 100)}%</span></div>
          <div className="mic-meter" aria-label={`Microphone level ${Math.round(micLevel * 100)} percent`}><i style={{ width: `${Math.max(2, Math.min(100, micLevel * 500))}%` }}/></div>
          <p>{muted ? "Microphone muted" : selectedMic ? (mics.find((mic) => mic.deviceId === selectedMic)?.label || "Microphone connected") : "Waiting for microphone access"}</p>
        </section>
        <section className="console-panel session-info-panel">
          <div className="console-panel-head"><div><span className="panel-kicker">Configuration</span><h2>Agent details</h2></div></div>
          <dl><div><dt>Language</dt><dd>{agent.language}</dd></div><div><dt>Voice</dt><dd>{agent.voice}</dd></div><div><dt>Speech</dt><dd>Neural STT + Timbre-v2.5</dd></div><div><dt>Runtime</dt><dd>Ultra-low Latency 20B</dd></div><div><dt>Transport</dt><dd>Pipecat WebRTC</dd></div></dl>
        </section>
      </aside>
    </section>
  </main>;
}
