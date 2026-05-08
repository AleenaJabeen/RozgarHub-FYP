import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyChats } from "../../store/chat/chatSlice";
import { useNavigate, useParams } from "react-router-dom";
import { capitalizeWords } from "../../utils/capitalize";
import { Search, ChevronDown, X } from "lucide-react";
import { TbMessageCircleSearch } from "react-icons/tb"; 

const ChatSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatId: activeChatId } = useParams();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); 
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { items: chats = [], loading = false } = useSelector(
    (state) => state.chats || {},
  );
  const myId = useSelector((state) => state.auth.user?._id);

  // Fetch only once on mount to prevent infinite scroll-reset loops
  useEffect(() => {
    dispatch(fetchMyChats());
  }, [dispatch]);

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
<div className="w-full  h-full  bg-white flex flex-col overflow-hidden">      {/* Header Container - Fixed Height to prevent scroll jumps */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center h-10">
          <div className="relative inline-block">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-transparent pr-8 py-1 text-lg font-semibold text-tertiary  cursor-pointer focus:outline-none z-10 relative"
            >
              <option value="all">All messages</option>
              <option value="unread">Unread messages</option>
              <option value="starred">Starred messages</option>
              <option value="archived">Archived messages</option>
            </select>
            <ChevronDown size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-tertairy" />
          </div>
          
          <button 
            onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if(isSearchOpen) setSearchQuery(""); // Reset search when closing
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} className="text-tertiary" />}
          </button>
        </div>

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

      {/* Chat List - The scrollable area */}
      <div className="w-full overflow-y-auto scrollbar-hide">
        {filteredChats.length === 0 ? (
          <div className="w-74 mx-auto flex flex-col items-center justify-center h-full p-6 text-center  rounded-xl">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
               <TbMessageCircleSearch size={70} className="text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-tertiary">No Conversations</h3>
            <p className="text-base text-tertiary mt-2 px-4">
              There are no conversations under "{capitalizeWords(filterType === 'all' ? 'All messages' : filterType)}" 
              {capitalizeWords(searchQuery && ` matching "${searchQuery}"`)}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredChats.map((chat) => {
              const otherUser = chat.participants.find((p) => p._id !== myId);
              const unreadCount = chat.unreadCounts?.[myId] || 0;
              const isSelected = activeChatId === chat._id;
              
              return (
                <div
                  key={chat._id}
                  onClick={() => navigate(`/messages/${chat._id}`)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected ? "bg-blue-50 border-l-4 border-secondary" : "hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {otherUser?.avatar?
                    (<img
                      src={otherUser?.avatar}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover bg-gray-200"
                    />):(
                      <div className="flex justify-center items-center w-12 h-12 rounded-full text-secondary bg-secondary/20 ">
                        <p>{otherUser?.name[0].toUpperCase()}</p>
                      </div>
                    ) }
                    
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
                      {chat.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;