import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSocket } from "../socket/socket";
import {
  appendMessage,
  editMessage,
  deleteMessage,
} from "../store/chat/messageSlice";
import { updateLastMessage } from "../store/chat/chatSlice";

export const useSocket = (chatId) => {
  const dispatch = useDispatch();

  useEffect(() => {
  const socket = getSocket();

  if (!chatId || !socket) return;

  const joinRoom = () => {
    console.log("✅ Joining room:", chatId);

    socket.emit("join_chat", { chatId });
  };

  // WAIT until socket is connected
  if (socket.connected) {
    joinRoom();
  } else {
    socket.on("connect", joinRoom);
  }

  // =========================
  // SOCKET EVENTS
  // =========================

 const handleNewMessage = (message) => {
    console.log("📩 SOCKET MESSAGE RECEIVED:", message);

    dispatch(appendMessage(message));
  };

  socket.on("new_message", handleNewMessage);

  // =========================
  // CLEANUP
  // =========================

  return () => {
    socket.emit("leave_chat", { chatId });

    socket.off("connect", joinRoom);

    socket.off("new_message", handleNewMessage);
  };

  const handleMessageEdited = (msg) => {
    dispatch(editMessage(msg));
  };

  const handleMessageDeleted = ({ chatId, messageId }) => {
    dispatch(deleteMessage({ chatId, messageId }));
  };

  const handleChatUpdated = (data) => {
    dispatch(updateLastMessage(data.lastMessage));
  };

  // =========================
  // LISTENERS
  // =========================

  socket.on("new_message", handleNewMessage);
  socket.on("message_edited", handleMessageEdited);
  socket.on("message_deleted", handleMessageDeleted);
  socket.on("chat_updated", handleChatUpdated);

  // =========================
  // CLEANUP
  // =========================

  return () => {
    console.log("❌ Leaving room:", chatId);

    socket.emit("leave_chat", { chatId });

    socket.off("connect", joinRoom);

    socket.off("new_message", handleNewMessage);
    socket.off("message_edited", handleMessageEdited);
    socket.off("message_deleted", handleMessageDeleted);
    socket.off("chat_updated", handleChatUpdated);
  };
}, [chatId, dispatch]);
};