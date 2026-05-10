import React from "react";
import { IoHappyOutline, IoAdd, IoCameraOutline, IoSend, IoMicOutline } from "react-icons/io5";

const ChatInput = ({ text, setText, onSendMessage, onVoiceAssistant, onTyping, isRecording }) => {
  return (
    <div className="flex-shrink-0 bg-[#f0f2f5] sm:p-3 p-2 flex items-center gap-1 border-t border-gray-200">
      <div className="flex items-center bg-white rounded-full px-3 py-1 flex-1 shadow-sm">
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <IoHappyOutline size={26} />
        </button>
        <label className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
          <IoAdd size={28} />
          <input type="file" hidden accept="image/*,video/*" />
        </label>
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
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <IoCameraOutline size={26} />
        </button>
      </div>

      <button
        onClick={text.trim() ? onSendMessage : onVoiceAssistant}
        className="sm:p-3 p-2 rounded-full flex items-center justify-center transition-all shadow-md bg-[#00a884] text-white"
      >
        {text.trim() ? (
          <IoSend className="sm:ml-1 ml-0 sm:text-xl text-xl" />
        ) : (
          <IoMicOutline className={`sm:text-xl text-xl ${isRecording ? "animate-pulse text-red-200" : ""}`} />
        )}
      </button>
    </div>
  );
};

export default ChatInput;