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
    if (!socket || !chatId) return;

    socket.emit("join_chat", { chatId });

    // ✅ HANDLERS (stable references)
    const handleNewMessage = (message) => {
  // Log this to your console! If it doesn't show up when you send a message, 
  // the server isn't emitting to this client.
  console.log("Socket received message:", message); 

  // Normalize both IDs to strings
  const incomingChatId = String(message.chatId?._id || message.chatId);
  const currentChatId = String(chatId);

  if (incomingChatId === currentChatId) {
    dispatch(appendMessage(message));
  } else {
    console.warn("Message received for a different chat:", incomingChatId);
  }
};

    const handleMessageEdited = (msg) => {
      dispatch(editMessage(msg));
    };

    const handleMessageDeleted = ({ chatId, messageId }) => {
      dispatch(deleteMessage({ chatId, messageId }));
    };

    const handleChatUpdated = (data) => {
      // ✅ ONLY update sidebar here
      dispatch(updateLastMessage(data.lastMessage));

      // ❌ DO NOT append message again here
    };

    // ✅ Attach listeners
    socket.on("new_message", handleNewMessage);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("chat_updated", handleChatUpdated);

    // ✅ Cleanup properly
    return () => {
      socket.emit("leave_chat", { chatId });

      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("chat_updated", handleChatUpdated);
    };
  }, [chatId, dispatch]);
};