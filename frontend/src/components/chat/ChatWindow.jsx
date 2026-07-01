import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector ,shallowEqual} from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  clearChatMessages,
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
     shallowEqual 
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

    const handleStatusUpdate = ({
      messageIds,
      messageId,
      status,
      chatId: updatedChatId,
    }) => {
      if (updatedChatId !== chatId) return;

      // Handle both single ID or array of IDs from backend
      const idsToUpdate = messageIds || [messageId];

      idsToUpdate.forEach((id) => {
        dispatch(
          updateMessageStatus({
            messageId: id,
            status,
            chatId,
          }),
        );
      });
    };

    socket.on("message_status_updated", handleStatusUpdate);
    // Also listen for the specific 'messages_read' event if your backend uses it
    socket.on("messages_read", handleStatusUpdate);

    return () => {
      socket.off("message_status_updated", handleStatusUpdate);
      socket.off("messages_read", handleStatusUpdate);
    };
  }, [socket, chatId, dispatch]);

  // Inside ChatWindow.js
useEffect(() => {
   if (!chatId || !socket || !myId) return;

  const unreadMessageIds = messages
    .filter((msg) => {
      // Logic to ensure we don't mark our OWN messages as read
      const senderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
      return senderId !== myId && msg.status !== "read";
    })
    .map((msg) => msg._id);

  if (unreadMessageIds.length > 0) {
    socket.emit("messages_read", {
      chatId,
      messageIds: unreadMessageIds,
    });
  }
}, [myId, chatId,messages]);
 

  useEffect(() => {
    if (chatId) dispatch(fetchMessages({ chatId }));
  }, [chatId, dispatch]);
  useEffect(() => {
    if (!chatId) return;
    dispatch(markAsRead({ chatId, myId }));
  }, [chatId,myId, dispatch]);
  // Scroll Logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const threshold = 150;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold;

    if (messages.length > prevLengthRef.current) {
      const lastMessage = messages[0];
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
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/messages/me/${messageId}`,
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
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const file = new File([audioBlob], "voice_message.webm", {
            type: "audio/webm",
          });

          // Use your existing media handler
          handleSendMedia(file, "audio");

          // Stop all tracks to release the microphone
          stream.getTracks().forEach((track) => track.stop());
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
      formData.append("type", type); 
      formData.append("content", "");
      formData.append("file", file);

      await dispatch(sendMessage(formData));
      dispatch(fetchMessages({ chatId }));
    } catch (error) {
      console.error("Failed to send media", error);
      // toast.error("Failed to send media");
    }
  };
  useEffect(() => {
    return () => {
      dispatch(clearChatMessages(chatId));
    };
  }, [chatId]);

  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);

  if (!myId) return null;
  if (chatId && !chatData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }
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
        onBack={() => navigate('/messages')}
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
