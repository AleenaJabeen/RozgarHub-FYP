import React, { useEffect } from 'react';
import ChatSidebar from '../../components/chat/ChatSidebar';
import { useParams, Outlet } from 'react-router-dom'; // Import Outlet
import { connectSocket } from '../../socket/socket';
import { useSelector } from 'react-redux';

function Chat() {
  const { chatId } = useParams();

  return (
    /* h-screen and overflow-hidden are correct here to prevent the WHOLE page from scrolling */
    <div className="flex w-full overflow-hidden bg-white" style={{ height: 'calc(100vh - 79px)' }}>
      
      {/* Sidebar: Logic to hide on mobile when a chat is active */}
      <div className={`
        ${chatId ? 'hidden' : 'block'} 
        md:block 
        w-full md:w-80 
        md:flex-shrink-0 
        h-full border-r border-gray-200
        overflow-y-auto
        overflow-x-hidden  
      `}>
        <ChatSidebar />
      </div>

      {/* Main Area: Logic to hide on mobile when NO chat is active */}
      <div className={`
        ${!chatId ? 'hidden' : 'block'} 
        md:flex // Ensure it shows as flex on desktop even if chatId is missing
        flex-1 
        min-w-0 
        h-full 
        flex flex-col 
      `}>
        {/* 
            REPLACE <ChatWindow /> with <Outlet /> 
            This allows the router to pick between your "No Chat" view and the "Chat Window"
        */}
        <Outlet />
      </div>
      
    </div>
  );
}

export default Chat;