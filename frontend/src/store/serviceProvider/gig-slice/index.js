import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/gigs`; // Adjusted based on your gig route

export const createGig = createAsyncThunk(
  "gigs/createGig",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(BASE_URL, formData, {
        withCredentials: true,
        // Axios automatically sets multipart/form-data for FormData objects
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create gig",
      );
    }
  },
);

// UPDATE GIG
export const updateGigThunk = createAsyncThunk(
  "gigs/updateGig",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${BASE_URL}/${id}`, data, {
        withCredentials: true,
        // ⚠️ important for FormData
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.data; // backend returns updated gig
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update gig",
      );
    }
  },
);

export const getMyGigs = createAsyncThunk(
  "gigs/getMyGigs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/provider/my-gigs`, {
        withCredentials: true,
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch gigs",
      );
    }
  },
);

export const getGigById = createAsyncThunk(
  "gigs/getGigById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        withCredentials: true,
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch gig",
      );
    }
  },
);

// DELETE GIG
export const deleteGigThunk = createAsyncThunk(
  "gigs/deleteGig",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`, { withCredentials: true });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// SET Available
export const setGigAvailableThunk = createAsyncThunk(
  "gigs/setAvailable",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/${id}/available`,
        {},
        { withCredentials: true },
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// SET OFFLINE
export const setGigUnavailableThunk = createAsyncThunk(
  "gigs/setUnavailable",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/${id}/unavailable`,
        {},
        { withCredentials: true },
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// AUTO MODE
export const enableAutoModeThunk = createAsyncThunk(
  "gigs/autoMode",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/${id}/mode/auto`,
        {},
        { withCredentials: true },
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const gigSlice = createSlice({
  name: "gigs",
  initialState: {
    gigs: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetGigState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGig.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.gigs.unshift(action.payload.data);
      })
      .addCase(createGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(getMyGigs.pending, (state) => {
        state.loading = true;
      })

      .addCase(getMyGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs = action.payload;
      })

      .addCase(getMyGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getGigById.pending, (state) => {
        state.loading = true;
      })

      .addCase(getGigById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null; // ✅ IMPORTANT FIX

        const existingIndex = state.gigs.findIndex(
          (gig) => gig._id === action.payload._id,
        );

        if (existingIndex !== -1) {
          state.gigs[existingIndex] = action.payload;
        } else {
          state.gigs.push(action.payload);
        }
      })

      .addCase(getGigById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteGigThunk.fulfilled, (state, action) => {
        state.gigs = state.gigs.filter((gig) => gig._id !== action.payload);
      })

      .addCase(setGigAvailableThunk.fulfilled, (state, action) => {
        const index = state.gigs.findIndex((g) => g._id === action.payload._id);
        if (index !== -1) state.gigs[index] = action.payload;
      })

      .addCase(setGigUnavailableThunk.fulfilled, (state, action) => {
        const index = state.gigs.findIndex((g) => g._id === action.payload._id);
        if (index !== -1) state.gigs[index] = action.payload;
      })

      .addCase(enableAutoModeThunk.fulfilled, (state, action) => {
        const index = state.gigs.findIndex((g) => g._id === action.payload._id);
        if (index !== -1) state.gigs[index] = action.payload;
      })
      .addCase(updateGigThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(updateGigThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const index = state.gigs.findIndex((g) => g._id === action.payload._id);

        if (index !== -1) {
          state.gigs[index] = action.payload;
        }
      })

      .addCase(updateGigThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetGigState } = gigSlice.actions;
export default gigSlice.reducer;
