import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
  success: false,
};

const BASE_URL = "http://localhost:3000/api/v1/customer";

export const createCustomerProfile = createAsyncThunk(
  "customerProfile/createCustomerProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/create-profile`,
        formData,
        {
          withCredentials: true,
          // No Content-Type — axios handles it automatically for FormData
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

export const getCustomerProfile = createAsyncThunk(
  "customerProfile/getCustomerProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/get-profile`, {
        withCredentials: true,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Fetching profile failed"
      );
    }
  }
);

export const updateCustomerProfile = createAsyncThunk(
  "customerProfile/updateCustomerProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/update-profile`,
        formData,
        {
          withCredentials: true,
        }
      );
      console.log(res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile update failed"
      );
    }
  }
);

export const sendCustomerPhoneOTP = createAsyncThunk(
  "customerProfile/sendCustomerPhoneOTP",
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

export const verifyCustomerPhoneOTP = createAsyncThunk(
  "customerProfile/verifyCustomerPhoneOTP",
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

const customerProfileSlice = createSlice({
  name: "customerProfileSlice",
  initialState,
  reducers: {
    clearCustomerProfileError: (state) => {
      state.error = null;
    },

    resetCustomerProfileState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Create Profile ──────────────────────
      .addCase(createCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.profile = action.payload.data;
      })
      .addCase(createCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ── Get Profile ─────────────────────────
      .addCase(getCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
        state.user = action.payload.data.user;
        state.error = null;
      })
      .addCase(getCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Update Profile ──────────────────────
      .addCase(updateCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
        state.success = true;
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCustomerProfileError, resetCustomerProfileState } =
  customerProfileSlice.actions;

export default customerProfileSlice.reducer;
