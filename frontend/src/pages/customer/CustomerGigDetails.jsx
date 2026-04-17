import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPublicGigById } from "../../store/customer/gigSearch-slice";
import { HiArrowLeft, HiOutlineLocationMarker, HiOutlineClock, HiChevronRight } from "react-icons/hi";
import { MdOutlineWifiTethering, MdOutlineAccountBalanceWallet } from "react-icons/md";
import { FaStar, FaRegStar, FaStarHalfAlt, FaBolt } from "react-icons/fa";
import { IoPersonCircle, IoCheckmarkCircle, IoTimeOutline } from "react-icons/io5";
import { TbCalendarTime } from "react-icons/tb";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      if (rating >= star) return <FaStar key={star} className="text-amber-400 text-sm" />;
      if (rating >= star - 0.5) return <FaStarHalfAlt key={star} className="text-amber-400 text-sm" />;
      return <FaRegStar key={star} className="text-gray-300 text-sm" />;
    })}
  </div>
);

const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ─── Main Component ───────────────────────────────────────────────────────────
const CustomerGigDetails = () => {
  const { gigId }   = useParams();
  const navigate    = useNavigate();
  const dispatch    = useDispatch();

  const { activeGig: gig, loading, error } = useSelector((state) => state.gigSearch);

  const [activeImage, setActiveImage] = useState(0);
  const [bookingType, setBookingType] = useState("hourly"); // Default booking type
  const [isNavigating, setIsNavigating] = useState(false); // ✅ Added for smooth animation

  useEffect(() => {
    if (gigId) dispatch(getPublicGigById(gigId));
  }, [dispatch, gigId]);

  // ── Loading State ──
  if (loading || !gig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <p className="text-red-500 font-semibold">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-secondary text-white rounded-full text-sm font-bold hover:bg-[#0e5641] transition-all">
          Go Back
        </button>
      </div>
    );
  }

  // ── Data Resolution ──
  const provider     = gig.serviceProviderId;
  const providerUser = provider?.user;
  const providerName = providerUser?.name || provider?.name || "Provider";
  const isOnline     = gig.availabilityStatus === "online";
  const images       = gig.images || [];

  // Calculate Urgent Rate (Example: 1.5x standard hourly rate)
  const urgentRate = gig.hourlyRate ? Math.round(gig.hourlyRate * 1.5) : "—";

  const sortedHours = [...(gig.availabilityHours || [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.days?.[0]) - DAY_ORDER.indexOf(b.days?.[0])
  );

  // ── Action Handlers ──
  const handleBookNow = () => {
    setIsNavigating(true); // Trigger animation

    const spId = typeof gig.serviceProviderId === 'object' 
      ? gig.serviceProviderId._id 
      : gig.serviceProviderId;

    // Simulate a brief loading state for smooth UI transition
    setTimeout(() => {
      navigate("/customer/place-order", {
        state: {
          gig: {
            _id:              gig._id,
            title:            gig.title,
            hourlyRate:       gig.hourlyRate,
            inspectionRate:   gig.inspectionRate,
            categoryId:       gig.categoryId,
          },
          serviceProviderId: spId, 
          bookingType: bookingType // ✅ Pass the selected type to the next page!
        },
      });
    }, 600); 
  };

  return (
    <div className={`min-h-screen bg-gray-50 transition-opacity duration-300 ${isNavigating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      
      {/* ── Breadcrumb Header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200 shadow-sm hover:shadow active:scale-95">
            <HiArrowLeft className="text-gray-600 text-lg" />
          </button>
          <div>
            <p className="text-xs text-gray-400">
              Services &rsaquo; <span className="text-gray-600 font-semibold">{gig.title}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ════════════════════════════════════
              LEFT COLUMN — Gallery + Details
          ════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Gallery */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="relative w-full aspect-video bg-gray-100">
                {images[activeImage]?.url ? (
                  <img src={images[activeImage].url} alt={gig.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MdOutlineAccountBalanceWallet className="text-gray-200 text-6xl" />
                  </div>
                )}
                <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" : "bg-white/90 text-gray-500 border-gray-200 shadow-sm backdrop-blur-sm"}`}>
                  <MdOutlineWifiTethering className={`text-sm ${isOnline ? "animate-pulse" : ""}`} />
                  {isOnline ? "Online Now" : "Offline"}
                </div>
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 p-4 overflow-x-auto bg-gray-50/50">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-secondary shadow-md scale-105" : "border-transparent hover:border-gray-300 opacity-70 hover:opacity-100"}`}>
                      <img src={img.url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & About Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              {gig.categoryId?.name && (
                <span className="inline-block text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                  {gig.categoryId.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-6">{gig.title}</h1>
              
              <div className="border-t border-gray-100 pt-6 mt-6">
                <h2 className="text-base font-bold text-gray-800 mb-3">About This Service</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{gig.description || <span className="italic text-gray-300">No description provided.</span>}</p>
              </div>

              {/* ── Clickable Service Provider Card ── */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">Service Provider</h2>
                
                <div 
                 onClick={() => {
                  const spId = typeof provider === 'object' ? provider._id : provider;
                  navigate(`/customer/provider/${spId}`, {
                    state: { providerProfile: typeof provider === 'object' ? provider : null } 
                  });
                }}
                  className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-secondary/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {providerUser?.avatar ? (
                      <img 
                        src={providerUser.avatar} 
                        alt={providerName} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 group-hover:border-secondary/20 transition-colors"
                      />
                    ) : (
                      <IoPersonCircle className="text-[56px] text-gray-300" />
                    )}
                    
                    <div>
                      <h3 className="text-base font-bold text-gray-900 capitalize group-hover:text-secondary transition-colors">
                        {providerName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <FaStar className="text-amber-400 text-sm mb-0.5" />
                        <span className="text-sm font-bold text-gray-700">
                          {(provider?.averageRating || gig.averageRating || 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          ({provider?.totalReviews || gig.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <HiChevronRight className="text-gray-300 text-2xl group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>

            {/* Availability Schedule */}
            {sortedHours.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <TbCalendarTime className="text-secondary text-xl" />
                  <h2 className="text-base font-bold text-gray-800">Availability Schedule</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sortedHours.map((slot, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl hover:border-secondary/30 transition-colors">
                      <IoCheckmarkCircle className="text-secondary text-lg flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-gray-700">{slot.days?.join(", ") || "—"}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><IoTimeOutline className="text-secondary" /> {slot.startTime} – {slot.endTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════
              RIGHT COLUMN — Sticky Booking CTA
          ════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-32 space-y-6">
              
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Book This Service</h3>
                <p className="text-xs text-gray-500 mt-1">Select how you want to proceed with this order.</p>
              </div>

              {/* Interactive Booking Options */}
              <div className="space-y-3">
                
                {/* Hourly Option */}
                <label className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  bookingType === 'hourly' ? "bg-blue-50/50 border-blue-400 shadow-sm" : "bg-white border-gray-100 hover:border-blue-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="bookingType" 
                      value="hourly" 
                      checked={bookingType === 'hourly'} 
                      onChange={(e) => setBookingType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div>
                      <span className={`block text-sm font-bold ${bookingType === 'hourly' ? "text-blue-900" : "text-gray-700"}`}>Hourly Rate</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5 block">Standard Booking</span>
                    </div>
                  </div>
                  <span className={`text-lg font-extrabold ${bookingType === 'hourly' ? "text-blue-700" : "text-gray-500"}`}>
                    <span className="text-xs font-medium mr-1 text-gray-400">Rs</span>
                    {gig.hourlyRate ?? "—"}
                  </span>
                </label>

                {/* ✅ NEW: Urgent Option */}
                <label className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  bookingType === 'urgent' ? "bg-amber-50/50 border-amber-400 shadow-sm" : "bg-white border-gray-100 hover:border-amber-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="bookingType" 
                      value="urgent" 
                      checked={bookingType === 'urgent'} 
                      onChange={(e) => setBookingType(e.target.value)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                    />
                    <div>
                      <span className={`flex items-center gap-1.5 text-sm font-bold ${bookingType === 'urgent' ? "text-amber-900" : "text-gray-700"}`}>
                        Urgent Hire <FaBolt className={bookingType === 'urgent' ? "text-amber-500" : "text-gray-400"} />
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5 block">Priority Response</span>
                    </div>
                  </div>
                  <span className={`text-lg font-extrabold ${bookingType === 'urgent' ? "text-amber-700" : "text-gray-500"}`}>
                    <span className="text-xs font-medium mr-1 text-gray-400">Rs</span>
                    {urgentRate}
                  </span>
                </label>

                {/* Inspection Option */}
                {gig.inspectionRate > 0 && (
                  <label className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    bookingType === 'inspection' ? "bg-purple-50/50 border-purple-400 shadow-sm" : "bg-white border-gray-100 hover:border-purple-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="bookingType" 
                        value="inspection" 
                        checked={bookingType === 'inspection'} 
                        onChange={(e) => setBookingType(e.target.value)}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <div>
                        <span className={`block text-sm font-bold ${bookingType === 'inspection' ? "text-purple-900" : "text-gray-700"}`}>Inspection</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5 block">Pre-work Assessment</span>
                      </div>
                    </div>
                    <span className={`text-lg font-extrabold ${bookingType === 'inspection' ? "text-purple-700" : "text-gray-500"}`}>
                      <span className="text-xs font-medium mr-1 text-gray-400">Rs</span>
                      {gig.inspectionRate}
                    </span>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleBookNow}
                  disabled={isNavigating}
                  className="w-full py-4 bg-secondary text-white text-base font-extrabold rounded-xl hover:bg-[#0e5641] hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-secondary/30 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-80 disabled:cursor-wait"
                >
                  {isNavigating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Preparing Order...
                    </>
                  ) : (
                    <>
                      Proceed to Book
                      <HiChevronRight className="text-xl" />
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1.5">
                  <IoCheckmarkCircle className="text-secondary" />
                  No payment charged until work is complete.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerGigDetails;