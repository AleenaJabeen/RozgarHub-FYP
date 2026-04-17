import React from "react";
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
  HiOutlineUser
} from "react-icons/hi";
import { IoPersonCircle } from "react-icons/io5";
import { FaStar, FaBolt } from "react-icons/fa";

const ProviderProfileView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Grab the fully populated data passed from the Order Details page
  const profile = location.state?.providerProfile;

  // ── Missing State Handling (For Page Refreshes) ──
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f8fa] gap-4 font-sans">
        <p className="text-red-500 font-bold">Profile data not found.</p>
        <p className="text-gray-500 text-sm">Please access this profile directly from an active order.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-secondary text-white rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-all"
        >
          Go Back
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
    <div className="min-h-screen bg-[#f7f8fa] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-secondary transition-colors font-medium text-sm w-max"
        >
          <HiArrowLeft className="text-lg" />
          Back to Order
        </button>

        {/* ── Top Profile Header Card (Matches Screenshot) ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
          
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
                <span className="flex items-center justify-center sm:justify-start gap-1.5">
                  <HiOutlineMail className="text-lg" /> {user.email || "No email provided"}
                </span>
                <span className="flex items-center justify-center sm:justify-start gap-1.5">
                  <HiOutlinePhone className="text-lg" /> {user.phone || "No phone provided"}
                </span>
              </div>
              
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-gray-400">
                <HiOutlineCalendar className="text-lg" /> Member since {joinYear}
              </div>
            </div>
          </div>

          {/* Badges / Rating (Replaces "Edit Profile") */}
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
            
            {/* Primary Location (Matches Screenshot) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
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
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
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
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
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

          {/* RIGHT COLUMN: Stats & Quick Info (Matches Screenshot) */}
          <div className="space-y-4">
            
            {/* Rating Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
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
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
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
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
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

            {/* Hire CTA */}
            <div className="bg-white border border-secondary rounded-2xl p-6 shadow-sm text-center">
              <h3 className="font-bold text-gray-900 mb-2">Hire {providerName.split(" ")[0]}</h3>
              <p className="text-xs text-gray-500 mb-4">View their active gigs in the marketplace to start a new order.</p>
              <button 
                onClick={() => navigate("/customer/services")}
                className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-all duration-200"
              >
                Browse Services
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProviderProfileView;