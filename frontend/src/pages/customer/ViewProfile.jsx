import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  IoPersonCircle,
  IoCallOutline,
  IoLocationOutline,
} from "react-icons/io5";
import {
  MdOutlineVerified,
  MdOutlineShoppingBag,
  MdOutlineAccountBalanceWallet,
  MdOutlineWarningAmber,
} from "react-icons/md";
import { FaStar, FaRegStar, FaStarHalfAlt, FaHeart, FaBookmark } from "react-icons/fa";
import { HiOutlineMail, HiOutlineCalendar, HiOutlinePencilAlt } from "react-icons/hi";
import { TbMapPin2 } from "react-icons/tb";
import { capitalizeWords } from "../../utils/capitalize";

// Logic imports remain exactly the same
import { getCustomerProfile, calcCompletion } from "../../store/customer/profile-slice";

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

// ─── Simplified Components ────────────────────────────────────────────────────

const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) =>
      rating >= s ? (
        <FaStar key={s} className="text-yellow-400 text-sm" />
      ) : rating >= s - 0.5 ? (
        <FaStarHalfAlt key={s} className="text-yellow-400 text-sm" />
      ) : (
        <FaRegStar key={s} className="text-gray-300 text-sm" />
      )
    )}
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="text-gray-400 text-lg">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value || "Not provided"}</p>
    </div>
  </div>
);

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
    <div className="p-3 bg-secondary/10 text-secondary rounded-lg text-xl">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const AddressChip = ({ address, index }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
    <div className="bg-gray-200 text-gray-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5">
      {index + 1}
    </div>
    <div>
      {index === 0 && (
        <span className="text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded mr-2 mb-1 inline-block">
          Primary
        </span>
      )}
      <p className="text-sm text-gray-700">{address}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CustomerViewProfile = () => {
  const dispatch = useDispatch();

  // Logic remains identical
  const { profile = null, user = null, loading = false } =
    useSelector((state) => state.customerProfile) || {};
  const { user: authUser } = useSelector((state) => state.auth);

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

  const completion = calcCompletion(mergedUser, profile);
  const isVerified = !!mergedUser?.isPhoneVerified;

  if (loading || (!profile && !mergedUser)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  const addr = mergedUser?.location?.address || {};
  const memberSince = mergedUser?.createdAt
    ? new Date(mergedUser.createdAt).toLocaleDateString("en-PK", { month: "short", year: "numeric" })
    : null;
  const primaryAddressLine = [addr.street, addr.city, addr.country].filter(Boolean).join(", ");
  const missingHints = [
    !mergedUser?.avatar && "Upload a photo",
    !isVerified && "Verify your phone",
    !addr.street && "Add a primary address",
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Top Header Card ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* User Info */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-gray-200 overflow-hidden bg-gray-100 shrink-0">
                {mergedUser?.avatar ? (
                  <img src={mergedUser.avatar} alt={mergedUser.name} className="w-full h-full object-cover" />
                ) : (
                  <IoPersonCircle className="w-full h-full text-gray-300" />
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  {capitalizeWords(mergedUser?.name) || "Your Name"}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><HiOutlineMail /> {mergedUser?.email || "—"}</span>
                  {mergedUser?.phone && <span className="flex items-center gap-1"><IoCallOutline /> {mergedUser.phone}</span>}
                </div>
                {memberSince && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <HiOutlineCalendar /> Member since {memberSince}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {isVerified ? (
                <div className="w-full sm:w-auto flex justify-center items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-4 py-2.5 rounded-lg border border-green-200">
                  <MdOutlineVerified className="text-lg" /> Verified
                </div>
              ) : (
                <Link to="/customer/profile" className="w-full sm:w-auto flex justify-center items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 px-4 py-2.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition">
                  <MdOutlineWarningAmber className="text-lg" /> Verify Phone
                </Link>
              )}
              <Link to="/customer/profile" className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-2.5 bg-secondary hover:bg-emerald-800 text-white font-medium text-sm rounded-lg transition-colors">
                <HiOutlinePencilAlt className="text-lg" /> Edit Profile
              </Link>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Profile Completion</span>
              <span className="text-sm font-bold text-secondary">{completion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-secondary h-2 rounded-full transition-all duration-500" style={{ width: `${completion}%` }}></div>
            </div>
            {missingHints.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">To reach 100%: {missingHints.join(", ")}</p>
            )}
          </div>
        </div>

        {/* ── Body Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Spans 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Address Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TbMapPin2 className="text-secondary text-xl" /> Primary Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <div className="sm:col-span-2"><InfoRow icon={<IoLocationOutline />} label="Street Address" value={addr.street} /></div>
                <InfoRow icon={<IoLocationOutline />} label="City" value={capitalizeWords(addr.city)} />
                <InfoRow icon={<IoLocationOutline />} label="State/Province" value={addr.state} />
                <InfoRow icon={<IoLocationOutline />} label="Country" value={addr.country} />
                <InfoRow icon={<IoLocationOutline />} label="Zip Code" value={addr.zipCode} />
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FaBookmark className="text-secondary text-base" /> Saved Addresses
                </h2>
              </div>
              {profile?.savedAddresses?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.savedAddresses.map((address, index) => (
                    <AddressChip key={index} address={address} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-sm text-gray-500 mb-2">No additional addresses saved.</p>
                  <Link to="/customer/profile" className="text-sm font-medium text-secondary hover:underline">Add Address</Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Spans 1/3) */}
          <div className="space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4">
              <StatCard icon={<MdOutlineShoppingBag />} label="Total Orders" value={totalOrders} />
              <StatCard icon={<MdOutlineAccountBalanceWallet />} label="Total Invested" value={`Rs ${totalSpent.toLocaleString()}`} />
            </div>

            {/* Platform Rating */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Your Rating</h3>
              <div className="flex justify-center items-center gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-800">{(profile?.averageRating || 0).toFixed(1)}</span>
              </div>
              <div className="flex justify-center mb-2">
                <StarRating rating={profile?.averageRating || 0} />
              </div>
              <p className="text-sm text-gray-500">{profile?.totalReviews || 0} reviews</p>
            </div>

            {/* Favourites List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Favourites</h3>
              <div className="space-y-3">
                <Link to="/customer/saved-gigs" className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2"><FaBookmark className="text-gray-400" /> Saved Gigs</span>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">{profile?.savedGigs?.length || 0}</span>
                </Link>
                <Link to="/customer/favorite-providers" className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2"><FaHeart className="text-gray-400" /> Top Providers</span>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">{profile?.favoriteProviders?.length || 0}</span>
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