import React from "react";
import { BiMessageRoundedDots } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const NoChatSelectedComponent = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-slate-50 items-center justify-center text-center p-6 transition-all duration-500 ease-in-out">
      {/* Animated Icon Container */}
      <div className="mb-6  flex items-center justify-center">
        <BiMessageRoundedDots 
          size={80} 
          className="text-secondary opacity-70 animate-pulse" 
        />
      </div>

      {/* Text Content */}
      <div className="max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
          Your conversation starts here
        </h3>
        <p className="text-gray-500 mt-3 leading-relaxed">
          Select a chat from the sidebar to view messages, or start a new 
          conversation with your Service Providers.
        </p>
      </div>

      {/* Mobile-only helper (if sidebar is hidden on small screens) */}
      <button
        onClick={() => navigate("/messages")}
        className="mt-8 md:hidden px-8 py-3 bg-secondary text-white rounded-xl font-semibold shadow-md active:scale-95 transition-transform"
      >
        View Chat List
      </button>
    </div>
  );
};

export default NoChatSelectedComponent;