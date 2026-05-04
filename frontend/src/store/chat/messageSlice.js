import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMessages = createAsyncThunk(
  "messages/fetch",
  async ({ chatId, page = 1 }, { getState }) => {
    // Get the token directly from your auth state
    const token = getState().auth.token; 

    const response = await axios.get(
      `http://localhost:3000/api/v1/messages/${chatId}/messages?page=${page}`,
      
        { withCredentials: true }
      
    );
    return { chatId, messages: response.data.data };
  }
);

const messageSlice = createSlice({
  name: "messages",
  initialState: { byChat: {}, pagination: {} },
  reducers: {
    appendMessage(state, { payload }) {
      const { chatId } = payload;
      if (!state.byChat[chatId]) state.byChat[chatId] = [];
      state.byChat[chatId].unshift(payload); // newest first
    },
    editMessage(state, { payload }) {
      const list = state.byChat[payload.chatId] || [];
      const idx = list.findIndex((m) => m._id === payload._id);
      if (idx !== -1) list[idx] = payload;
    },
    deleteMessage(state, { payload: { chatId, messageId } }) {
      const list = state.byChat[chatId] || [];
      const idx = list.findIndex((m) => m._id === messageId);
      if (idx !== -1) list[idx].deletedForEveryone = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      const { chatId, messages } = action.payload; // Destructure carefully

      if (Array.isArray(messages)) {
        state.byChat[chatId] = messages;
      } else {
        state.byChat[chatId] = []; // Fallback to empty array
      }
      state.loading = false;
    });
  },
});

export const { appendMessage, editMessage, deleteMessage } =
  messageSlice.actions;
export default messageSlice.reducer;
