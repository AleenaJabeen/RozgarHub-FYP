import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../socket/socket";

import {
  setUserOnline,
  setUserOffline,
  chatUpdatedFromSocket,
  resetUnreadCount,
} from "../store/chat/chatSlice";

import { addRealtimeNotification } from "../store/notification-slice";

export const useGlobalSocket = () => {
  const dispatch = useDispatch();
  const myId = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    const socket = getSocket();

    if (!socket || !myId) return;

    //-------------------------
    // USER ONLINE
    //-------------------------

    const handleUserOnline = (userId) => {
      dispatch(setUserOnline(userId));
    };

    //-------------------------
    // USER OFFLINE
    //-------------------------

    const handleUserOffline = ({ userId, lastActiveAt }) => {
      dispatch(setUserOffline({ userId, lastActiveAt }));
    };

    //-------------------------
    // NEW NOTIFICATION
    //-------------------------

    const handleNotification = (notification) => {
      dispatch(addRealtimeNotification(notification));
    };

    //-------------------------
    // CHAT UPDATED
    //-------------------------

    const handleChatUpdated = (data) => {
      dispatch(
        chatUpdatedFromSocket({
          ...data,
          myId,
          isActive: false,
        })
      );
    };

    //-------------------------
    // READ RECEIPTS
    //-------------------------

    const handleMessagesRead = ({ chatId }) => {
      dispatch(resetUnreadCount({ chatId, userId: myId }));
    };

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("new_notification", handleNotification);
    socket.on("chat_updated", handleChatUpdated);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("new_notification", handleNotification);
      socket.off("chat_updated", handleChatUpdated);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [dispatch, myId]);
};