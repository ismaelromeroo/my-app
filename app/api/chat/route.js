import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      system: `You are a medical term explainer. When the 
      user gives you a medical term or condition, explain it 
      simply — like you're talking to regular person. 
      Use everyday comparisons and plain language. Never use 
      medical jargon without immediately explaining it in 
      simple terms. Be warm and clear. keep responses short
      and concise/brief 1-2 sentences`,
      messages: messages,
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