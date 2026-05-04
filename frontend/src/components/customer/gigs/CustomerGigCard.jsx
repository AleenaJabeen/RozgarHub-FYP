import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaRegStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { MdOutlineWifiTethering } from "react-icons/md";
import { IoPersonCircle } from "react-icons/io5";
import { HiOutlinePhotograph } from "react-icons/hi";
import { LiaClock } from "react-icons/lia";

const CustomerGigCard = ({ gig }) => {
  const navigate  = useNavigate();
  const [saved, setSaved] = useState(false);

  // ── 1. Check Local Storage on Load ───────────────────────────────
  useEffect(() => {
    try {
      const storedGigs = JSON.parse(localStorage.getItem("rozgar_saved_gigs")) || [];
      const isAlreadySaved = storedGigs.some((savedGig) => savedGig._id === gig._id);
      setSaved(isAlreadySaved);
    } catch (error) {
      console.error("Failed to parse local storage", error);
    }
  }, [gig._id]);

  // ── Provider data ────────────────────────────────────────────────
  const provider     = gig.serviceProviderId;
  const providerUser = provider?.user;
  const providerName = providerUser?.name || provider?.name || "Provider";
  const providerAvatar = providerUser?.avatar || null;

  const isOnline   = gig.availabilityStatus === "online";
  const coverImage = gig.images?.[0]?.url || null;
  const rating     = provider?.averageRating || gig.averageRating || 0;
  const reviews    = provider?.totalReviews  || gig.totalReviews  || 0;
  const category   = gig.categoryId?.name || null;

  // ── 2. Handle Local Storage Save/Unsave ──────────────────────────
  const handleSave = (e) => {
    e.stopPropagation(); 
    
    try {
      let storedGigs = JSON.parse(localStorage.getItem("rozgar_saved_gigs")) || [];
      
      if (saved) {
        // If already saved, filter it out
        storedGigs = storedGigs.filter((g) => g._id !== gig._id);
      } else {
        // If not saved, add the whole object to the beginning of the array
        storedGigs = [gig, ...storedGigs];
      }
      
      localStorage.setItem("rozgar_saved_gigs", JSON.stringify(storedGigs));
      setSaved(!saved); // Update the heart UI instantly
      
    } catch (error) {
      console.error("Failed to save to local storage", error);
    }
  };

  return (
    <div
      onClick={() => navigate(`/customer/services/${gig._id}`)}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 transition-all duration-200 flex flex-col"
    >
      {/* ── Cover Image ── */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={gig.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <HiOutlinePhotograph className="text-gray-300 text-3xl" />
          </div>
        )}

        {/* Save button — top left */}
        <button
          onClick={handleSave}
          className="absolute top-2.5 left-2.5 w-8 h-8 flex items-center justify-center bg-white/75 backdrop-blur-sm border border-white/60 rounded-lg hover:bg-white/95 transition-all duration-150"
          title={saved ? "Remove from saved" : "Save gig"}
        >
          {saved
            ? <FaHeart    className="text-rose-500 text-sm drop-shadow-sm" />
            : <FaRegHeart className="text-gray-500 text-sm hover:text-rose-400 transition-colors drop-shadow-sm" />
          }
        </button>

        {/* Online badge — top right */}
        <div className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
          isOnline
            ? "bg-emerald-50/90 text-emerald-700 border-emerald-200"
            : "bg-white/80 text-gray-400 border-gray-200"
        }`}>
          <MdOutlineWifiTethering className={`text-xs ${isOnline ? "animate-pulse" : ""}`} />
          {isOnline ? "Online" : "Offline"}
        </div>

        {/* Category pill — bottom left */}
        {category && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-black/40 text-white text-[11px] font-medium rounded-md backdrop-blur-sm">
            {category}
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <h3 className="text-sm font-semibold text-[#222325] leading-snug line-clamp-2">
          {gig.title || "Untitled Gig"}
        </h3>

        <div className="flex items-center gap-2">
          {providerAvatar ? (
            <img
              src={providerAvatar}
              alt={providerName}
              loading="lazy"
              className="w-5 h-5 rounded-full object-cover border border-gray-200 flex-shrink-0"
            />
          ) : (
            <IoPersonCircle className="text-xl text-gray-300 flex-shrink-0" />
          )}
          <span className="text-xs text-gray-500 capitalize truncate">{providerName}</span>
        </div>

        <div className="flex items-center gap-1">
          {rating > 0
            ? <FaStar    className="text-amber-400 text-xs" />
            : <FaRegStar className="text-gray-300 text-xs" />
          }
          <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({reviews})</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <LiaClock className="text-[#0d7a5f] text-sm" />
            <span className="text-xs text-gray-500">From</span>
            <span className="text-sm font-bold text-[#222325]">
              Rs {gig.hourlyRate ?? "—"}/hr
            </span>
          </div>
          {gig.inspectionRate != null && (
            <span className="text-[11px] text-gray-400">
              Insp: Rs {gig.inspectionRate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerGigCard;