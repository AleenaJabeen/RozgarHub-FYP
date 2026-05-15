import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── Async Thunks ────────────────────────────────────────────────────────────

// 1. Submit a Review
export const submitReview = createAsyncThunk(
  "reviews/submitReview",
  async ({ orderId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/reviews", 
        { orderId, rating, comment },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit review.");
    }
  }
);

// 2. Fetch Reviews for a Specific Gig
export const getGigReviews = createAsyncThunk(
  "reviews/getGigReviews",
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/reviews/gig/${gigId}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch gig reviews.");
    }
  }
);

// ✅ 3. Fetch ALL Reviews for a Service Provider Profile
export const getProviderReviews = createAsyncThunk(
  "reviews/getProviderReviews",
  async (providerId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/reviews/provider/${providerId}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch provider reviews.");
    }
  }
);

// ─── Slice Configuration ─────────────────────────────────────────────────────
const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviewsList: [],           // Used on the Gig Details page
    providerReviewsList: [],   // ✅ Used on the Provider Profile page
    loading: false,
    error: null,
  },
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
    clearProviderReviews: (state) => {
      state.providerReviewsList = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // ── Submit Review ──
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviewsList.unshift(action.payload);
        state.providerReviewsList.unshift(action.payload); // Keep both lists updated
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ── Get Gig Reviews ──
      .addCase(getGigReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGigReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviewsList = action.payload;
      })
      .addCase(getGigReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Get Provider Reviews ──
      .addCase(getProviderReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProviderReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.providerReviewsList = action.payload; // ✅ Save profile reviews here
      })
      .addCase(getProviderReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviewError, clearProviderReviews } = reviewSlice.actions;
export default reviewSlice.reducer;