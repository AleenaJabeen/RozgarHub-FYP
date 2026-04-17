import React from 'react';
import { LiaHeartSolid, LiaShoppingBagSolid } from 'react-icons/lia';
import { HiChevronRight } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate
import { capitalizeWords } from '../../utils/capitalize';

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate(); // ✅ Initialize navigate

  // --- Profile Strength Logic ---
  const hasAvatar = !!user?.avatar;
  const hasPhone  = !!user?.isPhoneVerified;

  const totalPoints        = 100;
  const currentPoints      = (hasAvatar ? 60 : 0) + (hasPhone ? 40 : 0);
  const completionPercentage = ((currentPoints / totalPoints) * 100).toFixed(0);

  
  const testPlaceOrderFlow = () => {
    navigate("/customer/place-order", {
      state: {
        // Fake gig data that the PlaceOrder page is expecting
        gig: { 
          _id: "69d29df863cba9bd7f97c2e5", // Can be a real Gig ID
          title: "Test Plumbing Service" 
        },
        // IMPORTANT: Replace this string with a REAL Service Provider ID from your database 
        // to test actual backend submission!
        serviceProviderId: "69d29b5563cba9bd7f97c2d3" 
        
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-4 md:p-8 font-sans text-[#222325]">
      <div className="max-w-6xl mx-auto">

        {/* ── Top Profile Header ── */}
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
              <h1 className="text-xl font-bold">
                {capitalizeWords(user?.name) || "Loading..."}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <p className="text-gray-500">{user?.email || "Email is Loading..."}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-transparent">
            <span className="font-semibold text-sm text-gray-600">Customer</span>
            <HiChevronRight className="text-gray-400 text-lg" />
          </div>
        </header>

        {/* ── Dashboard Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Main Content Column ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* ✅ TEMPORARY DEV TESTING AREA */}
            <section className="bg-blue-50 rounded-xl border border-blue-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight text-blue-800 mb-2">Dev Testing Area</h2>
              <p className="text-sm text-blue-600 mb-4">Click here to test the Place Order flow without needing a real Gig page.</p>
              <button 
                onClick={testPlaceOrderFlow}
                className="px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-[#0e5641] transition-colors"
              >
                Test Place Order
              </button>
            </section>

            {/* Recent Bookings */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Recent Bookings</h2>
                <button className="flex items-center gap-2 bg-[#efeff0] hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  View All <LiaShoppingBagSolid size={18} />
                </button>
              </div>
              <div className="bg-[#f5f5f5] border border-gray-100 rounded-lg py-10 flex justify-center items-center">
                <p className="text-gray-500 font-semibold">No recent bookings</p>
              </div>
            </section>

            {/* Saved Gigs & Favorites */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Saved Gigs & Favorites</h2>
                <button className="flex items-center gap-2 bg-[#efeff0] hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  Browse Gigs <LiaHeartSolid size={18} />
                </button>
              </div>
              <div className="bg-[#f5f5f5] border border-gray-100 rounded-lg py-10 flex justify-center items-center">
                <p className="text-gray-500 font-semibold">You haven't saved any gigs yet</p>
              </div>
            </section>

          </div>

          {/* ── Sidebar Column ── */}
          <div className="lg:col-span-4 space-y-6">

            {/* Profile Strength Widget */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold leading-tight text-secondary">Profile Strength</h2>
                <div className="text-[28px] font-bold italic flex items-baseline leading-none">
                  {completionPercentage}
                  <span className="text-gray-400 text-sm not-italic font-normal ml-0.5">
                    /{totalPoints}
                  </span>
                </div>
              </div>
              <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
                {completionPercentage === "100"
                  ? "Your profile is fully verified and complete!"
                  : "Complete your profile to get the best experience on RozgarHub."}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-2 rounded-full mb-8">
                <div
                  className="bg-secondary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              {completionPercentage < 100 && (
                <Link
                  to="/customer/profile"
                  className="block cursor-pointer text-center w-full py-2.5 px-4 border border-secondary rounded-lg font-bold text-secondary hover:bg-gray-50 transition-colors"
                >
                  Complete profile
                </Link>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;