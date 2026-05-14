import React, { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { BsCheck2All } from "react-icons/bs";
import { Pencil, Trash2 } from "lucide-react";
import { IoChevronDown } from "react-icons/io5";
import { MdDoNotDisturb } from "react-icons/md";
import AudioMessage from "./AudioMessage";

const MessageList = React.forwardRef(
  (
    {
      messages,
      orderedMessages,
      myId,
      isTyping,
      onEditMessage,
      onDeleteMessage,
    },
    ref,
  ) => {
    const [contextMenu, setContextMenu] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const editInputRef = useRef(null);

    useEffect(() => {
      const handler = () => setContextMenu(null);
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }, []);

    useEffect(() => {
      if (editingId && editInputRef.current) editInputRef.current.focus();
    }, [editingId]);

    const handleBubbleClick = (e, msg) => {
      e.stopPropagation();
      if (contextMenu?.msgId === msg._id) {
        setContextMenu(null);
        return;
      }

      const isMe = msg.senderId?._id === myId || msg.senderId === myId;

      // Pass the deleted status into the context menu state
      setContextMenu({
        msgId: msg._id,
        msgType: msg.type,
        isMe,
        isDeleted: msg.deletedForEveryone, // Add this
      });
    };

    const handleStartEdit = (msg) => {
      setContextMenu(null);
      setEditingId(msg._id);
      setEditText(msg.content);
    };

    const handleSaveEdit = () => {
      if (!editText.trim()) return;
      onEditMessage(editingId, editText);
      setEditingId(null);
      setEditText("");
    };

    const handleCancelEdit = () => {
      setEditingId(null);
      setEditText("");
    };

    const handleDelete = (msgId, type) => {
      setContextMenu(null);
      onDeleteMessage(msgId, type);
    };

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
      // Outer wrapper: flex-col so edit bar sits below scroll area
      <div className="flex flex-col flex-1 min-h-0 bg-secondary/10">
        {/* Scrollable message area */}
        <div
          ref={ref}
          className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col"
          onClick={() => setContextMenu(null)}
        >
          <div className="flex-grow" />

          <div className="space-y-4">
            {Array.isArray(messages) && messages.length > 0 ? (
              orderedMessages.map((msg, index) => {
                const isMe =
                  msg.senderId?._id === myId || msg.senderId === myId;
                const isEditingThis = editingId === msg._id;
                const isCtxOpen = contextMenu?.msgId === msg._id;

                return (
                  <div
                    key={msg._id || index}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {/* ✅ relative + inline-block so context menu anchors to bubble width */}
                    <div className="relative inline-block max-w-[75%]">
                      {/* Context menu */}
                      {isCtxOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute z-50 top-0 bg-white border border-gray-200 
      rounded-xl shadow-xl overflow-hidden min-w-[190px] animate-in fade-in zoom-in duration-100 ${
        isMe
          ? "right-full" // Appears to the left of your message
          : "left-full" // Appears to the right of their message
      }`}
                        >
                          {!msg.deletedForEveryone && (
                            <>
                              {contextMenu.isMe &&
                                contextMenu.msgType === "text" && (
                                  <button
                                    onClick={() => handleStartEdit(msg)}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200"
                                  >
                                    <Pencil size={14} /> Edit
                                  </button>
                                )}

                              {/* Delete for everyone — only my messages */}
                              {contextMenu.isMe && (
                                <button
                                  onClick={() =>
                                    handleDelete(msg._id, "everyone")
                                  }
                                  className="flex items-center gap-2 w-full text-nowrap px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200"
                                >
                                  <Trash2 size={14} /> Delete for everyone
                                </button>
                              )}
                            </>
                          )}
                          {/* Delete for me — available on ALL messages (mine + theirs) */}
                          <button
                            onClick={() => handleDelete(msg._id, "me")}
                            className="flex items-center gap-2 w-full text-nowrap px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200"
                          >
                            <Trash2 size={14} /> Delete for me
                          </button>
                        </div>
                      )}

                      {/* Bubble — no max-w here, parent controls it */}
                      {/* Bubble — logic updated for media */}
                      <div
                        className={`w-full rounded-2xl group px-3 py-2 transition-opacity ${
                          // If it's a media message (and NOT deleted), we remove the background and padding
                          msg.type !== "text" && !msg.deletedForEveryone
                            ? "bg-transparent shadow-none !p-0"
                            : isMe
                              ? "bg-secondary text-white rounded-tr-none shadow-sm"
                              : "bg-white text-gray-800 rounded-tl-none shadow-sm"
                        } ${
                          isMe && !msg.deletedForEveryone
                            ? "cursor-pointer select-none"
                            : "cursor-default"
                        } ${
                          editingId && !isEditingThis
                            ? "opacity-50"
                            : "opacity-100"
                        }`}
                      >
                        <div
                          className={`absolute top-1 ${isMe ? "right-1 text-gray-300" : "right-1 text-gray-400"} 
                        hidden group-hover:flex items-center justify-center 
                            transition-all cursor-pointer z-60 text-gray-200`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBubbleClick(e, msg, isMe);
                          }}
                        >
                          <IoChevronDown size={16} />
                        </div>

                        {msg.deletedForEveryone ? (
                          <p className="flex items-center gap-1 text-sm italic opacity-60 px-3 py-2">
                            <MdDoNotDisturb /> Message deleted
                          </p>
                        ) : msg.type === "text" ? (
                          <p className="text-sm break-words leading-relaxed px-1 py-2">
                            {msg.content}
                            {msg.isEdited && (
                              <span className="text-[10px] opacity-60 ml-1">
                                (edited)
                              </span>
                            )}
                          </p>
                        ) : (
                          <div className="overflow-hidden rounded-xl border border-gray-100/10">
                            {msg.type === "image" && (
                              <img
                                src={msg.mediaUrl}
                                alt="attachment"
                                className="rounded-xl max-h-60 w-full object-cover block"
                              />
                            )}
                            {msg.type === "video" && (
                              <video
                                src={msg.mediaUrl}
                                controls
                                className="rounded-xl max-h-60 w-full"
                              />
                            )}
                            {msg.type === "audio" && (
                              <div
                                className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
                              >
                                <AudioMessage msg={msg} isMe={isMe} />
                              </div>
                            )}
                          </div>
                        )}
                        {msg.type !== "audio" && (
                          <div
                            className={`${msg.type !== "text" ? "inline-flex p-1 bg-secondary rounded-2xl" : ""}  flex items-center justify-end gap-1 mt-1`}
                          >
                            <span
                              className={`text-[10px] ${isMe ? "text-gray-200" : "text-gray-400"}`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe && (
                              <span
                                className={`flex items-center ${msg.status === "read" ? "text-blue-300" : "text-blue-100"}`}
                              >
                                {renderStatus(msg.status)}
                              </span>
                            )}
                          </div>
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
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Edit bar — outside scroll area, always visible at bottom */}
        {editingId && (
          <div className="flex items-center gap-2 bg-white border-t border-gray-200 px-3 py-2 shrink-0">
            <Pencil size={14} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 shrink-0">Editing</span>
            <input
              ref={editInputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-secondary"
            />
            <button
              onClick={handleCancelEdit}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 shrink-0"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-white shrink-0"
            >
              Save
            </button>
          </div>
        )}
      </div>
    );
  },
);

export default MessageList;
