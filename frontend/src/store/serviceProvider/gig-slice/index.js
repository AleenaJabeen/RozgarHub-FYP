import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/gigs"; // Adjusted based on your gig route

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
      });
  },
});

export const { resetGigState } = gigSlice.actions;
export default gigSlice.reducer;
