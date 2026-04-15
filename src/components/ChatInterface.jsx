import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addChatMessage,
  sendChatMessage,
  clearChatMessages,
} from "../store/slices/interactionSlice";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: 500,
    border: "1.5px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
  },
  header: {
    padding: "12px 16px",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22c55e",
  },
  clearBtn: {
    fontSize: 12,
    color: "#6b7280",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  messageBubble: (role) => ({
    maxWidth: "80%",
    alignSelf: role === "user" ? "flex-end" : "flex-start",
    padding: "10px 14px",
    borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    background: role === "user" ? "#2563eb" : "#f1f5f9",
    color: role === "user" ? "#fff" : "#1e293b",
    fontSize: 14,
    lineHeight: 1.5,
  }),
  roleLabel: (role) => ({
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: 500,
    marginBottom: 4,
    alignSelf: role === "user" ? "flex-end" : "flex-start",
  }),
  typingIndicator: {
    alignSelf: "flex-start",
    padding: "10px 14px",
    background: "#f1f5f9",
    borderRadius: "16px 16px 16px 4px",
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  inputRow: {
    padding: "12px 16px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: 10,
    background: "#fff",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: 24,
    fontSize: 14,
    outline: "none",
    fontFamily: "Inter, sans-serif",
  },
  sendBtn: {
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
    transition: "background 0.2s",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    gap: 8,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, textAlign: "center", maxWidth: 280 },
  actionTaken: {
    alignSelf: "center",
    padding: "4px 12px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 999,
    fontSize: 11,
    color: "#2563eb",
    fontWeight: 500,
  },
  suggestionsRow: {
    padding: "8px 16px 0",
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  suggestionBtn: {
    padding: "6px 12px",
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: 999,
    fontSize: 12,
    color: "#374151",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
    transition: "background 0.15s",
  },
};

const SUGGESTIONS = [
  "Log a visit with Dr. Sarah Mitchell today",
  "I just had a 30-min call with HCP ID 2 about Cardivex",
  "Edit interaction 1 — add next steps",
  "Show me Dr. Rajesh Kumar's profile",
  "Schedule a follow-up for interaction 1 next week",
  "Analyze and summarize interaction 1",
];

export default function ChatInterface() {
  const dispatch = useDispatch();
  const { chatMessages, chatLoading, lastActionTaken } = useSelector(
    (s) => s.interactions
  );
  const { selectedHCP } = useSelector((s) => s.hcp);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    // Welcome message
    if (chatMessages.length === 0) {
      dispatch(
        addChatMessage({
          role: "assistant",
          content:
            "👋 Hi! I'm your AI CRM assistant. I can help you log interactions, retrieve HCP profiles, schedule follow-ups, and analyze sentiment.\n\nJust describe your interaction naturally, and I'll handle the rest!",
        })
      );
    }
  }, []);

  const handleSend = () => {
    if (!input.trim() || chatLoading) return;
    const userMsg = { role: "user", content: input.trim() };
    dispatch(addChatMessage(userMsg));
    dispatch(
      sendChatMessage({
        messages: [...chatMessages, userMsg],
        hcpId: selectedHCP?.id || null,
      })
    );
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text) => {
    setInput(text);
  };

  return (
    <div>
      {chatMessages.length <= 1 && (
        <div style={styles.suggestionsRow}>
          {SUGGESTIONS.slice(0, 3).map((s) => (
            <button
              key={s}
              style={styles.suggestionBtn}
              onClick={() => handleSuggestion(s)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e2e8f0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#f1f5f9")
              }
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ ...styles.container, marginTop: 12 }}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <span style={styles.dot} />
            AI Agent
            {selectedHCP && (
              <span style={{ fontWeight: 400, color: "#6b7280", fontSize: 12 }}>
                · Context: {selectedHCP.name}
              </span>
            )}
          </div>
          <button
            style={styles.clearBtn}
            onClick={() => dispatch(clearChatMessages())}
          >
            Clear chat
          </button>
        </div>

        <div style={styles.messages}>
          {chatMessages.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🤖</span>
              <span style={styles.emptyText}>
                Start a conversation to log HCP interactions with AI
              </span>
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <React.Fragment key={idx}>
                {lastActionTaken &&
                  idx === chatMessages.length - 1 &&
                  msg.role === "assistant" && (
                    <div style={styles.actionTaken}>
                      🔧 Tool used: {lastActionTaken.replace(/_/g, " ")}
                    </div>
                  )}
                <div style={styles.roleLabel(msg.role)}>
                  {msg.role === "user" ? "You" : "AI Agent"}
                </div>
                <div style={styles.messageBubble(msg.role)}>
                  {msg.content}
                </div>
              </React.Fragment>
            ))
          )}
          {chatLoading && (
            <div style={styles.typingIndicator}>AI is thinking...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputRow}>
          <input
            style={styles.input}
            placeholder="Describe your HCP interaction..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={chatLoading}
          />
          <button
            style={{
              ...styles.sendBtn,
              opacity: chatLoading ? 0.6 : 1,
            }}
            onClick={handleSend}
            disabled={chatLoading}
          >
            {chatLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}