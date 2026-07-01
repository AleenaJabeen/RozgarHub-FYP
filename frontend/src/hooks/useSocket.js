import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../socket/socket";

import {
  appendMessage,
  editMessage,
  deleteMessage,
  updateMessageStatus,
} from "../store/chat/messageSlice";

export const useSocket = (chatId) => {
  const dispatch = useDispatch();

  const myId = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    const socket = getSocket();

    if (!socket || !chatId || !myId) return;

    socket.emit("join_chat", { chatId });

    //--------------------------------
    // NEW MESSAGE
    //--------------------------------

    const handleNewMessage = (message) => {
      const incomingChatId = String(message.chatId?._id || message.chatId);

      if (incomingChatId !== String(chatId)) return;

      dispatch(appendMessage(message));

      const senderId =
        typeof message.senderId === "object"
          ? message.senderId._id
          : message.senderId;

      if (String(senderId) === String(myId)) return;

      // Delivered
      socket.emit("message_delivered", {
        chatId,
        messageId: message._id,
      });

      // Read only if chat is visible
      if (
        document.visibilityState === "visible" &&
        !document.hidden
      ) {
        socket.emit("messages_read", {
          chatId,
          messageIds: [message._id],
        });
      }
    };

    //--------------------------------
    // EDIT
    //--------------------------------

    const handleEdited = (message) => {
      dispatch(editMessage(message));
    };

    //--------------------------------
    // DELETE
    //--------------------------------

    const handleDeleted = ({ messageId }) => {
      dispatch(deleteMessage({ chatId, messageId }));
    };

    //--------------------------------
    // STATUS
    //--------------------------------

    const handleStatus = ({
      messageIds,
      messageId,
      status,
      chatId: updatedChatId,
    }) => {
      if (String(updatedChatId) !== String(chatId)) return;

      const ids = messageIds || [messageId];

      ids.forEach((id) => {
        dispatch(
          updateMessageStatus({
            chatId,
            messageId: id,
            status,
          })
        );
      });
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_edited", handleEdited);
    socket.on("message_deleted", handleDeleted);
    socket.on("message_status_updated", handleStatus);
    socket.on("messages_read", handleStatus);

    return () => {
      socket.emit("leave_chat", { chatId });

      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleEdited);
      socket.off("message_deleted", handleDeleted);
      socket.off("message_status_updated", handleStatus);
      socket.off("messages_read", handleStatus);
    };
  }, [chatId, myId, dispatch]);
};