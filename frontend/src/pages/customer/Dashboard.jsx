import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { capitalizeWords } from "../../utils/capitalize";
import CustomerGigCard from "../../components/customer/gigs/CustomerGigCard";
import { getOrders } from "../../store/orders/order-slice";
import {
  HiOutlineArrowRight,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
} from "react-icons/hi";
import { LiaShieldAltSolid, LiaBoltSolid, LiaStarSolid } from "react-icons/lia";
import { FiPackage, FiBookmark } from "react-icons/fi";

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:       "bg-amber-50  text-amber-600  border-amber-200",
  accepted:      "bg-blue-50   text-blue-600   border-blue-200",
  "in-progress": "bg-violet-50 text-violet-600 border-violet-200",
  completed:     "bg-emerald-50 text-emerald-600 border-emerald-200",
  rejected:      "bg-red-50    text-red-500    border-red-200",
  cancelled:     "bg-gray-100  text-gray-400   border-gray-200",
};

const StatusBadge = ({ status }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize tracking-wide ${
    STATUS_STYLES[status] || "bg-gray-100 text-gray-400"
  }`}>
    {status}
  </span>
);

// ─── Inline order row ────────────────────────────────────────────────────────
const OrderRow = ({ order }) => {
  const title = order.isBroadcast
    ? order.requestTitle
    : order.gigId?.title || "Order";

  const date = order.scheduledDate
    ? new Date(order.scheduledDate).toLocaleDateString("en-PK", {
        day: "numeric", month: "short",
      })
    : null;

  return (
    <Link
      to={`/customer/orders/${order._id}`}
      className="group flex items-center gap-4 px-5 py-3.5
                 hover:bg-gray-50/80 transition-colors duration-150"
    >
      {/* icon */}
      <div className="w-8 h-8 rounded-lg bg-[#0d7a5f]/8 flex items-center justify-center flex-shrink-0">
        <HiOutlineShoppingBag className="text-[#0d7a5f] text-sm" />
      </div>

      {/* text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111] truncate leading-tight">{title}</p>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
          {order.serviceLocation && (
            <span className="flex items-center gap-0.5 truncate">
              <HiOutlineLocationMarker className="flex-shrink-0" />
              {order.serviceLocation}
            </span>
          )}
          {date && (
            <span className="flex items-center gap-0.5 flex-shrink-0">
              <HiOutlineCalendar className="flex-shrink-0" />
              {date}
            </span>
          )}
        </div>
      </div>

      {/* right */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <StatusBadge status={order.status} />
        <HiOutlineArrowRight className="text-gray-300 text-xs group-hover:text-[#0d7a5f] transition-colors" />
      </div>
    </Link>
  );
};

// ─── Inline saved gig row ────────────────────────────────────────────────────
const SavedGigRow = ({ gig }) => {
  const provider = gig.serviceProviderId;
  const name     = provider?.user?.name || provider?.name || "Provider";

  return (
    <Link
      to={`/customer/services/${gig._id}`}
      className="group flex items-center gap-4 px-5 py-3.5
                 hover:bg-gray-50/80 transition-colors duration-150"
    >
      {/* thumbnail */}
      <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-100">
        {gig.images?.[0]?.url ? (
          <img
            src={gig.images[0].url}
            alt={gig.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiOutlineHeart className="text-gray-300 text-sm" />
          </div>
        )}
      </div>

      {/* text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111] truncate leading-tight">{gig.title}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 capitalize truncate">{name}</p>
      </div>

      {/* price + arrow */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <span className="text-xs font-bold text-[#0d7a5f]">
          Rs {gig.hourlyRate ?? "—"}/hr
        </span>
        <HiOutlineArrowRight className="text-gray-300 text-xs group-hover:text-[#0d7a5f] transition-colors" />
      </div>
    </Link>
  );
};

// ─── Section shell ────────────────────────────────────────────────────────────
const Section = ({ title, linkTo, linkLabel = "View All", children, empty }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <h2 className="text-sm font-bold text-[#111] tracking-tight">{title}</h2>
      <Link
        to={linkTo}
        className="flex items-center gap-1 text-[11px] font-semibold text-[#0d7a5f]
                   hover:text-[#0e5641] transition-colors"
      >
        {linkLabel} <HiOutlineArrowRight className="text-xs" />
      </Link>
    </div>

    {children
      ? <div className="divide-y divide-gray-50">{children}</div>
      : (
        <div className="py-10 flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-gray-400">{empty?.title}</p>
          <p className="text-xs text-gray-300">{empty?.sub}</p>
          {empty?.cta && (
            <Link
              to={empty.cta.to}
              className="mt-3 px-5 py-1.5 text-xs font-bold text-[#0d7a5f] border border-[#0d7a5f]
                         rounded-lg hover:bg-[#0d7a5f] hover:text-white transition-all"
            >
              {empty.cta.label}
            </Link>
          )}
        </div>
      )
    }
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CustomerDashboard = () => {
  const { user }    = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.customerProfile) || {};
  const { orders }  = useSelector((state) => state.orders) || { orders: [] };
  const dispatch    = useDispatch();

  const [savedGigs, setSavedGigs] = useState([]);

  // Keep all existing Redux fetches and localStorage logic intact
  useEffect(() => {
    dispatch(getOrders({ status: "" }));
    try {
      const storedGigs = JSON.parse(localStorage.getItem("rozgar_saved_gigs")) || [];
      setSavedGigs(storedGigs);
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  const recentOrders  = [...(orders || [])].slice(0, 4);
  const hasMoreOrders = (orders || []).length > 4;

  const metrics = [
    {
      label: "Orders Placed",
      value: profile?.totalOrdersPlaced ?? (orders?.length ?? 0),
      icon:  <FiPackage  className="text-[#0d7a5f] text-base" />,
      bg:    "bg-[#0d7a5f]/5",
    },
    {
      label: "Saved Gigs",
      value: savedGigs.length,
      icon:  <FiBookmark className="text-amber-500 text-base" />,
      bg:    "bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-[#222325]">

      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
          >
            {/* Avatar + greeting */}
            <div className="flex items-center gap-5">
              <motion.div variants={fadeUp} custom={0}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#0d7a5f] flex items-center justify-center
                                  text-2xl font-black text-white shadow-sm uppercase">
                    {user?.name?.charAt(0) || "?"}
                  </div>
                )}
              </motion.div>

              <div>
                <motion.p
                  variants={fadeUp}
                  custom={0.05}
                  className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1"
                >
                  Welcome back
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  custom={0.1}
                  className="text-2xl sm:text-3xl font-extrabold text-[#111] leading-tight tracking-tight"
                >
                  {capitalizeWords(user?.name) || "Customer"}
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  custom={0.18}
                  className="text-sm text-gray-400 mt-1"
                >
                  Secure, fast, and reliable access to top-rated professionals.
                </motion.p>
              </div>
            </div>

            {/* Trust pillars */}
            <motion.div
              variants={fadeUp}
              custom={0.22}
              className="hidden sm:flex items-center gap-4"
            >
              {[
                { icon: <LiaShieldAltSolid className="text-[#0d7a5f] text-xl" />, label: "Verified Pros"   },
                { icon: <LiaBoltSolid      className="text-amber-500 text-xl" />, label: "Fast Response"   },
                { icon: <LiaStarSolid      className="text-[#0d7a5f] text-xl" />, label: "Rated & Reviewed"},
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  {icon}
                  <span className="text-[10px] font-semibold text-gray-500 whitespace-nowrap">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Main Column ── */}
          <motion.div
            className="lg:col-span-8 space-y-6"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >

            {/* Recent Bookings */}
            <motion.div variants={fadeUp}>
              <Section
                title="Recent Bookings"
                linkTo="/customer/orders"
                empty={{
                  title: "No bookings yet",
                  sub:   "Your most recent orders will appear here.",
                  cta:   { to: "/customer/services", label: "Browse Services" },
                }}
              >
                {recentOrders.length > 0 && (
                  <>
                    {recentOrders.map((order) => (
                      <OrderRow key={order._id} order={order} />
                    ))}
                    {hasMoreOrders && (
                      <div className="px-5 py-3 text-center">
                        <Link
                          to="/customer/orders"
                          className="text-xs font-semibold text-[#0d7a5f] hover:underline"
                        >
                          View all orders
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </Section>
            </motion.div>

            {/* Saved Gigs */}
            <motion.div variants={fadeUp}>
              <Section
                title="Saved Gigs"
                linkTo="/customer/services"
                linkLabel="Browse More"
                empty={{
                  title: "Nothing saved yet",
                  sub:   "Tap the heart on any gig to bookmark it here.",
                }}
              >
                {savedGigs.length > 0 && savedGigs.map((gig) => (
                  <SavedGigRow key={gig._id || gig} gig={gig} />
                ))}
              </Section>
            </motion.div>
          </motion.div>

          {/* ── Sidebar ── */}
          <motion.div
            className="lg:col-span-4 space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >

            {/* Activity Metrics */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Your Activity
              </p>
              <div className="space-y-3">
                {metrics.map(({ label, value, icon, bg }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 ${bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0">
                        {icon}
                      </div>
                      <span className="text-sm font-medium text-gray-600">{label}</span>
                    </div>
                    <span className="text-xl font-extrabold text-[#111]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Quick Links
              </p>
              <div className="space-y-1">
                {[
                  { label: "Browse Services", to: "/customer/services"   },
                  { label: "My Orders",       to: "/customer/orders"     },
                  { label: "Edit Profile",    to: "/customer/profile"    },
                  { label: "View Profile",    to: "/customer/view-profile"},
                ].map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl
                               hover:bg-[#f7f7f7] transition-colors"
                  >
                    <span className="text-sm text-gray-600 group-hover:text-[#0d7a5f] font-medium transition-colors">
                      {label}
                    </span>
                    <HiOutlineArrowRight className="text-gray-300 text-xs group-hover:text-[#0d7a5f] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;