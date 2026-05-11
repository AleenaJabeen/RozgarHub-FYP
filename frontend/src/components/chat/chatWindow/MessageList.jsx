import React from "react";
import { Check, CheckCheck } from "lucide-react";
import { BsCheck2All } from "react-icons/bs";

const MessageList = React.forwardRef(
  ({ messages, orderedMessages, myId, isTyping }, ref) => {
    const renderStatus = (status) => {
      switch (status) {
        case "sent":
          return <Check size={16} />;

        case "delivered":
          return <BsCheck2All size={16} />;

        case "read":
          return <BsCheck2All size={16} className="text-blue-500" />;

        default:
          return null;
      }
    };
    return (
      <div
        ref={ref}
        className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col bg-secondary/10"
      >
        {/* Spacer to push messages to bottom */}
        <div className="flex-grow" />

        <div className="space-y-4">
          {Array.isArray(messages) && messages.length > 0 ? (
            orderedMessages.map((msg, index) => {
              const isMe = msg.senderId?._id === myId || msg.senderId === myId;
              return (
               <div
  key={msg._id || index}
  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
>
  <div
    className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${
      isMe
        ? "bg-secondary text-white rounded-tr-none"
        : "bg-white text-gray-800 rounded-tl-none"
    }`}
  >
    {msg.type === "text" ? (
      <p className="text-sm break-words leading-relaxed">
        {msg.content}
      </p>
    ) : (
      <img
        src={msg.mediaUrl}
        alt="attachment"
        className="rounded-lg max-h-60 w-full object-cover"
      />
    )}

    {/* footer */}
    <div className="flex items-center justify-end gap-1 mt-1">
      <span
        className={`text-[10px] ${
          isMe ? "text-blue-100" : "text-gray-400"
        }`}
      >
        {new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>

      {isMe && (
        <span
          className={`flex items-center ${
            msg.status === "seen"
              ? "text-blue-300"
              : "text-blue-100"
          }`}
        >
          {renderStatus(msg.status)}
        </span>
      )}
    </div>
  </div>
</div>
              );
            })
          ) : (
            <div className="text-center text-gray-400 mb-10">
              No messages yet. Say Hi!
            </div>
          )}
        </div>

        {isTyping && (
          <div className="flex justify-start mt-3">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default MessageList;
