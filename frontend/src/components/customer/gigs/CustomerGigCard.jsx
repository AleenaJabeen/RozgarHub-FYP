import React from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { MdOutlineWifiTethering } from "react-icons/md";
import { IoPersonCircle, IoTimeOutline } from "react-icons/io5";
import { HiOutlineCurrencyDollar } from "react-icons/hi";

const CustomerGigCard = ({ gig }) => {
  const navigate = useNavigate();

  // ── Provider data resolution ─────────────────────────────────────────────
  // Backend populates: gig.serviceProviderId → { user: { name, avatar }, skills, ... }
  const provider     = gig.serviceProviderId;
  const providerUser = provider?.user;
  const providerName = providerUser?.name || provider?.name || "Provider";
  const providerAvatar = providerUser?.avatar || null;

  const isOnline = gig.availabilityStatus === "online";
  const coverImage = gig.images?.[0]?.url || null;

 const rating     = provider?.averageRating || gig.averageRating || 0;
  const reviews    = provider?.totalReviews || gig.totalReviews || 0;
  const category   = gig.categoryId?.name || null;

  return (
    <div
      onClick={() => navigate(`/customer/services/${gig._id}`)}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm cursor-pointer
                 hover:shadow-md hover:-translate-y-1 hover:border-secondary
                 transition-all duration-200 flex flex-col"
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
          <div className="w-full h-full flex items-center justify-center">
            <HiOutlineCurrencyDollar className="text-gray-300 text-4xl" />
          </div>
        )}

        {/* Online badge */}
        <div className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
          isOnline
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-gray-50 text-gray-400 border-gray-200"
        }`}>
          <MdOutlineWifiTethering className={`text-sm ${isOnline ? "animate-pulse" : ""}`} />
          {isOnline ? "Online" : "Offline"}
        </div>

        {/* Category pill */}
        {category && (
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-black/40 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
            {category}
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Title */}
        <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
          {gig.title || "Untitled Gig"}
        </h3>

        {/* Provider */}
        <div className="flex items-center gap-2">
          {providerAvatar ? (
            <img
              src={providerAvatar}
              alt={providerName}
              loading="lazy"
              className="w-6 h-6 rounded-full object-cover border border-gray-100 flex-shrink-0"
            />
          ) : (
            <IoPersonCircle className="text-2xl text-gray-300 flex-shrink-0" />
          )}
          <span className="text-xs text-gray-500 capitalize truncate">{providerName}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <FaStar className="text-amber-400 text-xs" />
          <span className="text-xs font-bold text-gray-700">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({reviews})</span>
        </div>

        {/* Spacer pushes pricing to bottom */}
        <div className="flex-1" />

        {/* Pricing */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-secondary">
            <IoTimeOutline className="text-sm" />
            <span className="text-xs text-gray-500">From</span>
            <span className="text-sm font-bold text-gray-800">
              Rs {gig.hourlyRate ?? "—"}/hr
            </span>
          </div>
          {gig.inspectionRate != null && (
            <span className="text-xs text-gray-400 font-medium">
              Inspection: Rs {gig.inspectionRate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerGigCard;
