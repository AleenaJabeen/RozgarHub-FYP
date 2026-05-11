import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteMessage,
  fetchMessages,
  updateMessageStatus,
} from "../../store/chat/messageSlice";
import { useSocket } from "../../hooks/useSocket";
import { getSocket } from "../../socket/socket";
import { BiMessageRoundedDots } from "react-icons/bi";

import ChatHeader from "./chatWindow/ChatHeader";
import MessageList from "./chatWindow/MessageList";
import ChatInput from "./chatWindow/ChatInput";
import axiosInstance from 'axios'

const ChatWindow = () => {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = getSocket();

  const containerRef = useRef();
  const typingTimeoutRef = useRef(null);
  const prevLengthRef = useRef(0);

  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const myId = useSelector((state) => state.auth.user?._id);
  const messages = useSelector(
    (state) => state.messages?.byChat?.[chatId] || [],
  );
  const chats = useSelector((state) => state.chats?.items || []);
  const chatData = chats.find((c) => c._id === chatId);
  const otherUser = chatData?.participants?.find((p) => p._id !== myId);

  useSocket(chatId);

  // Typing
  useEffect(() => {
    if (!socket) return;
    const handleTyping = ({ userId, isTyping }) => {
      if (userId === otherUser?._id) setIsTyping(isTyping);
    };
    socket.on("user_typing", handleTyping);
    return () => socket.off("user_typing", handleTyping);
  }, [socket, otherUser]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageStatusUpdate = ({
      messageId,
      status,
      chatId: updatedChatId,
    }) => {
      if (updatedChatId !== chatId) return;

      dispatch(
        updateMessageStatus({
          messageId,
          status,
          chatId,
        }),
      );
    };

    socket.on("message_status_updated", handleMessageStatusUpdate);

    return () => {
      socket.off("message_status_updated", handleMessageStatusUpdate);
    };
  }, [socket, chatId, dispatch]);

  useEffect(() => {
    if (!socket || !messages.length || !myId) return;

    messages.forEach((msg) => {
      const senderId =
        typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;

      // only mark OTHER user's messages as read
      if (senderId !== myId && msg.status !== "read") {
        socket.emit("message_read", {
          messageId: msg._id,
          chatId,
        });
      }
    });
  }, [messages, socket, myId, chatId]);

  useEffect(() => {
    if (chatId) dispatch(fetchMessages({ chatId }));
  }, [chatId, dispatch]);

  // Scroll Logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const threshold = 150;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold;

    if (messages.length > prevLengthRef.current) {
      const lastMessage = messages[messages.length - 1];
      const isMe =
        lastMessage.senderId?._id === myId || lastMessage.senderId === myId;
      if (isMe || isNearBottom) {
        requestAnimationFrame(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        });
      }
    }
    prevLengthRef.current = messages.length;
  }, [messages, myId]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit("send_message", { chatId, content: text, type: "text" });
    socket.emit("typing", { chatId, isTyping: false });
    setText("");
  };

  const handleTypingAction = () => {
    socket.emit("typing", { chatId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { chatId, isTyping: false });
    }, 1000);
  };
  const handleEditMessage = (messageId, newContent) => {
    if (!socket || !newContent.trim()) return;
    socket.emit("edit_message", { messageId, content: newContent });
  };

  const handleDeleteMessage = async (messageId, deleteType) => {
  if (deleteType === "everyone") {
    // via socket — emits back to both users
    socket?.emit("delete_message", { messageId });
  } else {
    // "for me" — REST only, no socket needed
    try {
     await axiosInstance.delete(`http://localhost:3000/api/v1/messages/me/${messageId}`,
      {withCredentials:true}
     );
      dispatch(deleteMessage({ chatId, messageId })); 
    } catch (err) {
      console.error("Delete for me failed", err);
    }
  }
};

  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);

  if (!myId) return null;
  if (!chatId)
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center text-center p-6">
        <BiMessageRoundedDots size={70} className="text-secondary" />
        <h3 className="text-2xl font-semibold">A fresh new inbox</h3>
        <p className="text-gray-500">
          Start a conversation to see messages here.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-white relative">
      <ChatHeader
        otherUser={otherUser}
        isTyping={isTyping}
        isOnline={otherUser?.isOnline}
        lastActiveAt={otherUser?.lastActiveAt}
        onBack={() => navigate("/messages")}
      />

      <MessageList
        ref={containerRef}
        messages={messages}
        orderedMessages={orderedMessages}
        myId={myId}
        isTyping={isTyping}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
      />

      <ChatInput
        text={text}
        setText={setText}
        onSendMessage={handleSendMessage}
        onVoiceAssistant={() => setIsRecording(!isRecording)}
        onTyping={handleTypingAction}
        isRecording={isRecording}
      />
    </div>
  );
};

export default ChatWindow;
