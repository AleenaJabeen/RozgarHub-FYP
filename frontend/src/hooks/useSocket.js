import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSocket } from "../socket/socket";
import { appendMessage, editMessage, deleteMessage } from "../store/chat/messageSlice";
import { updateLastMessage } from "../store/chat/chatSlice";

export const useSocket = (chatId) => {
  const dispatch = useDispatch();
  const socket = getSocket();

  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit("join_chat", { chatId }); // ✅ FIXED

  socket.on("new_message", (message) => {
  console.log("RAW MESSAGE RECEIVED:", message); // Debug log

  // Use String() to ensure we aren't comparing objects to strings
  const incomingChatId = String(message.chatId?._id || message.chatId);
  const currentChatId = String(chatId);

  if (incomingChatId === currentChatId) {
    console.log("Match found! Dispatching to Redux...");
    dispatch(appendMessage(message));
  } else {
    console.log("No match:", incomingChatId, "vs", currentChatId);
  }
});
    socket.on("message_edited", (msg) => dispatch(editMessage(msg)));

    socket.on("message_deleted", ({ chatId, messageId }) =>
      dispatch(deleteMessage({ chatId, messageId }))
    );
   socket.on("chat_updated", (data) => {
  console.log("Global chat update received:", data);
  
  // 1. Always update the sidebar
  dispatch(updateLastMessage(data.lastMessage));

  // 2. If the user is currently looking at THIS chat, add the message to the window
  if (data.chatId === chatId) {
    dispatch(appendMessage(data.lastMessage));
  }
});
    return () => {
     socket.emit("leave_chat", { chatId }); // ✅ FIXED
      socket.off("new_message");
      socket.off("message_edited");
      socket.off("message_deleted");
    };
  }, [chatId, socket, dispatch]);
};