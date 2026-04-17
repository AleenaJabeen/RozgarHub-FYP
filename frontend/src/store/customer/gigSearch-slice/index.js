import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/gigs";

// 1. Search Thunk (Now includes day & time filters!)
export const searchPublicGigs = createAsyncThunk(
  "gigSearch/searchPublic",
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.status) params.append("status", filters.status);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.day) params.append("day", filters.day);       // ✅ Added
      if (filters.time) params.append("time", filters.time);    // ✅ Added

      const response = await axios.get(`${BASE_URL}/search?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to search gigs");
    }
  }
);

// 2. Get Single Gig Thunk (For the Details Page)
export const getPublicGigById = createAsyncThunk(
  "gigSearch/getPublicGigById",
  async (gigId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/${gigId}`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch gig");
    }
  }
);

const gigSearchSlice = createSlice({
  name: "gigSearch",
  initialState: {
    gigs: [],
    activeGig: null, // ✅ Added to hold the single gig for the details page
    loading: false,
    error: null,
  },
  reducers: {
    clearSearch: (state) => {
      state.gigs = [];
      state.error = null;
    },
    clearActiveGig: (state) => {
      state.activeGig = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // ── Search Cases ──
      .addCase(searchPublicGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPublicGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs = action.payload.gigs || action.payload;
      })
      .addCase(searchPublicGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ── Single Gig Cases ──
      .addCase(getPublicGigById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicGigById.fulfilled, (state, action) => {
        state.loading = false;
        state.activeGig = action.payload.data; // ✅ Saves the fetched gig
      })
      .addCase(getPublicGigById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearch, clearActiveGig } = gigSearchSlice.actions;
export default gigSearchSlice.reducer;