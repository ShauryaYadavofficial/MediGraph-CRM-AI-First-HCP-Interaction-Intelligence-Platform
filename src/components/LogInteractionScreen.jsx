import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveMode } from "../store/slices/interactionSlice";
import { fetchInteractions } from "../store/slices/interactionSlice";
import StructuredForm from "./StructuredForm";
import ChatInterface from "./ChatInterface";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "Inter, sans-serif",
  },
  topBar: {
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 32,
    height: 32,
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },
  logoSub: { fontSize: 12, color: "#6b7280", marginLeft: 4 },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 13,
    color: "#6b7280",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#1d4ed8",
  },
  mainContent: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "32px 24px",
  },
  pageHeader: { marginBottom: 28 },
  breadcrumb: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 4,
  },
  pageSubtitle: { fontSize: 14, color: "#6b7280" },
  tabBar: {
    display: "flex",
    background: "#f1f5f9",
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
    width: "fit-content",
  },
  tab: (active) => ({
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? "#1e293b" : "#6b7280",
    background: active ? "#fff" : "transparent",
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
    transition: "all 0.2s",
    fontFamily: "Inter, sans-serif",
    display: "flex",
    alignItems: "center",
    gap: 6,
  }),
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 28,
    boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9",
  },
  recentSection: { marginTop: 32 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 16,
  },
  interactionCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "14px 18px",
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    transition: "box-shadow 0.15s",
  },
  interactionLeft: {},
  interactionTitle: { fontSize: 14, fontWeight: 600, color: "#111827" },
  interactionMeta: { fontSize: 12, color: "#6b7280", marginTop: 3 },
  statusBadge: (status) => {
    const colors = {
      completed: { bg: "#dcfce7", text: "#166534" },
      draft: { bg: "#fef9c3", text: "#854d0e" },
      follow_up_required: { bg: "#dbeafe", text: "#1d4ed8" },
    };
    const c = colors[status] || colors.draft;
    return {
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      background: c.bg,
      color: c.text,
    };
  },
  sentimentIcon: { fontSize: 16 },
  emptyList: {
    textAlign: "center",
    color: "#9ca3af",
    padding: "32px 0",
    fontSize: 14,
  },
};

const SENTIMENT_ICONS = {
  positive: "😊",
  neutral: "😐",
  negative: "😟",
};

export default function LogInteractionScreen() {
  const dispatch = useDispatch();
  const { activeMode, list: interactions, loading } = useSelector(
    (s) => s.interactions
  );

  useEffect(() => {
    dispatch(fetchInteractions());
  }, [dispatch]);

  return (
    <div style={styles.page}>
      {/* Top Navigation */}
      <div style={styles.topBar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>H</div>
          <span style={styles.logoText}>
            HCP CRM
            <span style={styles.logoSub}>· Life Sciences</span>
          </span>
        </div>
        <div style={styles.navRight}>
          <span>Field Representative</span>
          <div style={styles.avatar}>FR</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div style={styles.breadcrumb}>
            <span>Dashboard</span>
            <span>›</span>
            <span>HCP Module</span>
            <span>›</span>
            <span style={{ color: "#2563eb" }}>Log Interaction</span>
          </div>
          <h1 style={styles.pageTitle}>Log HCP Interaction</h1>
          <p style={styles.pageSubtitle}>
            Record your interaction using a structured form or chat with the AI
            agent.
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={styles.tabBar}>
          <button
            style={styles.tab(activeMode === "form")}
            onClick={() => dispatch(setActiveMode("form"))}
          >
            📋 Structured Form
          </button>
          <button
            style={styles.tab(activeMode === "chat")}
            onClick={() => dispatch(setActiveMode("chat"))}
          >
            🤖 AI Chat Agent
          </button>
        </div>

        {/* Active Panel */}
        <div style={styles.card}>
          {activeMode === "form" ? <StructuredForm /> : <ChatInterface />}
        </div>

        {/* Recent Interactions */}
        <div style={styles.recentSection}>
          <h2 style={styles.sectionTitle}>
            Recent Interactions{" "}
            <span style={{ color: "#9ca3af", fontWeight: 400 }}>
              ({interactions.length})
            </span>
          </h2>

          {loading ? (
            <div style={styles.emptyList}>Loading interactions...</div>
          ) : interactions.length === 0 ? (
            <div style={styles.emptyList}>
              No interactions yet. Log your first one above!
            </div>
          ) : (
            interactions.slice(0, 8).map((i) => (
              <div
                key={i.id}
                style={styles.interactionCard}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = "none")
                }
              >
                <div style={styles.interactionLeft}>
                  <div style={styles.interactionTitle}>
                    HCP #{i.hcp_id} · {i.interaction_type.toUpperCase()}
                    {i.products_discussed && (
                      <span style={{ color: "#6b7280", fontWeight: 400 }}>
                        {" "}
                        · {i.products_discussed}
                      </span>
                    )}
                  </div>
                  <div style={styles.interactionMeta}>
                    {new Date(i.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {i.location && ` · ${i.location}`}
                    {i.duration_minutes && ` · ${i.duration_minutes} min`}
                  </div>
                  {i.ai_summary && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginTop: 4,
                        fontStyle: "italic",
                      }}
                    >
                      {i.ai_summary.slice(0, 100)}...
                    </div>
                  )}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  {i.sentiment_label && (
                    <span style={styles.sentimentIcon}>
                      {SENTIMENT_ICONS[i.sentiment_label] || ""}
                    </span>
                  )}
                  <span style={styles.statusBadge(i.status)}>
                    {i.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}