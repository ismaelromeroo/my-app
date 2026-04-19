"use client";
import { useState } from "react";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit() {
    if (!userInput) return;
    setLoading(true);

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");

    // Add empty assistant message that we'll fill in as chunks arrive
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setLoading(false);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: updated[updated.length - 1].content + chunk,
        };
        return updated;
      });
    }
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
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <strong>{msg.role === "user" ? "You" : "Claude"}:</strong> {msg.content}
          </div>
        ))}
        {loading && <p>Thinking...</p>}
      </div>
    </main>
  );
}