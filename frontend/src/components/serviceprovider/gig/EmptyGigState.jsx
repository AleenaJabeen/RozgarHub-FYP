import React from 'react';
import { useNavigate } from "react-router-dom";
import { IoRocketOutline, IoShieldCheckmarkOutline } from "react-icons/io5";

const EmptyGigState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-5 px-4 text-center">
      {/* Icon/Illustration Container */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center">
          <IoRocketOutline className="text-secondary text-5xl animate-bounce-slow" />
        </div>
      </div>

      {/* Text Content */}
      <h2 className="text-2xl font-black text-gray-900 mb-2">
        Ready to start earning?
      </h2>
      <p className="text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
        You haven't created any services yet. Create your first gig today and start getting orders from customers in your area!
      </p>

      {/* The Call to Action */}
      <button
        onClick={() => navigate("/serviceprovider/createGig")}
        className="flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-secondary/30 hover:-translate-y-1 transition-all active:scale-95"
      >
        Create Your First Gig
      </button>

      {/* Trust Badges (Local Pakistani Context) */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 text-gray-400">
        <div className="flex items-center gap-2">
          <IoShieldCheckmarkOutline size={18} className="text-green-500" />
          <span className="text-xs font-medium">100% Free to Join</span>
        </div>
        <div className="flex items-center gap-2">
          <IoShieldCheckmarkOutline size={18} className="text-green-500" />
          <span className="text-xs font-medium">Verified Payments</span>
        </div>
      </div>
    </div>
  );
};

export default EmptyGigState;