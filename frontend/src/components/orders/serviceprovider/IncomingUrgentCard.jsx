import React, { useRef, useState } from "react";
import { FaFire, FaMapMarkerAlt, FaUser, FaImages } from "react-icons/fa";
import { HiChevronDown, HiClock, HiTag, HiBell } from "react-icons/hi";
import { MdOutlineWifiTethering } from "react-icons/md";
import { IoCheckmarkCircle, IoClose } from "react-icons/io5";

// ─────────────────────────────────────────────
// IncomingUrgentCard
//
// Receives a `request` prop:
// {
//   _id, requestTitle, category, serviceLocation,
//   requirements, responseTimeLimit,
//   customerName, orderImages: []
// }
//
// onAccept(request) and onIgnore(request) callbacks
// are passed in from the parent for Redux dispatch.
// ─────────────────────────────────────────────

const IncomingUrgentCard = ({ request, onAccept, onIgnore }) => {
  const [expanded,       setExpanded]       = useState(false);
  const [activeImage,    setActiveImage]    = useState(0);
  const [isAccepting,    setIsAccepting]    = useState(false);
  const contentRef = useRef(null);

  const hasImages = request.orderImages?.length > 0;

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept?.(request);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border-2 shadow-lg
        transition-all duration-300
        ${expanded
          ? "border-amber-400 shadow-amber-200/60"
          : "border-amber-300/70 hover:border-amber-400 shadow-amber-100/40"
        }
      `}
    >
      {/* ── Pulsing left accent bar ───────────────────────────────────────── */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-red-400 to-amber-500">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-amber-300 to-red-500 opacity-60" />
      </div>

      {/* ── Card Background ──────────────────────────────────────────────── */}
      <div className="ml-1 bg-gradient-to-br from-amber-50 via-white to-orange-50">

        {/* ── Collapsed Header (always visible) ───────────────────────────── */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left px-5 pt-4 pb-4 focus:outline-none group"
        >
          <div className="flex items-start justify-between gap-3">

            {/* Left: Icon + Title + Meta */}
            <div className="flex items-start gap-3 min-w-0">

              {/* Animated fire icon */}
              <div className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center shadow-sm">
                <FaFire className="text-white text-base animate-bounce" style={{ animationDuration: "1.4s" }} />
              </div>

              <div className="min-w-0 flex-1">
                {/* Urgent pill */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <HiBell className="text-red-500 text-xs animate-pulse" />
                  <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest">
                    Urgent Hiring Request
                  </span>
                </div>

                {/* Request title */}
                <p className="text-sm font-bold text-gray-900 leading-snug truncate pr-2">
                  {request.requestTitle}
                </p>

                {/* Category + Time row */}
                <div className="flex items-center flex-wrap gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    <HiTag className="text-amber-500 text-xs" />
                    {request.category}
                  </span>

                  <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                    <HiClock className="text-red-500 text-sm" />
                    Respond in {request.responseTimeLimit}
                  </span>
                </div>

                {/* Customer name */}
                {request.customerName && (
                  <p className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                    <FaUser className="text-gray-400 text-[10px]" />
                    <span className="capitalize">{request.customerName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right: Chevron toggle */}
            <div
              className={`
                flex-shrink-0 w-7 h-7 rounded-full border border-amber-200 bg-white
                flex items-center justify-center shadow-sm
                transition-transform duration-300
                ${expanded ? "rotate-180" : "group-hover:border-amber-400"}
              `}
            >
              <HiChevronDown className="text-amber-600 text-sm" />
            </div>
          </div>
        </button>

        {/* ── Expandable Content ─────────────────────────────────────────── */}
        {/*
          We use max-height transition on a ref-based div.
          When expanded: max-height = scrollHeight (real content height).
          When collapsed: max-height = 0.
          Combined with overflow-hidden + transition-[max-height] this
          gives a smooth, content-aware accordion without JS animation libs.
        */}
        <div
          style={{
            maxHeight: expanded ? (contentRef.current?.scrollHeight ?? 2000) + "px" : "0px",
            transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="overflow-hidden"
        >
          <div ref={contentRef}>
            <div className="px-5 pb-5 space-y-4 border-t border-amber-100 pt-4">

              {/* Location */}
              {request.serviceLocation && (
                <div className="flex items-start gap-3 px-4 py-3 bg-white border border-amber-100 rounded-2xl">
                  <FaMapMarkerAlt className="text-red-400 text-base mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      Service Location
                    </p>
                    <p className="text-sm font-medium text-gray-800">{request.serviceLocation}</p>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {request.requirements && (
                <div className="px-4 py-3 bg-white border border-amber-100 rounded-2xl">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Customer Requirements
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {request.requirements}
                  </p>
                </div>
              )}

              {/* Reference Images */}
              {hasImages && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-1">
                    <FaImages className="text-amber-400 text-xs" />
                    Reference Images
                  </p>

                  {/* Main image */}
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-amber-100 bg-gray-100">
                    <img
                      src={request.orderImages[activeImage]}
                      alt={`Reference ${activeImage + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>

                  {/* Thumbnail row */}
                  {request.orderImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {request.orderImages.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`
                            flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all
                            ${activeImage === i
                              ? "border-amber-400 shadow-sm"
                              : "border-gray-100 hover:border-amber-300"}
                          `}
                        >
                          <img
                            src={url}
                            alt={`Thumb ${i + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Action Buttons ─────────────────────────────────────────── */}
              <div className="flex gap-3 pt-1">

                {/* Accept */}
                <button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className={`
                    flex-1 flex items-center justify-center gap-2
                    py-2.5 text-sm font-bold text-white rounded-full
                    shadow-sm hover:shadow-md
                    hover:-translate-y-0.5 active:scale-95
                    transition-all duration-200
                    ${isAccepting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                    }
                  `}
                >
                  {isAccepting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <IoCheckmarkCircle className="text-base" />
                      Accept Request
                    </>
                  )}
                </button>

                {/* Ignore */}
                <button
                  onClick={() => onIgnore?.(request)}
                  className="
                    flex-1 flex items-center justify-center gap-2
                    py-2.5 text-sm font-bold text-gray-500
                    bg-white border border-gray-200 rounded-full
                    hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50
                    hover:-translate-y-0.5 active:scale-95
                    shadow-sm hover:shadow-md
                    transition-all duration-200
                  "
                >
                  <IoClose className="text-base" />
                  Ignore
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingUrgentCard;
