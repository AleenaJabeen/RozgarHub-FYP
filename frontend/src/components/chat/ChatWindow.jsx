// src/components/chat/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchMessages, appendMessage } from '../../store/chat/messageSlice';
import { useSocket } from '../../hooks/useSocket';
import { getSocket } from '../../socket/socket';
import { IoSend, IoImageOutline, IoEllipsisVertical } from 'react-icons/io5';
import axios from 'axios';

const ChatWindow = () => {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const socket = getSocket();
  const scrollRef = useRef();

  const [text, setText] = useState("");
  const myId = useSelector((state) => state.auth.user._id);
 const messages = useSelector((state) => state.messages?.byChat?.[chatId] || []);
const chats = useSelector(state => state.chats?.items || []);
const chatData = chats.find(c => c._id === chatId); // Do this outside useSelector
  // Use your custom hook to handle socket listeners
  useSocket(chatId);

  useEffect(() => {
    if (chatId) {
      dispatch(fetchMessages({ chatId, page: 1 }));
    }
  }, [chatId, dispatch]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const handleSendMessage = (e) => {
  e.preventDefault();
  const currentSocket = getSocket();

  if (!text.trim() || !currentSocket) return;

  // REMOVE the dispatch(appendMessage) here. 
  // Let the socket.on("new_message") handle it so both users are in sync.

  currentSocket.emit("send_message", {
    chatId,
    content: text,
    type: "text",
  });

  setText("");
};
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatId", chatId);
    formData.append("type", "image");

    try {
      // Media must go through HTTP POST (Multer -> Cloudinary)
      await axios.post("/api/v1/message", formData);
      // Backend sendMessage controller will emit "new_message" via socket
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  if (!chatId) return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
      Select a chat to start messaging
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <img 
            src={chatData?.gigId?.images?.[0] || 'https://via.placeholder.com/40'} 
            className="w-10 h-10 rounded-full object-cover" 
          />
          <div>
            <h3 className="font-bold text-gray-800">
              {chatData?.participants.find(p => p._id !== myId)?.name}
            </h3>
            <p className="text-xs text-secondary font-medium truncate w-48 sm:w-auto">
              Re: {chatData?.gigId?.title}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full"><IoEllipsisVertical /></button>
      </div>

     <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
  {Array.isArray(messages) && messages.length > 0 ? (
    [...messages].reverse().map((msg, index) => {
      const isMe = msg.senderId?._id === myId || msg.senderId === myId;

      return (
        <div
          key={msg._id || index}
          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
              isMe
                ? "bg-secondary text-white rounded-tr-none"
                : "bg-white text-gray-800 rounded-tl-none"
            }`}
          >
            {msg.type === "text" ? (
              <p className="text-sm">{msg.content}</p>
            ) : (
              <img
                src={msg.mediaUrl}
                className="rounded-lg max-h-60 w-full object-cover"
              />
            )}

            <div
              className={`text-[10px] mt-1 flex justify-end ${
                isMe ? "text-blue-100" : "text-gray-400"
              }`}
            >
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      );
    })
  ) : (
    <div className="text-center text-gray-400 mt-10">
      No messages yet. Say Hi!
    </div>
  )}

  {/* ✅ correct placement */}
  <div ref={scrollRef} />
</div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex items-center gap-2">
        <label className="p-2 text-gray-500 hover:text-secondary cursor-pointer">
          <IoImageOutline size={24} />
          <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
        </label>
        
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-secondary outline-none"
        />
        
        <button 
          type="submit" 
          disabled={!text.trim()}
          className="p-3 bg-secondary text-white rounded-full hover:bg-opacity-90 disabled:bg-gray-300 transition-all"
        >
          <IoSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;