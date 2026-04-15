import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHCPs, selectHCP, seedHCPs } from "../store/slices/hcpSlice";
import { updateFormDraft } from "../store/slices/interactionSlice";

const styles = {
  container: { position: "relative", marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "Inter, sans-serif",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    zIndex: 100,
    maxHeight: 220,
    overflowY: "auto",
  },
  dropdownItem: {
    padding: "10px 14px",
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6",
    transition: "background 0.15s",
  },
  hcpName: { fontWeight: 600, fontSize: 14, color: "#111827" },
  hcpMeta: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  badge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    marginLeft: 6,
  },
  selectedCard: {
    padding: "10px 14px",
    background: "#eff6ff",
    border: "1.5px solid #3b82f6",
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    fontSize: 18,
    lineHeight: 1,
  },
  seedBtn: {
    marginTop: 8,
    fontSize: 12,
    color: "#3b82f6",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
    fontFamily: "Inter, sans-serif",
  },
};

const tierColors = {
  A: { background: "#dcfce7", color: "#166534" },
  B: { background: "#fef9c3", color: "#854d0e" },
  C: { background: "#fee2e2", color: "#991b1b" },
};

export default function HCPSearch() {
  const dispatch = useDispatch();
  const { list: hcps, selectedHCP, loading } = useSelector((s) => s.hcp);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchHCPs());
  }, [dispatch]);

  useEffect(() => {
    if (query.length >= 1) {
      dispatch(fetchHCPs(query));
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [query, dispatch]);

  const handleSelect = (hcp) => {
    dispatch(selectHCP(hcp));
    dispatch(updateFormDraft({ hcp_id: hcp.id }));
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    dispatch(selectHCP(null));
    dispatch(updateFormDraft({ hcp_id: null }));
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>Healthcare Professional (HCP) *</label>
      {selectedHCP ? (
        <div style={styles.selectedCard}>
          <div>
            <span style={styles.hcpName}>{selectedHCP.name}</span>
            <span
              style={{
                ...styles.badge,
                ...(tierColors[selectedHCP.tier] || {}),
              }}
            >
              Tier {selectedHCP.tier}
            </span>
            <div style={styles.hcpMeta}>
              {selectedHCP.specialty} · {selectedHCP.hospital}
            </div>
          </div>
          <button style={styles.clearBtn} onClick={handleClear}>
            ×
          </button>
        </div>
      ) : (
        <>
          <input
            style={styles.input}
            placeholder="Search by name, hospital, email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
          />
          {open && hcps.length > 0 && (
            <div style={styles.dropdown}>
              {hcps.map((hcp) => (
                <div
                  key={hcp.id}
                  style={styles.dropdownItem}
                  onMouseDown={() => handleSelect(hcp)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div style={styles.hcpName}>
                    {hcp.name}
                    <span
                      style={{
                        ...styles.badge,
                        ...(tierColors[hcp.tier] || {}),
                      }}
                    >
                      Tier {hcp.tier}
                    </span>
                  </div>
                  <div style={styles.hcpMeta}>
                    {hcp.specialty} · {hcp.hospital} · {hcp.territory}
                  </div>
                </div>
              ))}
            </div>
          )}
          {hcps.length === 0 && (
            <button
              style={styles.seedBtn}
              onClick={() => dispatch(seedHCPs()).then(() => dispatch(fetchHCPs()))}
            >
              No HCPs found — click to seed sample data
            </button>
          )}
        </>
      )}
    </div>
  );
}