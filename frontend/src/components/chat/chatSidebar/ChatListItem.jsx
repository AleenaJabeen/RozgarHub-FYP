import React from "react";
import { capitalizeWords } from "./../../../utils/capitalize";

const ChatListItem = React.memo(({ chat, myId, activeChatId, typingUserId, onClick }) => {
  const otherUser = chat.participants.find((p) => p._id !== myId);
  const unreadCount = chat.unreadCounts?.[myId] || 0;
  const isSelected = activeChatId === chat._id;
  const isTyping = typingUserId !== null && typingUserId !== undefined;

  return (
    <div
      onClick={onClick}
      className={`p-4 flex items-center gap-3 cursor-pointer transition-all ${
        isSelected ? "bg-blue-50 border-l-4 border-secondary" : "hover:bg-gray-50 border-l-4 border-transparent"
      }`}
    >
      <div className="relative flex-shrink-0">
        {otherUser?.avatar ? (
          <img
            src={otherUser?.avatar}
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover bg-gray-200"
          />
        ) : (
          <div className="flex justify-center items-center w-12 h-12 rounded-full text-secondary bg-secondary/20 ">
            <p>{otherUser?.name?.[0].toUpperCase()}</p>
          </div>
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border-2 border-white font-bold">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h4 className={`md:text-base text-sm truncate text-tertiary ${unreadCount > 0 ? "font-bold" : ""}`}>
            {capitalizeWords(otherUser?.name || "User")}
          </h4>
          <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
            {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
          </span>
        </div>
        <p className={`text-xs truncate mt-0.5 ${unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}>
          {isTyping ? "Typing..." : chat.lastMessage?.content || "No messages yet"}
        </p>
      </div>
    </div>
  );
});

export default ChatListItem;