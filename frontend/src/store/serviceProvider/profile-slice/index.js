import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  profile: null,
  loading: true,
  error: null,
  success: false,
};
const BASE_URL="http://localhost:3000/api/v1/serviceprovider"

export const createProviderProfile = createAsyncThunk(
  "profile/createProviderProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/create-profile`,
        formData,
        {
          withCredentials: true,
          // ✅ No Content-Type — axios handles it automatically for FormData
        }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile creation failed"
      );
    }
  }
);

export const sendPhoneOTP = createAsyncThunk(
  "profile/sendPhoneOTP",
  async (phone, { rejectWithValue }) => {
    try {

      const response = await axios.post(
        `${BASE_URL}/send-otp`,
        { phone },
        { withCredentials: true }
      );

      return response.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

export const verifyPhoneOTP = createAsyncThunk(
  "profile/verifyPhoneOTP",
  async ({ phone, otp }, { rejectWithValue }) => {
    try {

      const response = await axios.post(
          `${BASE_URL}/verify-phone-otp`,
        { phone, otp },
        { withCredentials: true }
      );

      return response.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
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
