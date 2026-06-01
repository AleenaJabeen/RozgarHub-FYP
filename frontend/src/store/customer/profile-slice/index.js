import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPLETION CALCULATOR
//
// Exported so Dashboard.jsx, ViewProfile.jsx, and any future component
// all use *identical* logic. Import it as:
//   import { calcCompletion } from "../../store/customer/profile-slice";
//
// 7 checkpoints — each worth ~14.3 points → 100% total.
// ─────────────────────────────────────────────────────────────────────────────
export const calcCompletion = (user, profile) => {
  if (!user) return 0;
  const checks = [
    !!user.name,
    !!user.email,
    !!user.phone,
    !!user.avatar,
    !!user.isPhoneVerified,
    !!(user.location?.address?.street),
    !!(profile?.savedAddresses?.length > 0),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SLICE SYNC INSTRUCTIONS
//
// Dashboard.jsx reads from state.auth.user. To keep it in sync after a profile
// update or OTP verification, add the following extraReducers to your auth
// slice (authSlice.js):
//
//   import { updateCustomerProfile, verifyCustomerPhoneOTP } from "../customer/profile-slice";
//
//   // Inside extraReducers builder:
//   .addCase(updateCustomerProfile.fulfilled, (state, action) => {
//     // action.payload.data is the fresh User document returned by the backend
//     if (state.user && action.payload?.data) {
//       state.user = { ...state.user, ...action.payload.data };
//     }
//   })
//   .addCase(verifyCustomerPhoneOTP.fulfilled, (state) => {
//     if (state.user) {
//       state.user = { ...state.user, isPhoneVerified: true };
//     }
//   })
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  user:    null,
  profile: null,
  loading: true,
  error:   null,
  success: false,
};

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/customer`;

// ── Thunks ────────────────────────────────────────────────────────────────────

export const createCustomerProfile = createAsyncThunk(
  "customerProfile/createCustomerProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/create-profile`, formData, {
        withCredentials: true,
      });
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
      const res = await axios.patch(`${BASE_URL}/update-profile`, formData, {
        withCredentials: true,
      });
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

export const addSavedAddress = createAsyncThunk(
  "customerProfile/addSavedAddress",
  async (address, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/add-address`,
        { address },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add address"
      );
    }
  }
);

export const removeSavedAddress = createAsyncThunk(
  "customerProfile/removeSavedAddress",
  async (address, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/remove-address`,
        { address },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove address"
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const customerProfileSlice = createSlice({
  name: "customerProfileSlice",
  initialState,
  reducers: {
    clearCustomerProfileError: (state) => {
      state.error = null;
    },
    resetCustomerProfileState: (state) => {
      state.loading = false;
      state.error   = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── Create Profile ──────────────────────────────────────────────────────
      .addCase(createCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error   = null;
        state.success = false;
      })
      .addCase(createCustomerProfile.fulfilled, (state, action) => {
        state.loading  = false;
        state.success  = true;
        state.profile  = action.payload.data;
      })
      .addCase(createCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        state.success = false;
      })

      // ── Get Profile ─────────────────────────────────────────────────────────
      //
      // action.payload.data is the populated Customer document.
      // action.payload.data.user is the full User document (has avatar,
      // location, isPhoneVerified, etc.) — this is the authoritative source
      // for every field that ViewProfile and calcCompletion depend on.
      .addCase(getCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(getCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
        state.user    = action.payload.data.user; // populated User document
        state.error   = null;
      })
      .addCase(getCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── Update Profile ──────────────────────────────────────────────────────
      //
      // FIX: The backend's updateCustomerProfile controller returns the updated
      // User document in action.payload.data (not the Customer doc).
      // We must write it into state.user so ViewProfile.jsx sees fresh data
      // immediately — without waiting for the next getCustomerProfile() call.
      //
      // Profile.jsx also dispatches getCustomerProfile() after a successful
      // update (double-sync: fast optimistic update here + authoritative
      // re-fetch there).
      .addCase(updateCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Merge the fresh User fields into state.user.
        // Using object spread so any Customer-owned fields on state.user
        // (set by getCustomerProfile) are preserved and not wiped.
        if (action.payload?.data) {
          state.user = { ...(state.user || {}), ...action.payload.data };
        }
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── Verify Phone OTP ────────────────────────────────────────────────────
      //
      // ROOT CAUSE FIX: This case was completely missing from the slice.
      // When OTP verification succeeded on the server, Redux never flipped
      // isPhoneVerified to true — so ViewProfile always showed the
      // "Verify Phone" badge even for verified users.
      //
      // We set isPhoneVerified: true optimistically here. The authoritative
      // re-fetch in Profile.jsx's handleSubmit will confirm it.
      .addCase(verifyCustomerPhoneOTP.fulfilled, (state, action) => {
        if (state.user) {
          state.user = {
            ...state.user,
            isPhoneVerified: true,
            // Also sync the phone number if the verify endpoint returns it
            ...(action.payload?.data?.phone && { phone: action.payload.data.phone }),
          };
        }
      })

      // ── Saved Addresses ─────────────────────────────────────────────────────
      .addCase(addSavedAddress.fulfilled, (state, action) => {
        state.profile = action.payload.data;
      })
      .addCase(removeSavedAddress.fulfilled, (state, action) => {
        state.profile = action.payload.data;
      });
  },
});

export const { clearCustomerProfileError, resetCustomerProfileState } =
  customerProfileSlice.actions;

export default customerProfileSlice.reducer;