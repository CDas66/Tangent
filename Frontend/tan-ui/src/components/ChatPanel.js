import React, { useState, useRef, useEffect } from "react";
import "./ChatPanel.css";

function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const chatEndRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedText]);

  // Real-time streamed typing from Flask + Ollama
  const streamMessage = async (prompt) => {
    const userMsg = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setDisplayedText("");

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setDisplayedText(fullText); 
      }

      setMessages((prev) => [...prev, { role: "tangent", text: fullText }]);
    } catch (err) {
      console.error("Streaming error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "tangent", text: "⚠️ Streaming failed. Check backend." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    streamMessage(input.trim());
  };

  return (
    <div className="chat-panel">
      <div className="chat-log">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <span>{msg.text}</span>
          </div>
        ))}

        {isTyping && (
          <div className="message tangent typing">
            <span>{displayedText || "Tangent is typing..."}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="input-bar">
        <input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}

export default ChatPanel;
