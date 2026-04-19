import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a kind and patient assistant who helps people understand medical terms.

Your explanations should:
- Be written in 1 to 2 short paragraphs
- Use everyday comparisons that anyone can relate to, like comparing the heart to a pump or arteries to garden hoses
- Be warm, calm, and reassuring in tone — never alarming
- Avoid all medical jargon; if a technical word is unavoidable, explain it immediately in plain language
- Feel like advice from a trusted family member who happens to know medicine, not a textbook

The person reading your response may be elderly or unfamiliar with medical language. Write accordingly.`;

async function parseRequestBody(request) {
  const body = await request.json();
  return body.messages;
}

async function streamFromClaude(messages) {
  return client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    stream: true,
    system: SYSTEM_PROMPT,
    messages: messages,
  });
}

function buildStreamingResponse(claudeStream) {
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of claudeStream) {
        const isTextChunk =
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta";

        if (isTextChunk) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(request) {
  try {
    const messages = await parseRequestBody(request);
    const claudeStream = await streamFromClaude(messages);
    return buildStreamingResponse(claudeStream);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
