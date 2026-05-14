import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteMessage,
  fetchMessages,
  sendMessage,
  updateMessageStatus,
} from "../../store/chat/messageSlice";
import { useSocket } from "../../hooks/useSocket";
import { getSocket } from "../../socket/socket";
import { BiMessageRoundedDots } from "react-icons/bi";

import ChatHeader from "./chatWindow/ChatHeader";
import MessageList from "./chatWindow/MessageList";
import ChatInput from "./chatWindow/ChatInput";
import axiosInstance from "axios";
import { markAsRead } from "../../store/chat/chatSlice";


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
  useEffect(() => {
    if (!chatId || !messages.length) return;
    dispatch(markAsRead(chatId));
  }, [chatId, messages.length, dispatch]);

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
        await axiosInstance.delete(
          `http://localhost:3000/api/v1/messages/me/${messageId}`,
          { withCredentials: true },
        );
        dispatch(deleteMessage({ chatId, messageId }));
      } catch (err) {
        console.error("Delete for me failed", err);
      }
    }
  };
  const mediaRecorderRef = useRef(null);
 const audioChunksRef = useRef([]);

 const handleVoiceAssistant = async () => {
  if (!isRecording) {
    // Start Recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });
        
        // Use your existing media handler
        handleSendMedia(file, "audio");
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  } else {
    // Stop Recording
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }
};

  // Inside ChatWindow component...

  const handleSendMedia = async (file, type) => {
    try {
      // 1. Create FormData
      const formData = new FormData();
      formData.append("chatId", chatId);
      formData.append("type", type); // 'image', 'video', or 'audio'
      formData.append("content", ""); // Optional text content
      formData.append("file", file); // This matches req.file in your backend

      await dispatch(sendMessage(formData));
    } catch (error) {
      console.error("Failed to send media", error);
      // toast.error("Failed to send media");
    }
  };

  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);

  if (!myId) return null;

  if (chatId && chatData && !messages.length && !otherUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

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
        onSendMedia={handleSendMedia}
        onVoiceAssistant={handleVoiceAssistant}
        onTyping={handleTypingAction}
        isRecording={isRecording}
      />
    </div>
  );
};

export default ChatWindow;
