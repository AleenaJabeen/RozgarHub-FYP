// SocketListener.jsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../socket/socket";
import { chatUpdatedFromSocket } from "../store/chat/chatSlice";

export default function SocketListener() {
    const dispatch = useDispatch();
    const socket = getSocket();
    const myId = useSelector(state => state.auth.user?._id);

    useEffect(() => {
        if (!socket || !myId) return;


        const handleChatUpdated = (data) => {
            console.log("chat_updated received", data);
            dispatch(
                chatUpdatedFromSocket({
                    ...data,
                    myId,
                    isActive: false,
                })
            );
        };

        socket.on("chat_updated", handleChatUpdated);

        return () => {
            socket.off("chat_updated", handleChatUpdated);
        };
    }, [socket, myId]);

    return null;
}