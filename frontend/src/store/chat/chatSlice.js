// src/store/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMyChats = createAsyncThunk("chats/fetchAll", async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/chat`, {
    withCredentials: true,
  });
  return data.data; // Array of chats
});
export const markAsRead = createAsyncThunk(
  "chat/markAsRead",
  async ({ chatId, myId }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/messages/read`,
        { chatId },
        { withCredentials: true },
      );
      return { chatId, myId };
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
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/chat/${chatId}`, {
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

export const fetchUserInfo = createAsyncThunk(
  "chat/fetchUserInfo",
  async (userId, thunkAPI) => {
    try {
      const  response  = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/chat/user-info/${userId}`, {
        withCredentials: true,
      });
      return response.data.data; // This returns the merged User + ServiceProvider object
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch user details"
      );
    }
  }
);
const chatSlice = createSlice({
  name: "chats",
  initialState: { items: [], loading: false,selectedUserProfile: null,profileLoading: false },
  reducers: {
    setUserOnline: (state, action) => {
      const userId = action.payload;

      state.items.forEach((chat) => {
        chat.participants = chat.participants.map((p) =>
          p._id === userId ? { ...p, isOnline: true } : p,
        );
      });
    },

    setUserOffline: (state, action) => {
      const { userId, lastActiveAt } = action.payload;

      state.items.forEach((chat) => {
        chat.participants = chat.participants.map((p) =>
          p._id === userId
            ? {
                ...p,
                isOnline: false,
                lastActiveAt,
              }
            : p,
        );
      });
    },
    
    updateLastMessage(state, { payload }) {
      const chatIndex = state.items.findIndex((c) => c._id === payload.chatId);
      if (chatIndex !== -1) {
        state.items[chatIndex].lastMessage = payload;
        state.items[chatIndex].lastMessageAt = payload.createdAt;

        // Increment unread count if the current user isn't the sender
        // Note: You might want to skip this if the chat is currently open
        const myId = payload?.myId;
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
    removeChat(state, { payload: chatId }) {
      state.items = state.items.filter((c) => c._id !== chatId);
    },
    resetUnreadCount(state, { payload: { chatId, userId } }) {
      const chat = state.items.find((c) => c._id === chatId);
      if (chat && chat.unreadCounts) {
        chat.unreadCounts[userId] = 0;
      }
    },
    clearSelectedProfile: (state) => {
      state.selectedUserProfile = null;
    }
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
        const { chatId, myId } = payload; // ✅ reliable, no localStorage
        const chat = state.items.find((c) => c._id === chatId);
        if (chat) {
          chat.unreadCounts = {
            ...chat.unreadCounts,
            [myId]: 0,
          };
        }
      })
      .addCase(fetchUserInfo.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(fetchUserInfo.fulfilled, (state, { payload }) => {
        state.selectedUserProfile = payload;
        state.profileLoading = false;
      })
      .addCase(fetchUserInfo.rejected, (state) => {
        state.profileLoading = false;
        state.selectedUserProfile = null;
      })
      .addCase(deleteChat.pending, (state, action) => {
        state.items = state.items.filter(
          (chat) => chat._id !== action.meta.arg,
        );
      })
      .addCase(deleteChat.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((chat) => chat._id !== payload);
      });
  },
});



export const {
  setUserOnline,
  setUserOffline,
  updateLastMessage,
  resetUnreadCount,
  removeChat,
  clearSelectedProfile
} = chatSlice.actions;
export default chatSlice.reducer;
