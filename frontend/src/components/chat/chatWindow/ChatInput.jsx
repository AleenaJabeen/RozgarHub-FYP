import React from "react";
import { useRef } from "react";
import { IoHappyOutline, IoAdd, IoCameraOutline, IoSend, IoMicOutline } from "react-icons/io5";
import { MdOutlineInsertPhoto } from "react-icons/md";

const ChatInput = ({ text, setText, onSendMessage,onSendMedia, onVoiceAssistant, onTyping, isRecording }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Determine type based on file extension/mime
    let type = "image";
    if (file.type.startsWith("video/")) type = "video";
    if (file.type.startsWith("audio/")) type = "audio";

    onSendMedia(file, type);
    
    // Clear input so same file can be re-selected if needed
    e.target.value = null;
  };
  return (
    <div className="flex-shrink-0 bg-[#f0f2f5] sm:p-3 p-2 flex items-center gap-1 border-t border-gray-200">
      <div className="flex items-center bg-white rounded-full px-3 py-1 flex-1 shadow-sm">
        {!isRecording && (
        <button onClick={() => fileInputRef.current.click()} className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
          <MdOutlineInsertPhoto size={28} />
          <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*,audio/*"
        className="hidden"
      />
        </button>
        )}
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping();
          }}
          placeholder="Type a message"
          className="flex-1 bg-transparent border-none px-2 py-2 focus:ring-0 outline-none text-[15px]"
        />
      </div>

     <button
        onClick={text.trim() ? onSendMessage : onVoiceAssistant}
        className={`sm:p-3 p-2 rounded-full flex items-center justify-center transition-all shadow-md text-white 
          ${isRecording ? "bg-red-500 animate-pulse" : "bg-[#00a884]"}`}
      >
        {text.trim() ? (
          <IoSend className="sm:ml-1 ml-0 sm:text-xl text-xl" />
        ) : (
          <IoMicOutline className="sm:text-xl text-xl" />
        )}
      </button>
    </div>
  );
};

export default ChatInput;