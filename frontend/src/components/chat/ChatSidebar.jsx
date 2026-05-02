// src/components/chat/ChatSidebar.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyChats } from '../../store/chat/chatSlice';
import { useNavigate, useParams } from 'react-router-dom';

const ChatSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatId: activeChatId } = useParams();
const { items: chats = [], loading = false } = useSelector((state) => state.chats || {});
  const myId = useSelector((state) => state.auth.user?._id); // Adjust based on your auth state

  useEffect(() => {
    dispatch(fetchMyChats());
  }, [dispatch]);

  if (loading) return <div className="p-4">Loading chats...</div>;

  return (
    <div className="w-80 h-full border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">Messages</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <p className="p-4 text-gray-500 text-sm">No conversations yet.</p>
        ) : (
          chats.map((chat) => {
            // Find the other participant's name
            const otherUser = chat.participants.find(p => p._id !== myId);
            const unreadCount = chat.unreadCounts?.[myId] || 0;
            const isSelected = activeChatId === chat._id;

            return (
              <div
                key={chat._id}
                onClick={() => navigate(`/messages/${chat._id}`)}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? "bg-blue-50 border-r-4 border-blue-500" : ""
                }`}
              >
                {/* Gig Image or User Avatar */}
                <div className="relative">
                  <img 
                    src={chat.gigId?.images?.[0] || 'https://via.placeholder.com/40'} 
                    alt="gig" 
                    className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {otherUser?.name || "User"}
                    </h3>
                    <span className="text-[10px] text-gray-400">
                      {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-blue-600 font-medium truncate mb-1">
                    Re: {chat.gigId?.title}
                  </p>
                  
                  <p className="text-xs text-gray-500 truncate">
                    {chat.lastMessage?.content || (chat.lastMessage?.type !== 'text' ? 'Sent an attachment' : 'No messages yet')}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;