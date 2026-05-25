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

export const saveFCMToken = createAsyncThunk(
  "notifications/saveFCMToken",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/notifications/save-token`,
        { token },
        {
          withCredentials: true,
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save notification token",
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
export const verifyResetToken = createAsyncThunk(
  "auth/verifyResetToken",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/verify-reset-token/${token}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Invalid token");
    }
  }
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
        withCredentials:true,
        validateStatus: (status) => status === 200 || status === 401,
      });

      if (response.status === 401) {
        
        return rejectWithValue(null);
      }

     
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Not authenticated");
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
        { withCredentials: true },
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add address",
      );
    }
  },
);

export const removeSavedAddress = createAsyncThunk(
  "customerProfile/removeSavedAddress",
  async (address, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/remove-address`,
        { address },
        { withCredentials: true },
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove address",
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
      .addCase(checkAuth.rejected, (state,action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        // console.log(action.payload)
        // come and check it 
        if (action.payload !== null) {
          state.error = action.payload;
        }
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
      })
      .addCase(saveFCMToken.pending, (state) => {
        // optional: you can add a loading flag if you want
        state.isLoading = true;
      })
      .addCase(saveFCMToken.fulfilled, (state, action) => {
        state.isLoading = false;
        // no change needed in user state
        // token is stored in backend
      })
      .addCase(saveFCMToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Saved Addresses ──────────────────────
      .addCase(addSavedAddress.fulfilled, (state, action) => {
        // Automatically update the profile state with the new address list
        state.profile = action.payload.data;
      })
      .addCase(removeSavedAddress.fulfilled, (state, action) => {
        // Automatically update the profile state after removing an address
        state.profile = action.payload.data;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
