import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: message }],
    });

    return Response.json({ reply: response.content[0].text });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}