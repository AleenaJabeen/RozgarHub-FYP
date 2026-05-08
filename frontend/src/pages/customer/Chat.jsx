import React, { useEffect } from 'react';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatWindow from '../../components/chat/ChatWindow';
import { useParams } from 'react-router-dom';
import { connectSocket } from '../../socket/socket';

function Chat() {
  const { chatId } = useParams();

  useEffect(() => {
    connectSocket();
  }, []);

  return (
    /* h-screen and overflow-hidden are correct here to prevent the WHOLE page from scrolling */
    <div className="flex h-screen w-full overflow-hidden bg-white">
      
      {/* Sidebar */}
      <div className={`
        ${chatId ? 'hidden' : 'block'} 
        md:block 
        w-full md:w-80 
        md:flex-shrink-0 
        h-full border-r border-gray-200
        overflow-y-auto
        overflow-x-hidden   // 3. Ensure the sidebar can scroll independently
      `}>
        <ChatSidebar />
      </div>

      {/* Chat Window */}
     <div className={`
        ${!chatId ? 'hidden' : 'block'} 
        flex-1 
        min-w-0 
        h-full           // 4. Forces the window wrapper to take full height
        flex flex-col    // 5. Allows inner message list to expand
      `}>
        <ChatWindow />
      </div>
      
    </div>
  );
}

export default Chat;