import React from 'react'
import ChatSidebar from '../../components/chat/ChatSidebar'
import ChatWindow from '../../components/chat/ChatWindow'
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { connectSocket } from '../../socket/socket';

function Chat() {
  
  
    useEffect(() => {
  // Just call it; the browser will handle sending the cookie automatically
  connectSocket(); 
}, []);
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <ChatSidebar />
      <ChatWindow />
    </div>
  )
}

export default Chat;
