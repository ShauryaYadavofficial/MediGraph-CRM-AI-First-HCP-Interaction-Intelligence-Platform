import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchHCPs = createAsyncThunk(
  "hcp/fetchAll",
  async (search, { rejectWithValue }) => {
    try {
      const params = search ? { search } : {};
      const res = await api.get("/hcp/", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const seedHCPs = createAsyncThunk("hcp/seed", async () => {
  const res = await api.post("/hcp/seed");
  return res.data;
});

const hcpSlice = createSlice({
  name: "hcp",
  initialState: {
    list: [],
    selectedHCP: null,
    loading: false,
    error: null,
  },
  reducers: {
    selectHCP: (state, action) => {
      state.selectedHCP = action.payload;
    },
    clearSelectedHCP: (state) => {
      state.selectedHCP = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHCPs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHCPs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchHCPs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(seedHCPs.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { selectHCP, clearSelectedHCP } = hcpSlice.actions;
export default hcpSlice.reducer;