import React from "react";

const RozgarHubLoader = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 animate-pulse space-y-6">
      {/* Top Navbar / Header area */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-gray-200" /> {/* Profile/Logo */}
          <div className="h-6 w-32 rounded bg-gray-200" />      {/* Page Title */}
        </div>
        <div className="h-10 w-28 rounded-lg bg-gray-200" />    {/* Button */}
      </div>

      {/* Main Content Layout (Sidebar + Main Content Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Fake Sidebar (hidden on mobile) */}
        <div className="hidden lg:block col-span-1 space-y-4">
          <div className="h-8 w-full rounded bg-gray-200" />
          <div className="h-8 w-5/6 rounded bg-gray-200" />
          <div className="h-8 w-4/5 rounded bg-gray-200" />
          <div className="h-8 w-full rounded bg-gray-200" />
        </div>

        {/* Fake Body Content */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 border border-gray-100 rounded-2xl bg-white space-y-3 shadow-sm">
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-5/6 rounded bg-gray-200" />
                <div className="h-8 w-1/2 rounded bg-gray-200 mt-2" />
              </div>
            ))}
          </div>

          {/* Fake Data Table / List */}
          <div className="p-6 border border-gray-100 rounded-2xl bg-white space-y-4 shadow-sm">
            <div className="h-5 w-1/4 rounded bg-gray-200 mb-2" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default RozgarHubLoader;