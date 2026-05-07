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
      const incomingChatId = String(message.chatId?._id || message.chatId);

      if (incomingChatId === String(chatId)) {
        dispatch(appendMessage(message));
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