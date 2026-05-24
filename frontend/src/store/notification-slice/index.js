import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/notification";

/* ------------------- FETCH NOTIFICATIONS ------------------- */
export const fetchNotifications = createAsyncThunk(
  "notification/fetchAll",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(BASE_URL, {
        withCredentials: true,
      });

      return data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch notifications",
      );
    }
  },
);

/* ------------------- UNREAD COUNT ------------------- */
export const fetchUnreadCount = createAsyncThunk(
  "notification/unreadCount",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/unread-count`, {
        withCredentials: true,
      });

      return data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch unread count",
      );
    }
  },
);

/* ------------------- MARK SINGLE AS READ ------------------- */
export const markNotificationAsRead = createAsyncThunk(
  "notification/markOneRead",
  async (id, thunkAPI) => {
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/${id}/read`,
        {},
        { withCredentials: true },
      );

      return data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to mark as read",
      );
    }
  },
);

/* ------------------- MARK ALL AS READ ------------------- */
export const markAllNotificationsAsRead = createAsyncThunk(
  "notification/markAllRead",
  async (_, thunkAPI) => {
    try {
      await axios.patch(`${BASE_URL}/read-all`, {}, { withCredentials: true });

      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to mark all as read",
      );
    }
  },
);

/* ------------------- DELETE NOTIFICATION ------------------- */
export const deleteNotification = createAsyncThunk(
  "notification/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        withCredentials: true,
      });

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to delete notification",
      );
    }
  },
);

/* ------------------- SLICE ------------------- */
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
  },

  reducers: {
    // optional: for socket realtime updates later
    addRealtimeNotification: (state, action) => {
      if (!action.payload) return;
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },

  extraReducers: (builder) => {
    builder

      /* FETCH ALL */
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
      })

      /* UNREAD COUNT */
      .addCase(fetchUnreadCount.fulfilled, (state, { payload }) => {
        state.unreadCount = payload;
      })

      /* MARK ONE */
      .addCase(markNotificationAsRead.fulfilled, (state, { payload }) => {
        const index = state.items.findIndex((n) => n._id === payload._id);
        if (index !== -1) {
          state.items[index].isRead = true;
        }

        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      /* DELETE */
      .addCase(deleteNotification.fulfilled, (state, { payload }) => {
        const deletedNotification = state.items.find((n) => n._id === payload);

        state.items = state.items.filter((n) => n._id !== payload);

        if (deletedNotification && !deletedNotification.isRead) {
          state.unreadCount -= 1;
        }
      })

      /* MARK ALL */
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      });
  },
});

export const { addRealtimeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
