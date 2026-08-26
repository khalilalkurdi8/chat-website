"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type ChatMessage = {
  text: string;
  role: "received" | "sent";
};

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState("");

  function getSessionId() {
    if (sessionId) return sessionId;

    const nextSessionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `web-${Date.now()}`;
    setSessionId(nextSessionId);
    return nextSessionId;
  }

  async function notifyN8n(event: "chat_opened" | "chat_message", text?: string) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          source: "site-chat",
          message: text,
          sessionId: getSessionId(),
          page: window.location.href,
        }),
      });

      if (!response.ok) return false;
      const result = (await response.json()) as { reply?: string };
      if (result.reply) {
        setMessages((current) => [...current, { text: result.reply!, role: "received" }]);
      }
      return true;
    } catch {
      return false;
    }
  }

  function openChat() {
    setIsChatOpen(true);
    setIsSending(true);
    void notifyN8n("chat_opened")
      .then((delivered) => {
        if (!delivered) {
          setMessages([
            {
              text: "تعذر الاتصال حالياً. يرجى تفعيل سير عمل n8n ثم المحاولة مرة أخرى.",
              role: "received",
            },
          ]);
        }
      })
      .finally(() => setIsSending(false));

  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = message.trim();
    if (!text || isSending) return;

    setMessage("");
    setMessages((current) => [...current, { text, role: "sent" }]);
    setIsSending(true);
    const delivered = await notifyN8n("chat_message", text);
    if (!delivered) {
      setMessages((current) => [
        ...current,
        {
          text: "تعذر الاتصال حالياً. يرجى تفعيل سير عمل n8n ثم المحاولة مرة أخرى.",
          role: "received",
        },
      ]);
    }
    setIsSending(false);
  }

  return (
    <main className="shell">
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Noma home">
          <span className="brand-mark">✦</span>
          noma
        </a>
        <span className="nav-note">Thoughtful work, made simple.</span>
      </nav>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">A better place to begin</p>
          <h1>
            Make room for <em>what matters.</em>
          </h1>
          <p className="hero-copy">
            A clear, considered approach to moving your next idea forward.
            Have a question? We&apos;re only a message away.
          </p>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="orb" />
          <div className="orbit" />
          <div className="art-card">
            <div className="art-card-top">
              <span>Focus / 01</span>
              <span>Now</span>
            </div>
            <div className="art-line" />
            <div className="art-line short" />
            <div className="art-button" />
          </div>
        </div>
      </section>

      <button className="chat-button" type="button" onClick={openChat}>
        <span className="chat-icon" aria-hidden="true">
          ✦
        </span>
        Chat with us
      </button>

      {isChatOpen ? (
        <section className="chat-panel" role="dialog" aria-label="Chat with us">
          <div className="chat-panel-header">
            <div>
              <strong>Chat with us</strong>
              <span>We usually reply quickly</span>
            </div>
            <button
              className="chat-close"
              type="button"
              aria-label="Close chat"
              onClick={() => setIsChatOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((item, index) => (
              <p className={`chat-message ${item.role}`} key={`${item.text}-${index}`}>
                {item.text}
              </p>
            ))}
            {isSending ? <p className="chat-message received">…</p> : null}
          </div>
          <form className="chat-form" onSubmit={sendMessage}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a message…"
              aria-label="Write a message"
            />
            <button type="submit" aria-label="Send message">
              →
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
