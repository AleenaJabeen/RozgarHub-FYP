import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMessages } from "../../store/chat/messageSlice";
import { useSocket } from "../../hooks/useSocket";
import { getSocket } from "../../socket/socket";
import { BiMessageRoundedDots } from "react-icons/bi";

import ChatHeader from "./chatWindow/ChatHeader";
import MessageList from "./chatWindow/MessageList";
import ChatInput from "./chatWindow/ChatInput";

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
  const messages = useSelector((state) => state.messages?.byChat?.[chatId] || []);
  const chats = useSelector((state) => state.chats?.items || []);
  const chatData = chats.find((c) => c._id === chatId);
  const otherUser = chatData?.participants?.find((p) => p._id !== myId);

  useSocket(chatId);

  // Sockets & Typing
  useEffect(() => {
    if (!socket) return;
    const handleTyping = ({ userId, isTyping }) => {
      if (userId === otherUser?._id) setIsTyping(isTyping);
    };
    socket.on("user_typing", handleTyping);
    return () => socket.off("user_typing", handleTyping);
  }, [socket, otherUser]);

  useEffect(() => {
    if (chatId) dispatch(fetchMessages({ chatId }));
  }, [chatId, dispatch]);

  // Scroll Logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const threshold = 150;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

    if (messages.length > prevLengthRef.current) {
      const lastMessage = messages[messages.length - 1];
      const isMe = lastMessage.senderId?._id === myId || lastMessage.senderId === myId;
      if (isMe || isNearBottom) {
        requestAnimationFrame(() => {
          container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
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

  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);

  if (!myId) return null;
  if (!chatId) return (
    <div className="flex flex-col h-full bg-white items-center justify-center text-center p-6">
      <BiMessageRoundedDots size={70} className="text-secondary" />
      <h3 className="text-2xl font-semibold">A fresh new inbox</h3>
      <p className="text-gray-500">Start a conversation to see messages here.</p>
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
