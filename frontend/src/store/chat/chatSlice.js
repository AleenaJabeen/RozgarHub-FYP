// src/store/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMyChats = createAsyncThunk("chats/fetchAll", async () => {
  const { data } = await axios.get("http://localhost:3000/api/v1/chat", {
    withCredentials: true,
  });
  return data.data; // Array of chats
});
export const markAsRead = createAsyncThunk(
  "chat/markAsRead",
  async (chatId, thunkAPI) => {
    try {
      const response = await axios.put(
        "http://localhost:3000/api/v1/messages/read",
        { chatId },
        { withCredentials: true },
      );
      return { chatId };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to mark as read",
      );
    }
  },
);

export const deleteChat = createAsyncThunk(
  "chat/deleteChat",
  async (chatId, thunkAPI) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/chat/${chatId}`, {
        withCredentials: true,
      });

      return chatId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to delete chat",
      );
    }
  },
);

const chatSlice = createSlice({
  name: "chats",
  initialState: { items: [], loading: false },
  reducers: {
    updateLastMessage(state, { payload }) {
      const chatIndex = state.items.findIndex((c) => c._id === payload.chatId);
      if (chatIndex !== -1) {
        state.items[chatIndex].lastMessage = payload;
        state.items[chatIndex].lastMessageAt = payload.createdAt;

        // Increment unread count if the current user isn't the sender
        // Note: You might want to skip this if the chat is currently open
        const myId = JSON.parse(localStorage.getItem("user"))?._id;
        if (payload.senderId._id !== myId) {
          const currentCount = state.items[chatIndex].unreadCounts?.[myId] || 0;
          state.items[chatIndex].unreadCounts = {
            ...state.items[chatIndex].unreadCounts,
            [myId]: currentCount + 1,
          };
        }

        // Move chat to top of the list
        const [movedChat] = state.items.splice(chatIndex, 1);
        state.items.unshift(movedChat);
      }
    },

    toggleStarred(state, { payload: chatId }) {
      const chat = state.items.find((c) => c._id === chatId);

      if (chat) {
        chat.isStarred = !chat.isStarred;
      }
    },

    toggleArchived(state, { payload: chatId }) {
      const chat = state.items.find((c) => c._id === chatId);

      if (chat) {
        chat.isArchived = !chat.isArchived;
      }
    },

    removeChat(state, { payload: chatId }) {
      state.items = state.items.filter((c) => c._id !== chatId);
    },

    resetUnreadCount(state, { payload: { chatId, userId } }) {
      const chat = state.items.find((c) => c._id === chatId);
      if (chat && chat.unreadCounts) {
        chat.unreadCounts[userId] = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyChats.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
      })
      .addCase(markAsRead.fulfilled, (state, { payload }) => {
        const { chatId } = payload;

        const myId = JSON.parse(localStorage.getItem("user"))?._id;

        const chat = state.items.find((c) => c._id === chatId);

        if (chat) {
          chat.unreadCounts = {
            ...chat.unreadCounts,
            [myId]: 0,
          };
        }
      })
      .addCase(deleteChat.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((chat) => chat._id !== payload);
      });
  },
});

export const {
  updateLastMessage,
  resetUnreadCount,
  toggleArchived,
  toggleStarred,
  removeChat,
} = chatSlice.actions;
export default chatSlice.reducer;
