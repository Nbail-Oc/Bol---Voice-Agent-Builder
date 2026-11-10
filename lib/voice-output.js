export async function selectVoiceOutput(client, audioElement, deviceId) {
  const speakers = await client.getAllSpeakers();
  const speaker = speakers.find((device) => device.deviceId === deviceId);
  if (!speaker) throw new Error("That speaker is no longer available. Refresh the device list and try again.");

  if (typeof audioElement.setSinkId !== "function" && deviceId !== "default") {
    throw new Error("This browser cannot route audio to a selected speaker. Use the system default output instead.");
  }
  if (audioElement.setSinkId) await audioElement.setSinkId(deviceId);
  client.updateSpeaker(deviceId);
  return speaker;
}
