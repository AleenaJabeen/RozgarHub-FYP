import React from "react";
import { IoArrowBack, IoEllipsisVertical } from "react-icons/io5";
import { capitalizeWords } from "../../../utils/capitalize";
import { formatLastSeen } from "../../../utils/formatLastSeen";
import { useNavigate } from "react-router-dom";

const ChatHeader = ({
  otherUser,
  isTyping,
  isOnline,
  lastActiveAt,
  onBack,
}) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (otherUser?._id) {
      navigate(`/user-info/${otherUser._id}`);
    }
  };
  return (
    <div className="sticky h-18 top-0 z-10 bg-white px-4 py-2 border-b border-gray-200 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <IoArrowBack size={24} className="text-gray-600" />
        </button>
        <div
          onClick={handleProfileClick}
          className="flex items-center gap-3 cursor-pointer"
        >
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
          <div>
            <h3 className="font-bold text-gray-800">
              {capitalizeWords(otherUser?.name)}
            </h3>
            <p
              className={`text-xs font-medium truncate w-48 sm:w-auto ${
                isTyping || isOnline ? "text-secondary" : "text-gray-500"
              }`}
            >
              {isTyping
                ? "typing..."
                : isOnline
                  ? "online"
                  : formatLastSeen(lastActiveAt)}
            </p>
          </div>
        </div>
      </div>
      <button className="p-2 hover:bg-gray-100 rounded-full">
        <IoEllipsisVertical />
      </button>
    </div>
  );
};

export default ChatHeader;
