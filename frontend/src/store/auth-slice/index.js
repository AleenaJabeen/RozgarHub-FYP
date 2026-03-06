import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  user: null, // user object
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Api calls
// register
const BASE_URL = "http://localhost:3000/api/v1/auth";
export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/register`, formData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log(rejectWithValue(error.response.data));
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong",
      );
    }
  },
);

// Login Thunk
export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, formData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      // Extracts message from your JSON response
      const message = error.response?.data?.message || "Login failed";
      return rejectWithValue(message);
    }
  },
);

// sendEmail OTP
export const sendEmailOTP = createAsyncThunk(
  "/auth/sendEmailOTP",
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/send-email-otp`, {
        email,
      });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return rejectWithValue(message);
    }
  },
);

// verify email otp

export const verifyEmailOTP = createAsyncThunk(
  "/auth/verifyEmailOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/verify-email`, {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Something went wrong during verifiying email";
      return rejectWithValue(message);
    }
  },
);

// Forgot password

export const resetPassword = createAsyncThunk(
  "/auth/reset-password",
  async (email, { rejectWithValue }) => {
    try {
      console.log("email", email);
      const response = await axios.post(
        `${BASE_URL}/reset-password`,
        { email },
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      console.log(rejectWithValue(error.response.data));
      return rejectWithValue(
        error.response?.data?.message ||
          "Something went wrong while reseting password",
      );
    }
  },
);

export const resetPasswordConfirm = createAsyncThunk(
  "auth/resetPasswordConfirm", // Use a unique action string here
  async ({ token, password }, { rejectWithValue }) => {
    try {
      // Log the payload to ensure data is coming through
      console.log("Resetting password for token:", token);

      const response = await axios.post(
        `${BASE_URL}/reset-password/${token}`,
        { password },
        { withCredentials: true },
      );

      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while resetting password";
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateUserRole = createAsyncThunk(
  "auth/choose-role",
  async (role, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/choose-role`,
        { role },
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong while choosing role";

      return rejectWithValue(message);
    }
  },
);

// Logout Thunk
export const logoutUser = createAsyncThunk(
  "/auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/logout`,
        {},
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Logout failed";
      return rejectWithValue(message);
    }
  },
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/check-auth`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Not authenticated",
      );
    }
  },
);
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data || action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add these cases inside extraReducers builder in authSlice.js
      .addCase(updateUserRole.pending, (state) => {
        state.isLoading = true;
      })
      // Inside your authSlice.js extraReducers
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.isLoading = false;
        // Make sure your backend returns the FULL updated user object
        const updatedUser = action.payload.data || action.payload.user;

        if (updatedUser) {
          state.user = { ...state.user, ...updatedUser };
          state.isAuthenticated = true;
        }
      })
      .addCase(updateUserRole.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data || action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null; // ✅ clear user
        state.isAuthenticated = false; // ✅ clear auth
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // ✅ Even if API fails, clear state locally
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
