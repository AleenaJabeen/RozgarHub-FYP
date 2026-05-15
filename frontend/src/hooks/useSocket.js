import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getSocket } from "../socket/socket";
import {
  appendMessage,
  editMessage,
  deleteMessage,
  updateMessageStatus,
} from "../store/chat/messageSlice";
import { updateLastMessage } from "../store/chat/chatSlice";

export const useSocket = (chatId) => {
  const dispatch = useDispatch();
  const myId = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;

    socket.emit("join_chat", { chatId });

    const handleNewMessage = (message) => {
      const incomingChatId = String(message.chatId?._id || message.chatId);

      if (incomingChatId !== String(chatId)) return;

      const senderId =
        typeof message.senderId === "object"
          ? message.senderId._id
          : message.senderId;

      // DELIVERY
      if (senderId !== myId) {
        socket.emit("message_delivered", {
          messageId: message._id,
          chatId,
        });

        // READ immediately if:
        // - tab focused
        // - chat already open
       if (!document.hidden && incomingChatId === String(chatId)) {
          socket.emit("messages_read", {
            chatId,
            messageIds: [message._id],
          });
        }
      }

      dispatch(appendMessage(message));
    };

    const handleMessageEdited = (msg) => {
      dispatch(editMessage(msg));
    };

    const handleMessageDeleted = ({ chatId, messageId }) => {
      dispatch(deleteMessage({ chatId, messageId }));
    };

    const handleChatUpdated = (data) => {
      // ✅ ONLY update sidebar here
     dispatch(updateLastMessage({ ...data.lastMessage, chatId: data.chatId,myId }));

     
    };
   
    const handleStatusUpdate = ({
      messageIds,
      messageId,
      status,
      chatId: updatedChatId,
    }) => {
      // Use loose equality or String() to avoid ID type mismatches
      if (String(updatedChatId) !== String(chatId)) return;

      const ids = messageIds || [messageId];
      ids.forEach((id) => {
        dispatch(updateMessageStatus({ messageId: id, status, chatId }));
      });
    };

    // ✅ Attach listeners
    socket.on("new_message", handleNewMessage);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("chat_updated", handleChatUpdated);
    socket.on("message_status_updated", handleStatusUpdate);
    socket.on("messages_read", handleStatusUpdate);

    // ✅ Cleanup properly
    return () => {
      socket.emit("leave_chat", { chatId });

      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("chat_updated", handleChatUpdated);
      socket.off("message_status_updated", handleStatusUpdate);
      socket.off("messages_read", handleStatusUpdate);
    };
  }, [chatId, dispatch, myId]);
};
