import React, { useState } from 'react';
import { LiaBriefcaseSolid, LiaEnvelopeSolid, LiaExternalLinkAltSolid } from 'react-icons/lia';
import { HiOutlineCalendar, HiChevronRight } from 'react-icons/hi';
import { FaFire } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { capitalizeWords } from '../../utils/capitalize';
import { showToast } from '../../utils/toastHelper';

import IncomingUrgentCard from '../../components/orders/serviceprovider/IncomingUrgentCard';


const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  
  const [urgentRequests, setUrgentRequests] = useState([]);

  // --- Profile Strength Logic ---
  const hasAvatar = !!user?.avatar;
  const hasPhone = !!user?.isPhoneVerified;

  const totalPoints = 100;
  const currentPoints = (hasAvatar ? 60 : 0) + (hasPhone ? 40 : 0);
  const completionPercentage = ((currentPoints / totalPoints) * 100).toFixed(0);

  // ─── Temporary UI Testing Function ─────────────────────────────────────────
  const triggerTestBroadcast = () => {
    const fakeBroadcast = {
      _id: Math.random().toString(36).substring(7),
      requestTitle: "Urgent Hiring: Main Water Pipe Burst!",
      category: "Plumbing",
      serviceLocation: "Johar Town, Phase 2, Lahore",
      requirements: "The main pipe under the sink just burst and the kitchen is flooding. Need someone who can fix PVC pipes immediately.",
      responseTimeLimit: "Within 30 mins",
      customerName: "Ali Raza",
      orderImages: ["https://images.unsplash.com/photo-1607472586893-edb57cbce4ea?auto=format&fit=crop&q=80&w=400"], 
    };
    setUrgentRequests(prev => [fakeBroadcast, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-4 md:p-8 font-sans text-[#222325]">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Profile Header */}
        <header className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user?.avatar ? (
                <img 
                  src={user?.avatar} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border border-gray-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-full text-primary bg-secondary flex items-center justify-center font-bold text-xl uppercase">
                  {user?.name?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{capitalizeWords(user?.name) || "Loading..."}</h1>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <p className="text-gray-500">{user?.email || "Email is Loading..."}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 🧪 TEST BUTTON: Remove this once your backend is connected! */}
            <button 
              onClick={triggerTestBroadcast}
              className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-100 rounded-md border border-amber-200 hover:bg-amber-200 transition-colors"
            >
              + Simulate Broadcast
            </button>

            <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-md border border-transparent transition-all">
              <HiOutlineCalendar className="text-xl text-gray-700" />
              <span className="font-semibold text-sm">Available</span>
              <HiChevronRight className="text-gray-400 text-lg" />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ─── ✅ NEW: URGENT BROADCASTS SECTION ───────────────────────────────── */}
            {urgentRequests?.length > 0 && (
              <section className="mb-6 space-y-4 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex items-center gap-2 mb-3">
                  <FaFire className="text-red-500 text-xl animate-pulse" />
                  <h2 className="text-xl font-bold text-gray-900">Incoming Urgent Hiring Requests</h2>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 font-bold text-xs rounded-full">
                    {urgentRequests.length}
                  </span>
                </div>
                
                <div className="flex flex-col gap-4">
                  {urgentRequests.map((broadcast) => (
                    <IncomingUrgentCard
                      key={broadcast._id}
                      request={broadcast}
                      onAccept={async (req) => {
                        // Replace with actual dispatch when ready:
                        // await dispatch(acceptUrgentRequest(req._id)).unwrap();
                        showToast(`Accepted urgent request: ${req.requestTitle}`, "success");
                        setUrgentRequests(prev => prev.filter(r => r._id !== req._id));
                      }}
                      onIgnore={(req) => {
                        // Replace with actual dispatch when ready:
                        // dispatch(removeUrgentRequest(req._id));
                        setUrgentRequests(prev => prev.filter(r => r._id !== req._id));
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
                <button className="flex items-center gap-2 bg-[#efeff0] hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  Orders <LiaExternalLinkAltSolid size={18} />
                </button>
              </div>
              <div className="bg-[#f5f5f5] border border-gray-100 rounded-lg py-10 flex justify-center items-center">
                <p className="text-gray-500 font-semibold">No active orders</p>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Respond to clients</h2>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  <LiaEnvelopeSolid size={22} />
                  Unread messages (0)
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  <LiaBriefcaseSolid size={22} />
                  Briefs (0)
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Dynamic Profile Strength Widget */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold leading-tight text-secondary">Profile Strength</h2>
                <div className="text-[28px] font-bold italic flex items-baseline leading-none">
                  {completionPercentage}<span className="text-gray-400 text-sm not-italic font-normal ml-0.5">/{totalPoints}</span>
                </div>
              </div>
              <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
                {completionPercentage === "100" 
                  ? "Your profile is fully verified and complete!" 
                  : "Complete your profile to stand out and attract better opportunities."}
              </p>
              
              {/* Dynamic Progress Bar */}
              <div className="w-full bg-gray-100 h-2 rounded-full mb-8">
                <div 
                  className="bg-secondary h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>

              {completionPercentage < 100 && (
                <Link to="createProfile" className="block cursor-pointer text-center w-full py-2.5 px-4 border border-secondary rounded-lg font-bold text-secondary hover:bg-gray-50 transition-colors">
                  Complete profile
                </Link>
              )}
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
               <h2 className="text-xl font-bold">Track your performance</h2>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;