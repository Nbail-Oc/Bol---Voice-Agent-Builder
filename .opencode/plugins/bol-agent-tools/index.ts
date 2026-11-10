import { Plugin } from "@opencode/plugin";

export default Plugin.define({
  id: "bol-agent-tools",
  async setup(ctx) {
    await ctx.tool.transform((editor) => editor.add({
      name: "save_agent_draft",
      description: "Validate and save a voice-agent draft in this Bol chat. This does not create an agent.",
      input: {
        type: "object", additionalProperties: false,
        properties: {
          config: {
            type: "object", additionalProperties: false,
            description: "Complete structured Bol browser voice-agent draft. Use empty arrays or strings only for optional fields.",
            properties: {
              name:{type:"string"},purpose:{type:"string"},goal:{type:"string"},audience:{type:"string"},
              tasks:{type:"array",items:{type:"string"}},language:{type:"string",description:"Gnani/Pipecat locale, e.g. en-IN or hi-IN."},
              greeting:{type:"string"},voice:{type:"string",description:"Gnani timbre-v2.5 voice, e.g. Nalini."},personality:{type:"string",description:"Tone, pacing, and preferred answer detail, e.g. calm and concise or motivating with useful context."},
              conversationFlow:{type:"array",items:{type:"string"}},groundRules:{type:"array",items:{type:"string"}},boundaries:{type:"array",items:{type:"string"}},
              fallback:{type:"string"},escalation:{type:"string"},knowledgeText:{type:"string"},
              sources:{type:"array",items:{type:"object",additionalProperties:false,properties:{title:{type:"string"},url:{type:"string"}},required:["title","url"]}},
            },
          },
        }, required: ["config"],
      },
      options: { codemode: false },
      async execute(input, context) {
        const response = await fetch(`${process.env.BOL_APP_URL || "http://127.0.0.1:3000"}/api/agent-drafts`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opencodeSessionId: context.sessionID, config: input.config }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Bol could not save this draft.");
        return { content: `Draft ready for review (id: ${result.draft.id}). Nothing has been created yet.` };
      },
    }));
  },
});
