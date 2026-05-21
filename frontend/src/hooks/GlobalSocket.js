import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSocket } from "../socket/socket";

import { setUserOnline, setUserOffline } from "../store/chat/chatSlice";
import { addRealtimeNotification } from "../store/notification-slice";

export const useGlobalSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    // USER ONLINE
    const handleUserOnline = (userId) => {
      dispatch(setUserOnline(userId));
    };

    // USER OFFLINE
    const handleUserOffline = ({ userId, lastActiveAt }) => {
      dispatch(setUserOffline({ userId, lastActiveAt }));
    };
    const handleNewNotification = (notification) => {
      console.log("NEW NOTIFICATION:", notification);
      dispatch(addRealtimeNotification(notification));
    };

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("new_notification", handleNewNotification);
    };
  }, [dispatch]);
};
