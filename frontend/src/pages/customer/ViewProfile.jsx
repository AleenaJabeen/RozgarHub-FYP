import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { IoPersonCircle, IoCallOutline, IoLocationOutline } from "react-icons/io5";
import { MdOutlineVerified, MdOutlineShoppingBag, MdOutlineAccountBalanceWallet } from "react-icons/md";
import { FaStar, FaRegStar, FaStarHalfAlt, FaHeart, FaBookmark } from "react-icons/fa";
import { HiOutlineMail, HiOutlineCalendar, HiOutlinePencilAlt } from "react-icons/hi";
import { capitalizeWords } from "../../utils/capitalize";
import { getCustomerProfile } from "../../store/customer/profile-slice";

// ─── Helpers ────────────────────────────────────────────────────────────────

const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      if (rating >= star)
        return <FaStar key={star} className="text-amber-400 text-sm" />;
      if (rating >= star - 0.5)
        return <FaStarHalfAlt key={star} className="text-amber-400 text-sm" />;
      return <FaRegStar key={star} className="text-gray-300 text-sm" />;
    })}
  </div>
);

// A subtle pill showing a single data point with an icon
const StatCard = ({ icon, label, value, bgColor, iconColor }) => (
  <div className={`flex items-center gap-4 p-4 rounded-2xl ${bgColor}`}>
    <div className={`p-2.5 rounded-xl bg-white shadow-sm ${iconColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-800 leading-tight">{value}</p>
    </div>
  </div>
);

// Renders a label + value row, showing a graceful fallback when value is absent
const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
      {label}
    </p>
    <p className={`text-sm font-medium ${value ? "text-gray-800" : "text-gray-300 italic"}`}>
      {value || "Not provided"}
    </p>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const CustomerViewProfile = () => {
  const dispatch = useDispatch();

  const {
    profile = null,
    user    = null,
    loading = false,
  } = useSelector((state) => state.customerProfile) || {};

  useEffect(() => {
    dispatch(getCustomerProfile()).unwrap().catch(console.error);
  }, [dispatch]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading || (!profile && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
      </div>
    );
  }

  const addr = user?.location?.address || {};

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-PK", {
        month: "long",
        year:  "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══════════════════════════════════════
            LEFT COLUMN
        ══════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Card 1: Identity Header ─────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Gradient Banner */}
            <div className="h-24 bg-gradient-to-r from-secondary to-emerald-400" />

            <div className="px-6 pb-6">
              {/* Avatar row — overlaps banner */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 mb-4 gap-4">

                {/* Avatar */}
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex-shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IoPersonCircle className="text-[96px] text-gray-300" />
                  )}
                </div>

                {/* Edit button — top right of card on sm+ */}
                <Link
                  to="/customer/profile"
                  className="flex items-center gap-2 px-5 py-2 bg-secondary text-white text-sm font-bold rounded-full hover:bg-[#0e5641] transition-all self-start sm:self-auto shadow-sm"
                >
                  <HiOutlinePencilAlt className="text-base" />
                  Edit Profile
                </Link>
              </div>

              {/* Name, email, member since */}
              <h2 className="text-xl font-bold text-gray-800">
                {capitalizeWords(user?.name) || "—"}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mt-1.5">
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <HiOutlineMail className="text-base flex-shrink-0" />
                  {user?.email || "—"}
                </span>

                {memberSince && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <HiOutlineCalendar className="text-sm flex-shrink-0" />
                    Member since <span className="font-semibold text-gray-600 ml-1">{memberSince}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Card 2: Contact & Address Details ───────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

            {/* Contact Section */}
            <div className="flex items-center gap-2 mb-4">
              <IoCallOutline className="text-secondary text-lg" />
              <h3 className="text-base font-bold text-gray-800">Contact Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
              <InfoRow label="Phone Number" value={user?.phone} />
              <InfoRow label="Email Address" value={user?.email} />
            </div>

            <div className="border-t border-gray-100 my-5" />

            {/* Address Section */}
            <div className="flex items-center gap-2 mb-4">
              <IoLocationOutline className="text-secondary text-lg" />
              <h3 className="text-base font-bold text-gray-800">Address</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="sm:col-span-2">
                <InfoRow label="Street Address" value={addr.street} />
              </div>
              <InfoRow label="City"    value={capitalizeWords(addr.city)} />
              <InfoRow label="State"   value={addr.state} />
              <InfoRow label="Country" value={addr.country} />
              <InfoRow label="Zip Code" value={addr.zipCode} />
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════
            RIGHT SIDEBAR
        ══════════════════════════════════════ */}
        <div className="lg:col-span-1 space-y-6">

          {/* ── Sidebar Card 1: Trust & Safety ─────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800">Trust & Safety</h3>

            {/* Phone Verified Badge */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${
              user?.isPhoneVerified
                ? "bg-emerald-50 border-emerald-200"
                : "bg-orange-50 border-orange-200"
            }`}>
              <div className="flex items-center gap-2">
                <IoCallOutline className={`text-lg ${
                  user?.isPhoneVerified ? "text-emerald-600" : "text-orange-400"
                }`} />
                <span className="text-sm font-medium text-gray-700">Phone</span>
              </div>

              {user?.isPhoneVerified ? (
                <div className="flex items-center gap-1 text-emerald-600">
                  <MdOutlineVerified className="text-lg" />
                  <span className="text-xs font-bold">Verified</span>
                </div>
              ) : (
                <Link
                  to="/customer/profile"
                  className="text-xs font-bold text-orange-500 bg-orange-100 hover:bg-orange-200 px-3 py-1 rounded-full transition-colors"
                >
                  Verify now
                </Link>
              )}
            </div>

            {/* Rating */}
            <div className="px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Customer Rating
              </p>
              <div className="flex items-center gap-2">
                <StarRating rating={profile?.averageRating || 0} />
                <span className="text-sm font-bold text-gray-800">
                  {(profile?.averageRating || 0).toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({profile?.totalReviews || 0}{" "}
                  {profile?.totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>
          </div>

          {/* ── Sidebar Card 2: Marketplace Activity ───────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-800">Marketplace Activity</h3>

            <StatCard
              icon={<MdOutlineShoppingBag size={20} />}
              label="Orders Placed"
              value={profile?.totalOrdersPlaced ?? 0}
              bgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              icon={<MdOutlineAccountBalanceWallet size={20} />}
              label="Total Spent"
              value={`Rs ${profile?.totalAmountSpent ?? 0}`}
              bgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
          </div>

          {/* ── Sidebar Card 3: Saved Items ─────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Saved Items</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
                <div className="flex items-center gap-2">
                  <FaBookmark className="text-amber-500 text-sm" />
                  <span className="text-sm font-medium text-gray-700">Saved Gigs</span>
                </div>
                <span className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-0.5 rounded-full">
                  {profile?.savedGigs?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl">
                <div className="flex items-center gap-2">
                  <FaHeart className="text-rose-400 text-sm" />
                  <span className="text-sm font-medium text-gray-700">Favourite Providers</span>
                </div>
                <span className="text-sm font-bold text-rose-500 bg-rose-100 px-3 py-0.5 rounded-full">
                  {profile?.favoriteProviders?.length || 0}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerViewProfile;
