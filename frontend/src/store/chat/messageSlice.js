import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ chatId }) => {
    const res = await axios.get(`http://localhost:3000/api/v1/messages/${chatId}/messages`,
      {withCredentials:true}
    );
    return {
      chatId,
      messages: res.data.data.messages // ✅ IMPORTANT FIX
    };
  }
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

    deleteMessage(state, { payload: { chatId, messageId } }) {
      const list = state.byChat[chatId] || [];

      const idx = list.findIndex((m) => m._id === messageId);

      if (idx !== -1) {
        list[idx].deletedForEveryone = true;
      }
    },

    updateMessageStatus(state, { payload }) {
      const { chatId, messageId, status } = payload;

      const list = state.byChat[chatId] || [];

      const message = list.find((m) => m._id === messageId);

      if (message) {
        message.status = status;
      }
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      const { chatId, messages } = action.payload;

      state.byChat[chatId] = messages;
    });
  },
});

export const { appendMessage, editMessage, deleteMessage , updateMessageStatus,} =
  messageSlice.actions;
export default messageSlice.reducer;
