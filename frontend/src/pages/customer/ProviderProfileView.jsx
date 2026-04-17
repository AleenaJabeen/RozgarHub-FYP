import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  HiArrowLeft, 
  HiOutlineBriefcase, 
  HiOutlineCurrencyDollar,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineDocumentText,
  HiOutlineBadgeCheck,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineClipboardCopy, 
  HiCheck                 
} from "react-icons/hi";
import { IoPersonCircle } from "react-icons/io5";
import { FaStar, FaBolt } from "react-icons/fa";

const ProviderProfileView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── 1. Loading, Exit & Copy States ──
  const [isRevealing, setIsRevealing] = useState(true);
  const [isExiting, setIsExiting] = useState(false); // ✅ Added for smooth exit animation
  const [copiedItem, setCopiedItem] = useState(null); 

  // Grab the fully populated data passed from the Order Details page
  const profile = location.state?.providerProfile;

  // ── 2. Simulate Network Delay for Smoothness ──
  useEffect(() => {
    const timer = setTimeout(() => setIsRevealing(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // ── 3. Smooth Navigation Handler ──
  const handleGoBack = () => {
    setIsExiting(true);
    // Wait for the fade-out animation to finish before actually routing
    setTimeout(() => {
      navigate(-1);
    }, 400); 
  };

  // ── 4. Copy Handler ──
  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedItem(type);
    setTimeout(() => setCopiedItem(null), 2000); 
  };

  // ── Loading Spinner View ──
  if (isRevealing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f8fa] font-sans">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm animate-pulse">Loading Provider Profile...</p>
      </div>
    );
  }

  // ── Missing State Handling ──
  if (!profile) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-[#f7f8fa] gap-4 font-sans transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-red-500 font-bold">Profile data not found.</p>
        <p className="text-gray-500 text-sm">Please access this profile directly from an active order.</p>
        <button
          onClick={handleGoBack}
          disabled={isExiting}
          className="px-6 py-2 bg-secondary text-white rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-all flex items-center justify-center min-w-[120px]"
        >
          {isExiting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Go Back"
          )}
        </button>
      </div>
    );
  }

  // ── Derived Data ──
  const user = profile.user || {};
  const providerName = user.name || profile.name || "Unknown Provider";
  const joinYear = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently";
  
  // Format location
  const address = user.location?.address;
  const locationString = address 
    ? `${address.street ? address.street + ', ' : ''}${address.city || ''}, ${address.state || ''}`.replace(/^, |, $/g, '')
    : "Location not provided";

  return (
    // ✅ Added dynamic classes to fade and slightly scale down the page on exit
    <div className={`min-h-screen bg-[#f7f8fa] py-10 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-400 ease-in-out ${
      isExiting ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100 animate-[fadeIn_0.5s_ease-out]'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Header */}
        <button
          onClick={handleGoBack}
          disabled={isExiting}
          className="flex items-center gap-2 text-gray-500 hover:text-secondary transition-all font-medium text-sm w-max disabled:opacity-70"
        >
          {isExiting ? (
            <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiArrowLeft className="text-lg" />
          )}
          {isExiting ? "Returning..." : "Back to Service"}
        </button>

        {/* ── Top Profile Header Card ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all duration-500 hover:shadow-md">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-gray-100 bg-gray-50 overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={providerName} className="w-full h-full object-cover" />
              ) : (
                <IoPersonCircle className="w-full h-full text-gray-300" />
              )}
            </div>
            
            {/* User Info */}
            <div className="text-center sm:text-left mt-2 sm:mt-0">
              <h1 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                {providerName}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-6 text-sm text-gray-500 mb-2">
                
                {/* Email with Copy Button */}
                <span className="flex items-center justify-center sm:justify-start gap-1.5 group">
                  <HiOutlineMail className="text-lg text-gray-400" /> 
                  <span className="text-gray-600">{user.email || "No email provided"}</span>
                  {user.email && (
                    <button 
                      onClick={() => handleCopy(user.email, 'email')}
                      className="ml-1 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-secondary transition-all active:scale-95"
                      title="Copy Email"
                    >
                      {copiedItem === 'email' ? <HiCheck className="text-emerald-500 text-base" /> : <HiOutlineClipboardCopy className="text-base" />}
                    </button>
                  )}
                </span>

                {/* Phone with Copy Button */}
                <span className="flex items-center justify-center sm:justify-start gap-1.5 group">
                  <HiOutlinePhone className="text-lg text-gray-400" /> 
                  <span className="text-gray-600">{user.phone || "No phone provided"}</span>
                  {user.phone && (
                    <button 
                      onClick={() => handleCopy(user.phone, 'phone')}
                      className="ml-1 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-secondary transition-all active:scale-95"
                      title="Copy Phone Number"
                    >
                      {copiedItem === 'phone' ? <HiCheck className="text-emerald-500 text-base" /> : <HiOutlineClipboardCopy className="text-base" />}
                    </button>
                  )}
                </span>

              </div>
              
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-gray-400">
                <HiOutlineCalendar className="text-lg" /> Member since {joinYear}
              </div>
            </div>
          </div>

          {/* Badges / Rating */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {profile.urgentHire && (
              <div className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto">
                <FaBolt className="text-amber-500" /> Accepts Urgent Hires
              </div>
            )}
            {profile.cnicNo && (
              <div className="px-4 py-2 bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] rounded-lg text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto">
                <HiOutlineBadgeCheck className="text-lg" /> Verified
              </div>
            )}
          </div>
        </div>

        {/* ── Main Layout Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Main Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Location */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:border-secondary/20 transition-all">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineLocationMarker className="text-secondary text-xl font-bold" />
                <h2 className="text-lg font-bold text-gray-900">Primary Location</h2>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Street Address</p>
                <p className="text-sm font-semibold text-gray-900">{locationString}</p>
              </div>
            </div>

            {/* About / Bio */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:border-secondary/20 transition-all">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineUser className="text-secondary text-xl font-bold" />
                <h2 className="text-lg font-bold text-gray-900">About Provider</h2>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {profile.bio || "This provider hasn't added a bio yet."}
              </p>
            </div>

            {/* Experience */}
            {profile.experienceDetails && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:border-secondary/20 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <HiOutlineBriefcase className="text-secondary text-xl font-bold" />
                  <h2 className="text-lg font-bold text-gray-900">Experience History</h2>
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                  {profile.experienceDetails}
                </p>
              </div>
            )}

            {/* Documents Grid */}
            {(profile.certificates?.length > 0 || profile.experienceDocuments?.length > 0) && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <HiOutlineDocumentText className="text-secondary text-xl font-bold" />
                  <h2 className="text-lg font-bold text-gray-900">Verified Documents</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.certificates?.map((certUrl, idx) => (
                    <a key={`cert-${idx}`} href={certUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-secondary hover:shadow-sm transition-all group bg-[#f9fafb]">
                      <div>
                        <p className="text-sm font-bold text-gray-800">Certificate {idx + 1}</p>
                        <p className="text-xs text-gray-500 mt-0.5">View File</p>
                      </div>
                      <HiOutlineBadgeCheck className="text-2xl text-secondary opacity-50 group-hover:opacity-100" />
                    </a>
                  ))}
                  {profile.experienceDocuments?.map((doc, idx) => (
                    <a key={`doc-${idx}`} href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-secondary hover:shadow-sm transition-all group bg-[#f9fafb]">
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">{doc.title || `Document ${idx + 1}`}</p>
                        <p className="text-xs text-gray-500 mt-0.5">View File</p>
                      </div>
                      <HiOutlineDocumentText className="text-2xl text-secondary opacity-50 group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Stats & Quick Info */}
          <div className="space-y-4">
            
            {/* Rating Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-0.5 transition-all">
              <div className="p-3 bg-[#ecfdf5] text-[#047857] rounded-xl flex-shrink-0">
                <FaStar className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Overall Rating</p>
                <div className="flex items-end gap-2">
                  <p className="text-xl font-bold text-gray-900 leading-none">
                    {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "New"}
                  </p>
                  {profile.averageRating > 0 && (
                    <span className="text-xs text-gray-500 font-medium mb-0.5">({profile.totalReviews || 0} reviews)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Base Rate Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-0.5 transition-all">
              <div className="p-3 bg-gray-50 text-secondary rounded-xl flex-shrink-0">
                <HiOutlineCurrencyDollar className="text-xl font-bold" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Base Hourly Rate</p>
                <p className="text-xl font-bold text-gray-900 leading-none">
                  {profile.hourlyRate ? `Rs ${profile.hourlyRate}` : "Variable"}
                </p>
              </div>
            </div>

            {/* Experience Level Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-0.5 transition-all">
              <div className="p-3 bg-gray-50 text-secondary rounded-xl flex-shrink-0">
                <HiOutlineBriefcase className="text-xl font-bold" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Experience Level</p>
                <p className="text-xl font-bold text-gray-900 leading-none capitalize">
                  {profile.experienceLevel || "Not specified"}
                </p>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Core Skills</h3>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-[#f9fafb] border border-gray-200 text-gray-700 text-xs font-medium rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No specific skills listed.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileView;