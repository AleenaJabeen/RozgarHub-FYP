import React from "react";

const MessageList = React.forwardRef(({ messages, orderedMessages, myId, isTyping }, ref) => {
  return (
    <div ref={ref} className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col bg-secondary/10">
      {/* Spacer to push messages to bottom */}
      <div className="flex-grow" />

      <div className="space-y-4">
        {Array.isArray(messages) && messages.length > 0 ? (
          orderedMessages.map((msg, index) => {
            const isMe = msg.senderId?._id === myId || msg.senderId === myId;
            return (
              <div key={msg._id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`relative max-w-[70%] rounded-2xl px-3 py-3 pr-10 shadow-sm ${
                  isMe ? "bg-secondary text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none"
                }`}>
                  {msg.type === "text" ? (
                    <p className="text-sm break-words leading-snug">{msg.content}</p>
                  ) : (
                    <img src={msg.mediaUrl} alt="attachment" className="rounded-lg max-h-60 w-full object-cover" />
                  )}
                  <span className={`absolute bottom-0 right-1 pr-1 text-[10px] ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 mb-10">No messages yet. Say Hi!</div>
        )}
      </div>

      {isTyping && (
        <div className="flex justify-start mt-3">
          <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
            <div className="flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default MessageList;