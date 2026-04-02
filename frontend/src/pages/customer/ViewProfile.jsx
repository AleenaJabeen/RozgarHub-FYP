import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  IoPersonCircle,
  IoCallOutline,
  IoLocationOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import {
  MdOutlineVerified,
  MdOutlineShoppingBag,
  MdOutlineAccountBalanceWallet,
  MdOutlineWarningAmber,
} from "react-icons/md";
import { FaStar, FaRegStar, FaStarHalfAlt, FaHeart, FaBookmark } from "react-icons/fa";
import { HiOutlineMail, HiOutlineCalendar, HiOutlinePencilAlt } from "react-icons/hi";
import { TbMapPin2, TbMapPinFilled } from "react-icons/tb";
import { capitalizeWords } from "../../utils/capitalize";

// calcCompletion is now the single source of truth — imported from the slice.
// Dashboard.jsx must also switch to this import to stay in sync.
import { getCustomerProfile, calcCompletion } from "../../store/customer/profile-slice";

// ─── Font Injection ───────────────────────────────────────────────────────────
const usePremiumFonts = () => {
  useEffect(() => {
    if (document.getElementById("rozgarhub-fonts")) return;
    const link  = document.createElement("link");
    link.id   = "rozgarhub-fonts";
    link.rel  = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
const useCountUp = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick  = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
};

// ─── Profile Completion Ring ──────────────────────────────────────────────────
const CompletionRing = ({ pct = 0 }) => {
  const r    = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width="56" height="56" className="absolute -bottom-1 -right-1 drop-shadow-md">
      <circle cx="28" cy="28" r={r} fill="white" stroke="#e2e8f0" strokeWidth="4" />
      <circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke="#10b981"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      <text x="28" y="32" textAnchor="middle" fontSize="9" fontWeight="700" fill="#065f46">
        {pct}%
      </text>
    </svg>
  );
};

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) =>
      rating >= s ? (
        <FaStar key={s} className="text-amber-400 text-sm" />
      ) : rating >= s - 0.5 ? (
        <FaStarHalfAlt key={s} className="text-amber-400 text-sm" />
      ) : (
        <FaRegStar key={s} className="text-gray-300 text-sm" />
      )
    )}
  </div>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
    <span className="mt-0.5 text-slate-400 group-hover:text-emerald-500 transition-colors">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
        {label}
      </p>
      <p className={`text-sm font-semibold truncate ${value ? "text-slate-700" : "text-slate-300 italic"}`}>
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent }) => {
  const accents = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50", border: "border-emerald-100",
      icon: "bg-emerald-100 text-emerald-600", val: "text-emerald-900", lbl: "text-emerald-600",
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50", border: "border-blue-100",
      icon: "bg-blue-100 text-blue-600", val: "text-blue-900", lbl: "text-blue-600",
    },
  };
  const a = accents[accent] || accents.emerald;
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl ${a.bg} border ${a.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`p-3 rounded-xl shadow-sm flex-shrink-0 ${a.icon}`}>{icon}</div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${a.lbl} mb-0.5`}>{label}</p>
        <p className={`text-xl font-black leading-tight ${a.val}`}>{value}</p>
      </div>
    </div>
  );
};

// ─── Address Chip ─────────────────────────────────────────────────────────────
const AddressChip = ({ address, index }) => {
  const isPrimary = index === 0;
  return (
    <div className={`relative flex items-start gap-3 p-4 rounded-2xl border transition-all hover:shadow-md group ${
      isPrimary
        ? "bg-gradient-to-br from-emerald-50 to-teal-50/60 border-emerald-200"
        : "bg-white border-slate-100 hover:border-emerald-100"
    }`}>
      <div className={`relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
        isPrimary ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
      }`}>
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        {isPrimary && (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full mb-1.5">
            <IoCheckmarkCircle className="text-xs" /> Primary
          </span>
        )}
        <p className="text-sm text-slate-700 font-medium leading-snug">{address}</p>
      </div>
      <TbMapPinFilled className={`absolute top-3 right-3 text-base opacity-20 group-hover:opacity-50 transition-opacity ${isPrimary ? "text-emerald-500" : "text-slate-400"}`} />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CustomerViewProfile = () => {
  const dispatch = useDispatch();
  usePremiumFonts();

  // state.customerProfile.user is set by getCustomerProfile.fulfilled and is
  // the fully-populated User document — the only authoritative source for
  // avatar, location, isPhoneVerified, and phone.
  const { profile = null, user = null, loading = false } =
    useSelector((state) => state.customerProfile) || {};
  const { user: authUser } = useSelector((state) => state.auth);

  // Merge user states to ensure phone verification and phone number are always current
  const mergedUser = {
    ...authUser,
    ...user,
    isPhoneVerified: user?.isPhoneVerified || authUser?.isPhoneVerified,
    phone: user?.phone || authUser?.phone,
  };

  useEffect(() => {
    dispatch(getCustomerProfile()).unwrap().catch(console.error);
  }, [dispatch]);

  const totalOrders = useCountUp(profile?.totalOrdersPlaced ?? 0);
  const totalSpent  = useCountUp(profile?.totalAmountSpent  ?? 0);

  // Single source of truth — same function used (via import) in Dashboard.jsx.
  // Reads state.customerProfile.user which is always the populated User doc.
  const completion = calcCompletion(mergedUser, profile);

  // ── isPhoneVerified: read strictly from the populated state.customerProfile.user
  // This is set correctly by both getCustomerProfile.fulfilled (on mount) and
  // verifyCustomerPhoneOTP.fulfilled (after OTP flow) — fixed in index.js.
  const isVerified = !!mergedUser?.isPhoneVerified;

  if (loading || (!profile && !mergedUser)) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="relative w-14 h-14">
          <div className="animate-spin rounded-full w-14 h-14 border-t-4 border-b-4 border-emerald-200 absolute inset-0" />
          <div className="animate-spin rounded-full w-14 h-14 border-t-4 border-emerald-500 absolute inset-0 [animation-direction:reverse] [animation-duration:0.6s]" />
        </div>
      </div>
    );
  }

  const addr = mergedUser?.location?.address || {};

  const memberSince = mergedUser?.createdAt
    ? new Date(mergedUser.createdAt).toLocaleDateString("en-PK", {
        month: "long",
        year:  "numeric",
      })
    : null;

  const primaryAddressLine = [addr.street, addr.city, addr.country]
    .filter(Boolean)
    .join(", ");

  // Build the "what's still missing" hint text for the progress bar footer
  const missingHints = [
    !mergedUser?.avatar          && "Upload a photo",
    !isVerified            && "Verify your phone",
    !addr.street           && "Add a primary address",
  ].filter(Boolean);

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundImage: `
          radial-gradient(ellipse at 70% 0%, #ecfdf5 0%, transparent 60%),
          url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%2310b981' fill-opacity='0.07'/%3E%3C/svg%3E")
        `,
        backgroundColor: "#f8fafc",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Identity Header ────────────────────────────────────────────────── */}
        <div className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div
            className="absolute top-0 right-0 w-72 h-72 opacity-30 pointer-events-none"
            style={{
              background:
                "conic-gradient(from 180deg at 100% 0%, #10b981 0deg, #0d9488 90deg, #f0fdf4 180deg, transparent 280deg)",
              filter: "blur(48px)",
            }}
          />
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300" />

          <div className="relative z-10 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

              {/* Avatar + identity */}
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-50">
                    {mergedUser?.avatar ? (
                      <img src={mergedUser.avatar} alt={mergedUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <IoPersonCircle className="w-full h-full text-slate-200" />
                    )}
                  </div>
                  <CompletionRing pct={completion} />
                </div>

                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight mb-1"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {capitalizeWords(mergedUser?.name) || "Your Name"}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <HiOutlineMail className="text-emerald-500 text-base" />
                      {mergedUser?.email || "—"}
                    </span>
                    {mergedUser?.phone && (
                      <span className="flex items-center gap-1.5">
                        <IoCallOutline className="text-emerald-500 text-base" />
                        {mergedUser.phone}
                      </span>
                    )}
                    {memberSince && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                        <HiOutlineCalendar />
                        Member since {memberSince}
                      </span>
                    )}
                  </div>

                  {primaryAddressLine && (
                    <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                      <IoLocationOutline className="text-emerald-400 flex-shrink-0" />
                      {primaryAddressLine}
                    </p>
                  )}
                </div>
              </div>

              {/* Verification badge + Edit CTA */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:self-start">
                {/*
                  FIX: isVerified is derived from state.customerProfile.user.isPhoneVerified,
                  which is now correctly updated by both verifyCustomerPhoneOTP.fulfilled
                  and getCustomerProfile.fulfilled in index.js.
                  The "Verify Phone" badge will never appear for a verified user.
                */}
                {isVerified ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                    <MdOutlineVerified className="text-sm" />
                    Phone Verified
                  </div>
                ) : (
                  <Link
                    to="/customer/profile"
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                  >
                    <MdOutlineWarningAmber className="text-sm" />
                    Verify Phone
                  </Link>
                )}

                <Link
                  to="/customer/profile"
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-full transition-all shadow-sm hover:shadow-emerald-200 hover:shadow-md"
                >
                  <HiOutlinePencilAlt className="text-base" />
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Profile completion bar */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Profile Strength
                </p>
                <span className="text-xs font-bold text-emerald-600">{completion}% Complete</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000"
                  style={{ width: `${completion}%` }}
                />
              </div>
              {/*
                FIX: missingHints is derived from the same isVerified boolean
                as the badge — so "Verify your phone" disappears from the hint
                text the instant isPhoneVerified flips to true in Redux.
              */}
              {missingHints.length > 0 && (
                <p className="text-xs text-slate-400 mt-1.5">
                  {missingHints.join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── 8 / 4 body grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT COLUMN (8 cols) ─────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Contact & Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <IoCallOutline className="text-lg" />
                </div>
                <h2
                  className="text-base font-bold text-slate-800"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Contact Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <InfoRow icon={<IoCallOutline />} label="Phone Number" value={mergedUser?.phone} />
                <InfoRow icon={<HiOutlineMail />} label="Email Address" value={mergedUser?.email} />
              </div>

              <div className="h-px bg-slate-100 mb-5" />

              <div className="flex items-center gap-2 mb-4">
                <TbMapPin2 className="text-emerald-500" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Primary Address
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <InfoRow icon={<IoLocationOutline />} label="Street"   value={addr.street} />
                </div>
                <InfoRow icon={<IoLocationOutline />} label="City"     value={capitalizeWords(addr.city)} />
                <InfoRow icon={<IoLocationOutline />} label="State"    value={addr.state} />
                <InfoRow icon={<IoLocationOutline />} label="Country"  value={addr.country} />
                <InfoRow icon={<IoLocationOutline />} label="Zip Code" value={addr.zipCode} />
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500">
                    <FaBookmark className="text-sm" />
                  </div>
                  <h2
                    className="text-base font-bold text-slate-800"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    Quick-Book Addresses
                  </h2>
                </div>
                {profile?.savedAddresses?.length > 0 && (
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                    {profile.savedAddresses.length} saved
                  </span>
                )}
              </div>

              {profile?.savedAddresses?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.savedAddresses.map((address, index) => (
                    <AddressChip key={index} address={address} index={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <TbMapPin2 className="text-2xl text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">No addresses saved yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Add addresses in your profile for faster checkout.
                  </p>
                  <Link
                    to="/customer/profile"
                    className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                  >
                    Add Address →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR (4 cols) ───────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Trust & Safety */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3
                className="text-base font-bold text-slate-800 mb-4"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Trust & Safety
              </h3>

              {/*
                Phone verification row — driven by the same isVerified boolean
                as the header badge. One source, zero drift.
              */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border mb-3 ${
                isVerified
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-orange-50 border-orange-100"
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-full ${
                    isVerified
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-orange-100 text-orange-500"
                  }`}>
                    <IoCallOutline className="text-base" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Phone</span>
                </div>
                {isVerified ? (
                  <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">
                    <MdOutlineVerified />
                    Verified
                  </div>
                ) : (
                  <Link
                    to="/customer/profile"
                    className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-full transition-colors"
                  >
                    Verify →
                  </Link>
                )}
              </div>

              {/* Platform rating */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Platform Rating
                </p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span
                    className="text-3xl font-black text-slate-800 leading-none"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {(profile?.averageRating || 0).toFixed(1)}
                  </span>
                  <StarRating rating={profile?.averageRating || 0} />
                </div>
                <p className="text-xs text-slate-400">
                  {profile?.totalReviews || 0} review{profile?.totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Marketplace Stats */}
            <div className="space-y-3">
              <StatCard
                icon={<MdOutlineShoppingBag size={20} />}
                label="Total Orders"
                value={totalOrders}
                accent="blue"
              />
              <StatCard
                icon={<MdOutlineAccountBalanceWallet size={20} />}
                label="Total Invested"
                value={`Rs ${totalSpent.toLocaleString()}`}
                accent="emerald"
              />
            </div>

            {/* Favourites */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3
                className="text-base font-bold text-slate-800 mb-4"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Your Favourites
              </h3>
              <div className="space-y-2.5">
                <Link
                  to="/customer/saved-gigs"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 group-hover:bg-amber-100 text-amber-500 rounded-lg transition-colors">
                      <FaBookmark className="text-sm" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Saved Gigs</span>
                  </div>
                  <span className="text-xs font-black text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                    {profile?.savedGigs?.length || 0}
                  </span>
                </Link>

                <Link
                  to="/customer/favorite-providers"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 group-hover:bg-rose-100 text-rose-500 rounded-lg transition-colors">
                      <FaHeart className="text-sm" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Top Providers</span>
                  </div>
                  <span className="text-xs font-black text-rose-500 bg-rose-100 px-2.5 py-1 rounded-full">
                    {profile?.favoriteProviders?.length || 0}
                  </span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerViewProfile;
