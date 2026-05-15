import React, { useState, useRef, useEffect } from "react";
import { capitalizeWords } from "./../../../utils/capitalize";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Mic as AudioIcon,
  Star,
  Archive,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { MdDoNotDisturb } from "react-icons/md";

const ChatListItem = React.memo(
  ({
    chat,
    myId,
    activeChatId,
    typingUserId,
    onClick,
    onStar,
    onArchive,
    onDelete,
  }) => {
    const otherUser = chat.participants.find((p) => p._id !== myId);

    const unreadCount = chat.unreadCounts?.[myId] || 0;

    const isSelected = activeChatId === chat._id;

    const isTyping = typingUserId !== null && typingUserId !== undefined;

    const [showMenu, setShowMenu] = useState(false);

    const longPressRef = useRef(null);

    // Desktop Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
      setShowMenu(true);
    };

    // Mobile Long Press
    const handleTouchStart = () => {
      longPressRef.current = setTimeout(() => {
        setShowMenu(true);
      }, 500);
    };

    const handleTouchEnd = () => {
      clearTimeout(longPressRef.current);
    };

    // Close menu on outside click
    useEffect(() => {
      const closeMenu = () => setShowMenu(false);

      window.addEventListener("click", closeMenu);

      return () => {
        window.removeEventListener("click", closeMenu);
      };
    }, []);

    return (
      <div
        className="relative"
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          onClick={onClick}
          className={`p-4 flex items-center gap-3 cursor-pointer transition-all ${
            isSelected
              ? "bg-blue-50 border-l-4 border-secondary"
              : "hover:bg-gray-50 border-l-4 border-transparent"
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
              <div className="flex justify-center items-center w-12 h-12 rounded-full text-secondary bg-secondary/20">
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
              <h4
                className={`md:text-base text-sm truncate text-tertiary ${
                  unreadCount > 0 ? "font-bold" : ""
                }`}
              >
                {capitalizeWords(otherUser?.name || "User")}
              </h4>

              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                {chat.lastMessageAt
                  ? new Date(chat.lastMessageAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : ""}
              </span>
            </div>

            <p
              className={`text-xs truncate mt-0.5 flex items-center gap-1 ${
                unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"
              }`}
            >
              {isTyping ? (
                <span className="text-secondary">Typing...</span>
              ) : !chat.lastMessage ? (
                "No messages yet"
              ) : chat.lastMessage.deletedForEveryone ? (
                <span className="flex gap-1 items-center italic opacity-60"><MdDoNotDisturb/> Message deleted</span>
              ) : (
                <>
                  {chat.lastMessage.type === "image" && (
                    <>
                      <ImageIcon size={14} className="shrink-0" />
                      <span>Photo</span>
                    </>
                  )}
                  {chat.lastMessage.type === "video" && (
                    <>
                      <VideoIcon size={14} className="shrink-0" />
                      <span>Video</span>
                    </>
                  )}
                  {chat.lastMessage.type === "audio" && (
                    <>
                      <AudioIcon size={14} className="shrink-0" />
                      <span>Audio</span>
                    </>
                  )}
                  {chat.lastMessage.type === "text" && chat.lastMessage.content}
                </>
              )}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="cursor-pointer p-1 rounded-full hover:bg-gray-100"
          >
            <MoreVertical size={18} />
          </button>
        </div>

        {/* MENU */}
        {showMenu && (
          <div className="absolute right-4 top-14 z-50 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-150">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(chat._id);
                setShowMenu(false);
              }}
              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 text-sm"
            >
              <Trash2 size={16} />
              Delete Chat
            </button>
          </div>
        )}
      </div>
    );
  },
);

export default ChatListItem;
