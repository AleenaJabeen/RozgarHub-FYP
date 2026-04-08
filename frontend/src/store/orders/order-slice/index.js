import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/orders";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(BASE_URL, formData, {
        withCredentials: true,
        // No Content-Type header — axios sets it automatically for FormData
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);

export const getOrders = createAsyncThunk(
  "orders/getOrders",
  async ({ status, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);
      const res = await axios.get(`${BASE_URL}?${params.toString()}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const getOrderById = createAsyncThunk(
  "orders/getOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/${orderId}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order"
      );
    }
  }
);

export const respondToOrder = createAsyncThunk(
  "orders/respondToOrder",
  async ({ orderId, action, cancellationReason }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/${orderId}/respond`,
        { action, cancellationReason },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to respond to order"
      );
    }
  }
);

export const startWork = createAsyncThunk(
  "orders/startWork",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/${orderId}/start`,
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start work"
      );
    }
  }
);

export const completeOrder = createAsyncThunk(
  "orders/completeOrder",
  async ({ orderId, hoursWorked, hourlyRate, finalDescription }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/${orderId}/complete`,
        { hoursWorked, hourlyRate, finalDescription },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete order"
      );
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ orderId, cancellationReason }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/${orderId}/cancel`,
        { cancellationReason },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  orders:     [],
  activeOrder: null,
  pagination: null,
  loading:    false,
  error:      null,
  success:    false,
};

// Helper: replace a single order in the orders array by _id
const replaceOrder = (orders, updated) =>
  orders.map((o) => (o._id === updated._id ? updated : o));

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    resetOrderState: (state) => {
      state.loading = false;
      state.error   = null;
      state.success = false;
    },
    clearActiveOrder: (state) => {
      state.activeOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── Create Order ────────────────────────────────────────────────────────
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error   = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Prepend to list so the new order appears at the top
        state.orders  = [action.payload.data, ...state.orders];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        state.success = false;
      })

      // ── Get Orders ──────────────────────────────────────────────────────────
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading    = false;
        state.orders     = action.payload.data.orders;
        state.pagination = action.payload.data.pagination;
        state.error      = null;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── Get Order By ID ─────────────────────────────────────────────────────
      .addCase(getOrderById.pending, (state) => {
        state.loading     = true;
        state.error       = null;
        state.activeOrder = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading     = false;
        state.activeOrder = action.payload.data;
        state.error       = null;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── Respond To Order ────────────────────────────────────────────────────
      .addCase(respondToOrder.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(respondToOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orders  = replaceOrder(state.orders, action.payload.data);
        if (state.activeOrder?._id === action.payload.data._id) {
          state.activeOrder = action.payload.data;
        }
      })
      .addCase(respondToOrder.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── Start Work ──────────────────────────────────────────────────────────
      .addCase(startWork.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(startWork.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orders  = replaceOrder(state.orders, action.payload.data);
        if (state.activeOrder?._id === action.payload.data._id) {
          state.activeOrder = action.payload.data;
        }
      })
      .addCase(startWork.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── Complete Order ──────────────────────────────────────────────────────
      .addCase(completeOrder.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orders  = replaceOrder(state.orders, action.payload.data);
        if (state.activeOrder?._id === action.payload.data._id) {
          state.activeOrder = action.payload.data;
        }
      })
      .addCase(completeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── Cancel Order ────────────────────────────────────────────────────────
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orders  = replaceOrder(state.orders, action.payload.data);
        if (state.activeOrder?._id === action.payload.data._id) {
          state.activeOrder = action.payload.data;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const { clearOrderError, resetOrderState, clearActiveOrder } = orderSlice.actions;
export default orderSlice.reducer;
