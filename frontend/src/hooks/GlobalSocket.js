import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSocket } from "../socket/socket";

import { setUserOnline, setUserOffline } from "../store/chat/chatSlice";

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

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [dispatch]);
};
