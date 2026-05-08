import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMessages, appendMessage } from "../../store/chat/messageSlice";
import { useSocket } from "../../hooks/useSocket";
import { getSocket } from "../../socket/socket";
import {
  IoSend,
  IoImageOutline,
  IoEllipsisVertical,
  IoHappyOutline,
  IoAdd,
  IoCameraOutline,
  IoMicOutline,
  IoArrowBack,
} from "react-icons/io5";
import axios from "axios";
import { capitalizeWords } from "../../utils/capitalize";
import { BiMessageRoundedDots } from "react-icons/bi";

const ChatWindow = () => {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = getSocket();
  const scrollRef = useRef();

  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const myId = useSelector((state) => state.auth.user._id);
  const messages = useSelector(
    (state) => state.messages?.byChat?.[chatId] || [],
  );
  console.log("RAW API:", messages);
  const chats = useSelector((state) => state.chats?.items || []);
  const chatData = chats.find((c) => c._id === chatId);
  const otherUser = chatData?.participants?.find((p) => p._id !== myId);
  // Use your custom hook to handle socket listeners
  useSocket(chatId);

  useEffect(() => {
    if (chatId) {
      dispatch(fetchMessages({ chatId }));
    }
  }, [chatId, dispatch]);

  const containerRef = useRef();
  const prevLengthRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (messages.length > prevLengthRef.current && isNearBottom) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevLengthRef.current = messages.length;
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
  // Mock function for voice assistant/recording
  const handleVoiceAssistant = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      console.log("Listening...");
    }
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
      await axios.post("http://localhost:3000/api/v1/messages", formData);
      // Backend sendMessage controller will emit "new_message" via socket
    } catch (err) {
      console.error("Upload failed", err);
    }
  };
  const orderedMessages = React.useMemo(() => {
    return [...messages].reverse();
  }, [messages]);
  if (!chatId)
    return (
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <BiMessageRoundedDots size={70} className="text-secondary" />
        <h3 className="text-2xl font-semibold">A fresh new inbox</h3>
        <p className="text-base">
          You haven't started any conversations yet, but when you do, you'll
          find them here.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-white relative ">
      {/* Header */}
<div className="sticky h-18 top-0 z-10 bg-white px-4 py-2 border-b border-gray-200 flex justify-between items-center shadow-sm">        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/messages")}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <IoArrowBack size={24} className="text-gray-600" />
          </button>
          {otherUser?.avatar ? (
            <img
              src={otherUser?.avatar}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover bg-gray-200"
            />
          ) : (
            <div className="flex justify-center items-center w-12 h-12 rounded-full text-secondary bg-secondary/20">
              <p>{otherUser?.name[0].toUpperCase()}</p>
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-800">
              {capitalizeWords(otherUser?.name)}
            </h3>
            <p className="text-xs text-secondary font-medium truncate w-48 sm:w-auto">
              online
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <IoEllipsisVertical />
        </button>
      </div>
{/* messages area */}
     <div
  ref={containerRef}
  /* 1. Remove justify-end */
  className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col bg-secondary/10"
>
  {/* 2. ADD THIS SPACER: It takes up all empty space, pushing messages to the bottom */}
  <div className="flex-grow" />

  <div className="space-y-4">
    {Array.isArray(messages) && messages.length > 0 ? (
      orderedMessages.map((msg, index) => {
        const isMe = msg.senderId?._id === myId || msg.senderId === myId;

        return (
          <div
            key={msg._id || index}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative max-w-[70%] rounded-2xl px-3 py-3 pr-10 shadow-sm ${
                isMe
                  ? "bg-secondary text-white rounded-tr-none"
                  : "bg-white text-gray-800 rounded-tl-none"
              }`}
            >
              {msg.type === "text" ? (
                <p className="text-sm break-words leading-snug">
                  {msg.content}
                </p>
              ) : (
                <img
                  src={msg.mediaUrl}
                  alt="attachment"
                  className="rounded-lg max-h-60 w-full object-cover"
                />
              )}

              <span
                className={`absolute bottom-0 right-1 pr-1 text-[10px] ${
                  isMe ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        );
      })
    ) : (
      /* 3. Wrap this to ensure it stays centered if you want */
      <div className="text-center text-gray-400 mb-10">
        No messages yet. Say Hi!
      </div>
    )}
  </div>
</div>
      {/* input area */}
      <div className="flex-shrink-0 bg-[#f0f2f5] sm:p-3 p-2 flex items-center gap-1 border-t border-gray-200">
        {/* Media & Emoji Group */}
        <div className="flex items-center bg-white rounded-full px-3 py-1 flex-1 shadow-sm">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <IoHappyOutline size={26} />
          </button>

          <label className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
            <IoAdd size={28} />
            <input type="file" hidden accept="image/*,video/*" />
          </label>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-transparent border-none px-2 py-2 focus:ring-0 outline-none text-[15px]"
          />

          <button className="p-2 text-gray-500 hover:text-gray-700">
            <IoCameraOutline size={26} />
          </button>
        </div>

        {/* Dynamic Action Button: Send or Mic */}
        <button
          onClick={text.trim() ? handleSendMessage : handleVoiceAssistant}
          className={`sm:p-3 p-2 rounded-full flex items-center justify-center transition-all shadow-md ${
            text.trim() ? "bg-[#00a884] text-white" : "bg-[#00a884] text-white"
          }`}
        >
          {text.trim() ? (
            <IoSend  className="sm:ml-1 ml-0 sm:text-xl text-xl" />
          ) : (
            <IoMicOutline
             
              className={`sm:text-xl text-xl {isRecording ? "animate-pulse text-red-200" : ""}`}
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
