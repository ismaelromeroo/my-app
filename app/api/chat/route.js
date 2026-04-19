import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const stream = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      messages : messages,
      system: `You are a medical term explainer. When the user gives you a medical term or condition, respond ONLY with a JSON object in this exact format, no other text, no markdown, no backticks:
        {"term": "the medical term","simple_explanation": "explanation in plain language","analogy": "an everyday comparison","key_facts": ["fact 1", "fact 2", "fact 3"]}`,
    });

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain" },
    });

  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}