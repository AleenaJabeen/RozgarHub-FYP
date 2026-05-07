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
      `}>
        <ChatSidebar />
      </div>

      {/* Chat Window */}
      <div className={`
        ${!chatId ? 'hidden' : 'block'} 
        flex-1 
        min-w-0 
        h-full
      `}>
        <ChatWindow />
      </div>
      
    </div>
  );
}

export default Chat;