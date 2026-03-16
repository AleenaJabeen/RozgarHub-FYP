import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  user:null,
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

export const getProviderProfile = createAsyncThunk(
  "profile/getProviderProfile",
  async (_, { rejectWithValue }) => {
    try {
      // Typically fetching is a GET request
      const res = await axios.get(`${BASE_URL}/get-profile`, {
        withCredentials: true,
      });
            console.log(res.data)

      return res.data; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Fetching Profile failed"
      );
    }
  }
);
export const updateProviderProfile = createAsyncThunk(
  "profile/updateProviderProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/update-profile`, 
        formData,
        {
          withCredentials: true,
        }
      );
      console.log(res.data)
      
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile update failed"
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
        state.profile = action.payload.data;
      })

      .addCase(createProviderProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(updateProviderProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateProviderProfile.fulfilled, (state, action) => {
      state.loading = false;
      // Replace the old profile data with the updated data from the server
      state.profile = action.payload.data; 
      state.success = true;
    })
    .addCase(updateProviderProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
      .addCase(getProviderProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProviderProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
        state.user = action.payload.data.user; 
        state.error = null;
      })
      .addCase(getProviderProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearProfileError, resetProfileState } = profileSlice.actions;

export default profileSlice.reducer;
