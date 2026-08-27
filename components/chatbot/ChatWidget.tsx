"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send } from "lucide-react";
import { askChatbot, type ChatbotAnswer } from "@/lib/chatbot/actions";
import { cn } from "@/lib/utils/cn";

type ChatMessage =
  | { role: "user"; text: string }
  | { role: "bot"; text: string; link?: ChatbotAnswer["link"] };

const STARTER_QUESTIONS = [
  "How long does tanning mousse take to develop?",
  "How much is delivery?",
  "What is your returns policy?",
  "Do you deliver internationally?",
];

const WELCOME: ChatMessage = {
  role: "bot",
  text: "Hi! I can answer questions about our products, delivery, and returns. For order-specific help, use Track Your Order or contact us.",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || sending) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setSending(true);
    const result = await askChatbot({ question: trimmed });
    setMessages((prev) => [...prev, { role: "bot", text: result.answer, link: result.link }]);
    setSending(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      {open ? (
        <div
          role="dialog"
          aria-label="Store assistant"
          className="mb-3 flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-border bg-paper shadow-xl"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div className="flex items-center justify-between border-b border-border bg-ink px-4 py-3 text-on-dark">
            <p className="text-sm font-semibold">La Lunatique Help</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-on-dark/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    m.role === "user" ? "bg-ink text-on-dark" : "bg-cream text-ink",
                  )}
                >
                  <p>{m.text}</p>
                  {m.role === "bot" && m.link ? (
                    <Link href={m.link.href} className="mt-1 inline-block text-xs font-medium text-accent underline">
                      {m.link.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
            {sending ? <p className="text-xs text-muted">Thinking…</p> : null}

            {messages.length === 1 ? (
              <div className="flex flex-col gap-2 pt-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-md border border-border px-3 py-2 text-left text-xs text-ink hover:bg-cream"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <label htmlFor="chat-input" className="sr-only">
              Ask a question
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="h-10 flex-1 rounded-md border border-border bg-paper px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              maxLength={300}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-on-dark disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close store assistant" : "Open store assistant"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-on-dark shadow-lg hover:bg-surface-dark-raised"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
