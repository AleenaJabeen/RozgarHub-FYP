import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { 
  IoPersonCircle, 
  IoLocationOutline, 
  IoCallOutline, 
  IoMailOutline,
  IoCopyOutline,
  IoChatbubbleEllipsesOutline 
} from "react-icons/io5";
import { showToast } from "../../../utils/toastHelper"; // Bringing in your toast helper!

const CustomerProfileView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerId } = useParams();

  // Grab the data passed from the OrderDetails page
  const customerProfile = location.state?.customerProfile;
  const user = customerProfile?.user;

  // ── Missing Data Fallback ───────────────────────────────────────────────
  if (!customerProfile || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <IoPersonCircle className="text-gray-300 text-6xl animate-pulse" />
        <p className="text-gray-500 font-medium">Customer details unavailable.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-secondary text-white rounded-full text-sm font-bold hover:bg-[#0e5641] hover:-translate-y-0.5 active:scale-95 transition-all shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const customerName = user.name || customerProfile.name || "Customer";
  
  // ── Helper to format the location object ────────────────────────────────
  const formatLocation = (loc) => {
    if (!loc) return "Location not specified";
    if (typeof loc === "string") return loc; 
    const parts = [loc.street, loc.city, loc.state, loc.zipCode, loc.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };

  const formattedAddress = formatLocation(user.location);

  // ── Interactive Helper: Copy to Clipboard ───────────────────────────────
  const handleCopy = (text, type) => {
    if (!text || text.includes("not provided") || text.includes("not specified")) return;
    navigator.clipboard.writeText(text);
    showToast(`${type} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white border border-gray-200 rounded-full hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 transition-all flex-shrink-0"
            >
              <HiArrowLeft className="text-gray-600 text-lg" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Customer Profile</h1>
          </div>
          
          <span className="text-xs font-bold px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
            Registered Customer
          </span>
        </div>

        {/* ── Main Profile Card ──────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm text-center relative overflow-hidden group">
          {/* Subtle animated background accent */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-secondary/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10 flex flex-col items-center mt-4">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={customerName}
                  loading="lazy"
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md mb-5 relative z-10"
                />
              ) : (
                <IoPersonCircle className="text-[120px] text-gray-300 bg-white rounded-full shadow-sm mb-4 relative z-10" />
              )}
              {/* Decorative ping behind avatar */}
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl scale-110 -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 capitalize">{customerName}</h2>
            
            {/* ── Quick Action Bar ── */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <a 
                href={user.phone ? `tel:${user.phone}` : "#"}
                onClick={(e) => !user.phone && e.preventDefault()}
                className={`p-3 rounded-full transition-all flex items-center justify-center hover:-translate-y-1 hover:shadow-md ${user.phone ? 'bg-secondary text-white hover:bg-[#0e5641]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                title="Call Customer"
              >
                <IoCallOutline className="text-lg" />
              </a>
              <a 
                href={user.email ? `mailto:${user.email}` : "#"}
                onClick={(e) => !user.email && e.preventDefault()}
                className={`p-3 rounded-full transition-all flex items-center justify-center hover:-translate-y-1 hover:shadow-md ${user.email ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                title="Email Customer"
              >
                <IoMailOutline className="text-lg" />
              </a>
              <button 
                className="p-3 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-all flex items-center justify-center hover:-translate-y-1 hover:shadow-md"
                title="Message Customer (Coming Soon)"
              >
                <IoChatbubbleEllipsesOutline className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Contact & Location Details ─────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-5 border-b border-gray-100 pb-4 px-2">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Email (Click to Copy) */}
            <div 
              onClick={() => handleCopy(user.email, "Email")}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-secondary/30 hover:bg-secondary/5 hover:shadow-sm cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 group-hover:bg-white rounded-xl text-gray-500 group-hover:text-secondary transition-colors shadow-sm">
                  <IoMailOutline className="text-xl" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{user.email || "Not provided"}</p>
                </div>
              </div>
              {user.email && <IoCopyOutline className="text-gray-300 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all" />}
            </div>

            {/* Phone (Click to Copy) */}
            <div 
              onClick={() => handleCopy(user.phone, "Phone number")}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-secondary/30 hover:bg-secondary/5 hover:shadow-sm cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 group-hover:bg-white rounded-xl text-gray-500 group-hover:text-secondary transition-colors shadow-sm">
                  <IoCallOutline className="text-xl" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{user.phone || "Not provided"}</p>
                </div>
              </div>
              {user.phone && <IoCopyOutline className="text-gray-300 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all" />}
            </div>

            {/* Location (Spans both columns on desktop) */}
            <div 
              onClick={() => handleCopy(formattedAddress, "Address")}
              className="md:col-span-2 flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-secondary/30 hover:bg-secondary/5 hover:shadow-sm cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 group-hover:bg-white rounded-xl text-gray-500 group-hover:text-secondary transition-colors shadow-sm">
                  <IoLocationOutline className="text-xl" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Registered Location</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5 whitespace-pre-wrap leading-relaxed">
                    {formattedAddress}
                  </p>
                </div>
              </div>
              {formattedAddress !== "Location not specified" && <IoCopyOutline className="text-gray-300 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-4" />}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerProfileView;