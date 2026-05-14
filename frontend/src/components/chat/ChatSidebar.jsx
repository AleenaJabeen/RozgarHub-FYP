import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteChat,
  fetchMyChats,
  markAsRead,
  resetUnreadCount,
  toggleArchived,
  toggleStarred,
} from "../../store/chat/chatSlice";
import { useNavigate, useParams } from "react-router-dom";
import { TbMessageCircleSearch } from "react-icons/tb";
import { getSocket } from "../../socket/socket";
import { capitalizeWords } from "../../utils/capitalize";

// Sub-components
import ChatHeader from "./chatSidebar/ChatHeader";
import ChatListItem from "./chatSidebar/ChatListItem";

const ChatSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = getSocket();
  const { chatId: activeChatId } = useParams();

  const [typingUsers, setTypingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { items: chats = [], loading = false } = useSelector(
    (state) => state.chats || {},
  );
  const myId = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    dispatch(fetchMyChats());
  }, [dispatch]);

  useEffect(() => {
  if (!socket) return;

  const handleMessagesRead = ({ chatId }) => {
    // When the other person reads your messages, reset their unread count
    dispatch(resetUnreadCount({ chatId, userId: myId }));
  };

  socket.on("messages_read", handleMessagesRead);
  return () => socket.off("messages_read", handleMessagesRead);
}, [socket, myId]);

  useEffect(() => {
    if (!socket) return;
    const handleTyping = ({ chatId, isTyping, userId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [chatId]: isTyping ? userId : null,
      }));
    };

    socket.on("user_typing", handleTyping);
    return () => socket.off("user_typing", handleTyping);
  }, [socket]);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const otherUser = chat.participants.find((p) => p._id !== myId);
      const userName = otherUser?.name?.toLowerCase() || "";
      const matchesSearch = userName.includes(searchQuery.toLowerCase());
      const unreadCount = chat.unreadCounts?.[myId] || 0;

      switch (filterType) {
        case "unread":
          return matchesSearch && unreadCount > 0;
        case "starred":
          return matchesSearch && chat.isStarred;
        case "archived":
          return matchesSearch && chat.isArchived;
        default:
          return matchesSearch && !chat.isArchived;
      }
    });
  }, [chats, searchQuery, filterType, myId]);

  if (loading && chats.length === 0) {
    return (
      <div className="w-80 h-full border-r border-gray-300 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-auto">
      <div className="border-b border-gray-200 p-4">
        <ChatHeader
          filterType={filterType}
          setFilterType={setFilterType}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          setSearchQuery={setSearchQuery}
        />

        {isSearchOpen && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none"
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="w-full h-full overflow-y-auto scrollbar-hide">
        {filteredChats.length === 0 ? (
          <div className="w-74 mx-auto flex flex-col items-center justify-center h-full p-6 text-center rounded-xl">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <TbMessageCircleSearch size={70} className="text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-tertiary">
              No Conversations
            </h3>
            <p className="text-base text-tertiary mt-2 px-4">
              There are no conversations under "
              {capitalizeWords(
                filterType === "all" ? "All messages" : filterType,
              )}
              "{searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                myId={myId}
                activeChatId={activeChatId}
                typingUserId={typingUsers[chat._id]}
                onClick={() => {
                  if (chat._id === activeChatId) return;
                  dispatch(markAsRead({chatId: chat._id , myId}));
                  navigate(`/messages/${chat._id}`);
                }}
                onStar={(chatId) => dispatch(toggleStarred(chatId))}
                onArchive={(chatId) => dispatch(toggleArchived(chatId))}
                onDelete={(chatId) => {
                  dispatch(deleteChat(chatId)).then(() => {
                    if (chatId === activeChatId) {
                      navigate("/messages");
                    }
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
