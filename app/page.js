"use client";
import { useState } from "react";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!userInput) return;
    setLoading(true);
    setResponse("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput }),
    });

    const data = await res.json();
    setResponse(data.reply);
    setLoading(false);
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Claude Chatbot</h1>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Ask Claude something..."
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />
      <button onClick={handleSubmit} style={{ padding: "0.5rem 1rem" }}>
        Send
      </button>
      <div style={{ marginTop: "1.5rem" }}>
        {loading ? <p>Thinking...</p> : <p>{response}</p>}
      </div>
    </main>
  );
}