import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ── Async Thunks ──────────────────────────────────────────────
export const fetchInteractions = createAsyncThunk(
  "interactions/fetchAll",
  async (hcpId, { rejectWithValue }) => {
    try {
      const params = hcpId ? { hcp_id: hcpId } : {};
      const res = await api.get("/interactions/", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const createInteraction = createAsyncThunk(
  "interactions/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/interactions/", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const updateInteraction = createAsyncThunk(
  "interactions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/interactions/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  "interactions/chat",
  async ({ messages, hcpId }, { rejectWithValue }) => {
    try {
      const res = await api.post("/interactions/chat", {
        messages,
        hcp_id: hcpId,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────
const interactionSlice = createSlice({
  name: "interactions",
  initialState: {
    list: [],
    loading: false,
    error: null,
    chatMessages: [],
    chatLoading: false,
    lastActionTaken: null,
    activeMode: "form", // "form" | "chat"
    formDraft: {
      hcp_id: null,
      interaction_type: "visit",
      date: new Date().toISOString().slice(0, 16),
      duration_minutes: "",
      location: "",
      products_discussed: "",
      notes: "",
      status: "draft",
    },
  },
  reducers: {
    setActiveMode: (state, action) => {
      state.activeMode = action.payload;
    },
    updateFormDraft: (state, action) => {
      state.formDraft = { ...state.formDraft, ...action.payload };
    },
    resetFormDraft: (state) => {
      state.formDraft = {
        hcp_id: null,
        interaction_type: "visit",
        date: new Date().toISOString().slice(0, 16),
        duration_minutes: "",
        location: "",
        products_discussed: "",
        notes: "",
        status: "draft",
      };
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    clearChatMessages: (state) => {
      state.chatMessages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchInteractions
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // createInteraction
    builder
      .addCase(createInteraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // updateInteraction
    builder.addCase(updateInteraction.fulfilled, (state, action) => {
      const idx = state.list.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    });

    // sendChatMessage
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.chatLoading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.chatLoading = false;
        state.chatMessages.push({
          role: "assistant",
          content: action.payload.reply,
        });
        state.lastActionTaken = action.payload.action_taken;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.chatLoading = false;
        state.chatMessages.push({
          role: "assistant",
          content: `Error: ${action.payload}`,
        });
      });
  },
});

export const {
  setActiveMode,
  updateFormDraft,
  resetFormDraft,
  addChatMessage,
  clearChatMessages,
  clearError,
} = interactionSlice.actions;

export default interactionSlice.reducer;