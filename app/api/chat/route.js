import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const response = await client.messages.create({
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

    return Response.json({ reply: response.content[0].text });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}