import test from "node:test";
import assert from "node:assert/strict";
import { selectVoiceOutput } from "../lib/voice-output.js";

test("selectVoiceOutput routes playback through the requested available speaker", async () => {
  const calls = [];
  const client = {
    getAllSpeakers: async () => [
      { deviceId: "default", label: "System default" },
      { deviceId: "speaker-2", label: "USB headset" },
    ],
    updateSpeaker: (deviceId) => calls.push(["pipecat", deviceId]),
  };
  const audioElement = { setSinkId: async (deviceId) => calls.push(["audio", deviceId]) };

  const selected = await selectVoiceOutput(client, audioElement, "speaker-2");

  assert.deepEqual(calls, [["audio", "speaker-2"], ["pipecat", "speaker-2"]]);
  assert.equal(selected.label, "USB headset");
});

test("selectVoiceOutput rejects an unavailable speaker without changing routing", async () => {
  const calls = [];
  const client = {
    getAllSpeakers: async () => [{ deviceId: "default", label: "System default" }],
    updateSpeaker: (deviceId) => calls.push(["pipecat", deviceId]),
  };
  const audioElement = { setSinkId: async (deviceId) => calls.push(["audio", deviceId]) };

  await assert.rejects(selectVoiceOutput(client, audioElement, "missing"), /speaker is no longer available/i);
  assert.deepEqual(calls, []);
});


test("selectVoiceOutput reports when a non-default output cannot be routed by the browser", async () => {
  const calls = [];
  const client = {
    getAllSpeakers: async () => [{ deviceId: "speaker-2", label: "USB headset" }],
    updateSpeaker: (deviceId) => calls.push(deviceId),
  };

  await assert.rejects(
    selectVoiceOutput(client, {}, "speaker-2"),
    /browser cannot route audio/i,
  );
  assert.deepEqual(calls, []);
});
