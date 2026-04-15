import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateFormDraft,
  resetFormDraft,
  createInteraction,
} from "../store/slices/interactionSlice";
import HCPSearch from "./HCPSearch";

const styles = {
  form: { display: "flex", flexDirection: "column", gap: 16 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column" },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    padding: "10px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    fontFamily: "Inter, sans-serif",
    transition: "border-color 0.2s",
  },
  select: {
    padding: "10px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    fontFamily: "Inter, sans-serif",
    background: "#fff",
    cursor: "pointer",
  },
  textarea: {
    padding: "10px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    fontFamily: "Inter, sans-serif",
    resize: "vertical",
    minHeight: 100,
  },
  actions: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 },
  btnPrimary: {
    padding: "10px 24px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
    transition: "background 0.2s",
  },
  btnSecondary: {
    padding: "10px 24px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },
  successBanner: {
    padding: "12px 16px",
    background: "#dcfce7",
    border: "1px solid #86efac",
    borderRadius: 8,
    color: "#166534",
    fontSize: 14,
    fontWeight: 500,
  },
  errorBanner: {
    padding: "12px 16px",
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: 8,
    color: "#991b1b",
    fontSize: 14,
  },
};

const INTERACTION_TYPES = [
  { value: "visit", label: "In-Person Visit" },
  { value: "call", label: "Phone Call" },
  { value: "email", label: "Email" },
  { value: "conference", label: "Conference" },
  { value: "webinar", label: "Webinar" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Completed" },
  { value: "follow_up_required", label: "Follow-up Required" },
];

const PRODUCTS = [
  "Cardivex 10mg",
  "Gluconorm XR",
  "Pulmoclear Inhaler",
  "Nephroguard 500mg",
  "Oncosafe IV",
];

export default function StructuredForm() {
  const dispatch = useDispatch();
  const { formDraft, loading, error } = useSelector((s) => s.interactions);
  const [success, setSuccess] = React.useState(false);

  const handleChange = (e) => {
    dispatch(updateFormDraft({ [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formDraft.hcp_id) {
      alert("Please select an HCP first.");
      return;
    }
    const payload = {
      ...formDraft,
      duration_minutes: formDraft.duration_minutes
        ? parseInt(formDraft.duration_minutes)
        : null,
    };
    const result = await dispatch(createInteraction(payload));
    if (!result.error) {
      setSuccess(true);
      dispatch(resetFormDraft());
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <HCPSearch />

      {success && (
        <div style={styles.successBanner}>
          ✅ Interaction logged successfully!
        </div>
      )}
      {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

      <div style={styles.row}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Interaction Type *</label>
          <select
            style={styles.select}
            name="interaction_type"
            value={formDraft.interaction_type}
            onChange={handleChange}
            required
          >
            {INTERACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Date & Time *</label>
          <input
            style={styles.input}
            type="datetime-local"
            name="date"
            value={formDraft.date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Location</label>
          <input
            style={styles.input}
            type="text"
            name="location"
            placeholder="e.g. Hospital Cabin, Clinic..."
            value={formDraft.location}
            onChange={handleChange}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Duration (minutes)</label>
          <input
            style={styles.input}
            type="number"
            name="duration_minutes"
            placeholder="e.g. 30"
            min="1"
            value={formDraft.duration_minutes}
            onChange={handleChange}
          />
        </div>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Products Discussed</label>
        <select
          style={styles.select}
          name="products_discussed"
          value={formDraft.products_discussed}
          onChange={handleChange}
        >
          <option value="">Select a product...</option>
          {PRODUCTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Interaction Notes *</label>
        <textarea
          style={styles.textarea}
          name="notes"
          placeholder="Describe the interaction in detail: what was discussed, HCP's response, objections, agreements..."
          value={formDraft.notes}
          onChange={handleChange}
          required
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Status</label>
        <select
          style={styles.select}
          name="status"
          value={formDraft.status}
          onChange={handleChange}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.btnSecondary}
          onClick={() => dispatch(resetFormDraft())}
        >
          Reset
        </button>
        <button
          type="submit"
          style={styles.btnPrimary}
          disabled={loading}
          onMouseEnter={(e) =>
            !loading && (e.currentTarget.style.background = "#1d4ed8")
          }
          onMouseLeave={(e) =>
            !loading && (e.currentTarget.style.background = "#2563eb")
          }
        >
          {loading ? "Saving..." : "Log Interaction"}
        </button>
      </div>
    </form>
  );
}