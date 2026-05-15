import React from "react";
import { ChevronDown, Search, X } from "lucide-react";

const ChatHeader = ({ filterType, setFilterType, isSearchOpen, setIsSearchOpen, setSearchQuery }) => {
  return (
    <div className="flex justify-between items-center h-10">
      <div className="relative inline-block">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="appearance-none bg-transparent pr-8 py-1 text-lg font-semibold text-tertiary cursor-pointer focus:outline-none z-10 relative"
        >
          <option value="all">All messages</option>
          <option value="unread">Unread messages</option>
        </select>
        <ChevronDown size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-tertairy" />
      </div>

      <button
        onClick={() => {
          setIsSearchOpen(!isSearchOpen);
          if (isSearchOpen) setSearchQuery("");
        }}
        className="p-2 hover:bg-gray-100 rounded-full transition-all"
      >
        {isSearchOpen ? <X size={20} /> : <Search size={20} className="text-tertiary" />}
      </button>
    </div>
  );
};

export default ChatHeader;