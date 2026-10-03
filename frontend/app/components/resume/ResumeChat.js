"use client";

import { useState } from "react";

export default function ResumeChat() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I can help you understand your resume, improve your experience descriptions, and prepare for your target role.",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      text: message,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
      {
        role: "assistant",
        text: "This is the local AI chat interface. Connect this action to your FastAPI + Ollama endpoint to generate the real response.",
      },
    ]);

    setMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((item, index) => (
          <div key={index} className={`chat-message ${item.role}`}>
            <div className="message-avatar">
              {item.role === "assistant" ? "✦" : "VS"}
            </div>

            <div className="message-content">{item.text}</div>
          </div>
        ))}
      </div>

      <div className="chat-input-wrapper">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Ask something about your resume..."
        />

        <button onClick={sendMessage}>↑</button>
      </div>
    </div>
  );
}
