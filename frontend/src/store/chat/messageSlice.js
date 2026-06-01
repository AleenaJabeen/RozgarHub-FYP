import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ chatId }) => {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/messages/${chatId}/messages`,
      { withCredentials: true },
    );
    return {
      chatId,
      messages: res.data.data.messages, // ✅ IMPORTANT FIX
    };
  },
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/messages/send`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );
      return res.data.data; // This is the 'fullMessage' from your controller
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to send message");
    }
  },
);

const messageSlice = createSlice({
  name: "messages",
  initialState: { byChat: {}, pagination: {} },

  reducers: {
    appendMessage(state, { payload }) {
      const { chatId } = payload;

      if (!state.byChat[chatId]) {
        state.byChat[chatId] = [];
      }

      state.byChat[chatId].unshift(payload);
    },

    editMessage(state, { payload }) {
      const list = state.byChat[payload.chatId] || [];

      const idx = list.findIndex((m) => m._id === payload._id);

      if (idx !== -1) {
        list[idx] = payload;
      }
    },

    deleteMessage: (state, { payload }) => {
      const { chatId, messageId } = payload;

      if (state.byChat[chatId]) {
        // We filter the array to keep everything EXCEPT the deleted message
        state.byChat[chatId] = state.byChat[chatId].filter(
          (msg) => msg._id !== messageId,
        );
      }
    },
    clearChatMessages(state, { payload: chatId }) {
      delete state.byChat[chatId];
    },

    updateMessageStatus(state, { payload }) {
  const { chatId, messageId, status } = payload;
  const list = state.byChat[chatId];

  if (list) {
    // Return a new array reference to ensure React detects the change
    state.byChat[chatId] = list.map((m) =>
      m._id === messageId ? { ...m, status: status } : m
    );
  }
},
    
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;

        state.byChat[chatId] = messages;
      })
      // Sending Media Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const message = action.payload;
        const chatId = message.chatId;

        if (!state.byChat[chatId]) {
          state.byChat[chatId] = [];
        }

        // Add to state immediately for faster UI feedback
        const exists = state.byChat[chatId].find((m) => m._id === message._id);
        if (!exists) {
          state.byChat[chatId].unshift(message);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  appendMessage,
  editMessage,
  deleteMessage,
  updateMessageStatus,
  clearChatMessages
} = messageSlice.actions;
export default messageSlice.reducer;
