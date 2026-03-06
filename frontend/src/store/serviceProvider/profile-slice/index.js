import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  profile: null,
  loading: false,
  error: null,
  success: false,
};

export const createProviderProfile = createAsyncThunk(
  "profile/createProviderProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/providers/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile creation failed",
      );
    }
  },
);

const profileSlice = createSlice({
  name: "profileSlice",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },

    resetProfileState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProviderProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      // FULFILLED
      .addCase(createProviderProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.profile = action.payload;
      })

      // REJECTED
      .addCase(createProviderProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearProfileError, resetProfileState } = profileSlice.actions;

export default profileSlice.reducer;
