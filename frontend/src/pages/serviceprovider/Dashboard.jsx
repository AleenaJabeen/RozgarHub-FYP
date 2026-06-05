import React, { useEffect, useState } from "react";
import {
  LiaBriefcaseSolid,
  LiaEnvelopeSolid,
  LiaExternalLinkAltSolid,
  LiaCheckCircleSolid,
  LiaStarSolid,
  LiaHistorySolid,
  LiaToolsSolid,
} from "react-icons/lia";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { VscVerifiedFilled, VscUnverified } from "react-icons/vsc";
import { motion } from "framer-motion";
import { HiChevronRight } from "react-icons/hi";
import { FaFire } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { capitalizeWords } from "../../utils/capitalize";
import { showToast } from "../../utils/toastHelper";

import IncomingUrgentCard from "../../components/orders/serviceprovider/IncomingUrgentCard";
import { getOrders } from "../../store/orders/order-slice";
import OrderStatusPieChart from "../../components/ui/OrderStatusPieChart";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders } = useSelector((state) => state.orders);
  const { profile } =
    useSelector((state) => state.serviceProviderProfile) || {};
  const totalReviews = profile?.totalReviews || 0;
  const averageRating = profile?.averageRating || 0;

  const [hasMounted, setHasMounted] = useState(false);

  const totalOrders = orders?.length || 0;
  const totalPendingOrders = orders
    ? orders.filter((order) => order.status === "pending").length
    : 0;

  const cancelledOrders = orders
    ? orders.filter((order) => order.status === "rejected").length
    : 0;
  const completedOrdersCount = orders
    ? orders.filter((order) => order.status === "completed").length
    : 0;
  const activeOrder = orders
    ? [...orders]
        .filter(
          (order) =>
            order.status == "accepted" || order.status === "in-progress",
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
    : null;

  const getStatusStep = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return 1;
      case "in-progress":
        return 2;
      case "completed":
        return 3;
      default:
        return 1;
    }
  };

  // 3. Extract the clean data structure your UI expects
  const recentOrder = activeOrder
    ? {
        serviceType: activeOrder.gigId?.title || "General Service",
        // Safely dig deep into the nested customer user object
        customerName: activeOrder.customerId?.user?.name || "Valued Client",
        status: activeOrder.status,
        statusStep: getStatusStep(activeOrder.status),
      }
    : null;
  const myId = user?._id;

  const { items: chats = [] } = useSelector((state) => state.chats || {});

  const totalUnreadMessages = chats.reduce((total, chat) => {
    return total + (chat.unreadCounts?.[myId] || 0);
  }, 0);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // --- Profile Strength Logic ---
  const hasAvatar = !!user?.avatar;
  const hasPhone = !!user?.isPhoneVerified;
  const totalPoints = 100;
  const currentPoints = (hasAvatar ? 60 : 0) + (hasPhone ? 40 : 0);
  const completionPercentage = ((currentPoints / totalPoints) * 100).toFixed(0);
  const fadeUp = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const scaleIn = {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  const getWeeklyActivityData = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // 1. Define your fallback data structure for when real orders are 0
    const fallbackData = {
      Sun: 12,
      Mon: 28,
      Tue: 35,
      Wed: 22,
      Thu: 30,
      Fri: 45,
      Sat: 18,
    };

    // 2. Initialize empty week structure for real data aggregation
    const activityMap = daysOfWeek.reduce((acc, day) => {
      acc[day] = 0;
      return acc;
    }, {});

    let hasRealOrdersThisWeek = false;

    if (orders && Array.isArray(orders) && orders.length > 0) {
      const now = new Date();

      // Calculate the start of the current week (Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);

        // Filter for orders created within the current week frame
        if (orderDate >= startOfWeek && orderDate <= now) {
          const dayName = daysOfWeek[orderDate.getDay()];
          activityMap[dayName] += 1;
          hasRealOrdersThisWeek = true; // Flag that we found live data
        }
      });
    }

    // 3. Construct final array: Use real data if present, otherwise inject fallback values
    return daysOfWeek.map((day) => ({
      day,
      count: hasRealOrdersThisWeek ? activityMap[day] : fallbackData[day],
      isDemoData: !hasRealOrdersThisWeek, // Extra flag in case you want to use it later
    }));
  };

  const weeklyChartData = getWeeklyActivityData();

  //  for Order status piechart
  const providerStats = {
    completedOrders: completedOrdersCount || 2,
    averageRating: user?.averageRating || 4.7,
    totalOrders: totalOrders,
    cancelledOrders: cancelledOrders,

    // Fake Chart 2 Data: Recent Rating Breakdown percentages
    ratingBreakdown: { fiveStar: 85, fourStar: 12, threeStarOrLess: 3 },
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good evening";
  };

  useEffect(() => {
    if (!orders || orders.length === 0) {
      dispatch(getOrders("all"));
    }
  }, [dispatch, orders]);

  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateBars(true), 100);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="min-h-screen bg-[#f7f7f7] p-3 md:p-8 font-sans text-[#222325]">
      <motion.div
        className="w-[95%] mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Top Profile Header */}
        <header className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-6">
          {/* Subtle decorative background gradient blobs */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

          {/* Left Section: Avatar & Welcome Info */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5 relative z-10 w-full sm:w-auto">
            {/* Avatar Section with a modern ring offset */}
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-primary rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              {user?.avatar ? (
                <img
                  src={user?.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover relative border-2 border-white ring-4 ring-primary/10"
                />
              ) : (
                <div className="w-20 h-20 rounded-full text-white bg-secondary flex items-center justify-center font-extrabold text-3xl uppercase shadow-md relative border-2 border-white">
                  {user?.name ? user.name.charAt(0) : "U"}
                </div>
              )}
            </div>

            {/* User Text Info & Greeting */}
            <div className="space-y-1">
              <p className="text-sm font-bold italic text-secondary">
                {getGreeting()},
              </p>
              <h1 className="text-2xl md:text-3xl text-tertiary font-extrabold tracking-tight">
                {user?.name ? capitalizeWords(user.name) : "Welcome Back!"}
              </h1>

              {/* Connected Message */}
              <p className="text-sm font-medium text-gray-500 max-w-lg break-all sm:break-normal">
                Great to see you today! Connected via{" "}
                <span className="text-gray-700 font-semibold">
                  {user?.email || "unknown@gmail.com"}
                </span>
              </p>
            </div>
          </div>

          {/* Right Section: Verification Status Badge */}
          <div className="relative z-10 flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-end sm:border-l sm:border-gray-100 sm:pl-6">
            {user?.isPhoneVerified ? (
              <div className="flex items-center flex-col gap-1 px-4 py-2 text-sm font-semibold text-emerald-700 min-w-[100px]">
                <VscVerifiedFilled size={22} className="text-emerald-600" />
                <span>Verified</span>
              </div>
            ) : (
              <div className="flex items-center flex-col gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-100 min-w-[100px]">
                <svg
                  className="w-5 h-5 text-rose-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>Unverified</span>
              </div>
            )}
          </div>
        </header>
        {/* ─── METRICS SUMMARY GRID ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Total Orders Assigned */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -2 }}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Orders Received
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                {totalOrders}
              </h3>
              <p className="text-xs text-gray-500 font-semibold">
                Lifetime Scope
              </p>
            </div>
            <div className="p-4 bg-gray-200 text-gray-600 rounded-2xl">
              <LiaToolsSolid size={32} />
            </div>
          </motion.div>

          {/* Completed Orders Card */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -2 }}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Completed Orders
              </p>
              <h3 className="text-2xl font-black text-green-600">
                {completedOrdersCount}
              </h3>
              <p className="text-xs text-green-600 font-semibold">
                Successful Delivery
              </p>
            </div>
            <div className="p-4 bg-green-100 text-green-600 rounded-2xl">
              <LiaCheckCircleSolid size={32} />
            </div>
          </motion.div>

          {/* Ratings Card */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -2 }}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Average Rating
              </p>
              <div className="flex items-center gap-1.5">
                <h3 className="text-2xl font-black text-gray-900">
                  {averageRating}
                </h3>
                <LiaStarSolid className="text-amber-500 text-xl fill-amber-500" />
              </div>
              <p className="text-xs text-amber-600 font-semibold">
                Top Tier Provider
              </p>
            </div>
            <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl">
              <LiaStarSolid size={32} />
            </div>
          </motion.div>
        </div>

        {/* Main Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Content Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* CHART 1: Active Order Pipeline Tracker (Visual Funnel) */}
            {recentOrder ? (
              <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm ">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-black tracking-tight">
                    Active Job Progress Tracker
                  </h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 font-black text-xs rounded">
                    Current Work
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-base text-gray-900 capitalize">
                        {recentOrder.serviceType}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Customer: {recentOrder.customerName}
                      </p>
                    </div>
                    <span className="bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-full capitalize">
                      {recentOrder.status}
                    </span>
                  </div>

                  {/* PROGRESS PIPELINE WRAPPER */}
                  <div className="relative my-6 px-4">
                    {/* 1. BACKGROUND TRACK LINE: Tied to absolute height 'top-3' to match the 24px (h-6) circle center */}
                    <div className="absolute top-3 left-7 right-7 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>

                    {/* 2. ACTIVE FILL LINE: Animates smoothly with matched 'top-3' tracking points */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          recentOrder?.statusStep === 1
                            ? "0%"
                            : recentOrder?.statusStep === 2
                              ? "50%"
                              : "100%",
                      }}
                      transition={{
                        duration: 1,
                        ease: "easeOut",
                      }}
                      className="absolute top-3 left-4 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-700 ease-in-out rounded-full"
                    ></motion.div>

                    {/* 3. STEP INTERACTION ROW */}
                    <div className="relative flex justify-between z-10">
                      {[
                        { stepNum: 1, label: "Accepted" },
                        { stepNum: 2, label: "In Progress" },
                        { stepNum: 3, label: "Complete" },
                      ].map((step) => {
                        // Dynamic logic gates to see if a node is currently active or completed
                        const isCompletedOrActive =
                          recentOrder?.statusStep >= step.stepNum;

                        return (
                          <div
                            key={step.stepNum}
                            className="flex flex-col items-center w-20 text-center"
                          >
                            {/* Circle Graphic Node */}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black tracking-tight transition-all duration-500 scale-100 ${
                                isCompletedOrActive
                                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-100 ring-4 ring-emerald-50"
                                  : "bg-slate-200 text-slate-400"
                              }`}
                            >
                              {/* Swapping raw numbers for a checkmark on complete step builds high end UX */}
                              {recentOrder?.statusStep > step.stepNum
                                ? "✓"
                                : step.stepNum}
                            </div>

                            {/* Label text that reactively stays bold and changes color based on fulfillment phase */}
                            <span
                              className={`text-[11px] font-bold mt-2.5 transition-colors duration-500 tracking-tight leading-none ${
                                isCompletedOrActive
                                  ? "text-slate-800"
                                  : "text-slate-400 font-medium"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <>
                <section className="bg-white rounded-xl  border border-gray-200 p-6 h-72 shadow-sm text-left text-gray-500">
                  <h2 className="text-lg text-tertiary font-black tracking-tight">
                    Active Job Progress Tracker
                  </h2>
                  <div className="flex justify-center items-center h-full text-center text-gray-500">
                    <p>No active jobs at the moment.</p>
                  </div>
                </section>
              </>
            )}

            {/* CHART 2: Premium Weekly Job Activity Chart (Mobile Full-Width Responsive) */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 "
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-gray-900">
                      Weekly Activity Load
                    </h2>
                    {weeklyChartData[0]?.isDemoData && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse">
                        Preview Mode
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-400 font-medium mt-0.5">
                    {weeklyChartData[0]?.isDemoData
                      ? "Sample breakdown of daily order volume spikes"
                      : "Real-time look at your high-volume work days"}
                  </p>
                </div>
              </div>

              <div className="w-full h-48 sm:h-52 min-w-0 relative">
                {hasMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={weeklyChartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="premiumGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="50%"
                            stopColor="#10b981"
                            stopOpacity={0.08}
                          />
                          <stop
                            offset="100%"
                            stopColor="#10b981"
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="6 6"
                        vertical={false}
                        stroke="#f1f5f9"
                      />

                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={{ stroke: "#c8d4e2", strokeWidth: 1 }}
                        tick={{
                          fill: "#90a3be",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                        dy={10}
                        padding={{ left: 2, right: 12 }}
                      />

                      <YAxis
                        width={1}
                        hide={false}
                        axisLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                        tickLine={false}
                        tick={false}
                        domain={[0, "dataMax + 10"]}
                      />

                      <Tooltip
                        cursor={{
                          stroke: "#10b981",
                          strokeWidth: 1.5,
                          strokeDasharray: "4 4",
                        }}
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          backdropFilter: "blur(4px)",
                          borderRadius: "12px",
                          border: "1px solid rgba(255,255,255,0.1)",
                          padding: "8px 12px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                        itemStyle={{
                          color: "#34d399",
                          fontSize: "12px",
                          fontWeight: "900",
                        }}
                        labelStyle={{ display: "none" }}
                        formatter={(value) => [`🚀 ${value} Completed Orders`]}
                      />

                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#premiumGradient)"
                        isAnimationActive={true}
                        animationBegin={100}
                        animationDuration={1800}
                        animationEasing="ease-out"
                        activeDot={{
                          r: 6,
                          stroke: "#ffffff",
                          strokeWidth: 2,
                          fill: "#10b981",
                        }}
                        dot={{
                          stroke: "#10b981",
                          strokeWidth: 1.5,
                          r: 3,
                          fill: "#ffffff",
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.section>
            {/* CHART 3: Rating Distribution Progress Gauge */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-black tracking-tight mb-4">
                Rating and Reviews
              </h2>

              {/* RATINGS SUMMARY CONTAINER */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-sm font-black text-secondary tracking-tight mb-4">
                  Rating
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  {/* LEFT COLUMN: Large Display Score (Takes 4 grid columns) */}
                  <div className="sm:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                    {/* Dynamic calculation fallbacks handled cleanly */}
                    <div className="text-4xl font-black italic tracking-tight text-secondary leading-none">
                      {averageRating
                        ? Number(averageRating).toFixed(1)
                        : "0.0"}
                    </div>

                    {/* Golden Star Row */}
                    <div className="flex items-center gap-0.5 my-2 text-base text-amber-500">
                      <LiaStarSolid />
                      <LiaStarSolid />
                      <LiaStarSolid />
                      <LiaStarSolid />
                      {/* If rating is less than 4.5, you could conditionally swap icons here */}
                      <LiaStarSolid
                        className={
                          averageRating >= 4.5
                            ? "text-amber-500"
                            : "text-gray-200"
                        }
                      />
                    </div>

                    <div className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      {totalReviews || 0} Global Reviews
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Clean Progress Bars Loop with Slide-In Animation */}
                  <div className="sm:col-span-8 space-y-2.5">
                    {[
                      {
                        label: "5 Star",
                        key: "fiveStar",
                        color: "bg-amber-500",
                      },
                      {
                        label: "4 Star",
                        key: "fourStar",
                        color: "bg-amber-400",
                      },
                      {
                        label: "3 Star",
                        key: "threeStar",
                        color: "bg-amber-300",
                      },
                      {
                        label: "2 Star",
                        key: "twoStar",
                        color: "bg-orange-400",
                      },
                      { label: "1 Star", key: "oneStar", color: "bg-rose-500" },
                    ].map((row) => {
                      const percentage =
                        providerStats.ratingBreakdown?.[row.key] || 0;

                      return (
                        <div key={row.key} className="flex items-center gap-3">
                          {/* Label Column */}
                          <span className="text-xs font-bold text-gray-500 w-12 shrink-0 whitespace-nowrap">
                            {row.label}
                          </span>

                          {/* Main Progress Bar Horizontal Track */}
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden relative">
                            <div
                              style={{
                                /* 🚀 ANIMATION LOGIC: Starts at 0% on initial load, then expands to the real percentage */
                                width: animateBars ? `${percentage}%` : "0%",
                              }}
                              /* transition-all combined with duration-1000 gives it that rich, premium 1-second glide */
                              className={`${row.color} h-full rounded-full transition-all duration-1000 ease-out`}
                            ></div>
                          </div>

                          {/* Value Display Right Alignment Side */}
                          <span className="text-xs font-black text-gray-700 w-8 text-right shrink-0">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* PROFILE CARD: Premium Circular Progress Indicator (Electric Blue Gradient) */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col  items-center text-center">
              <div className="w-full flex justify-between items-center mb-6">
                <h2 className="text-sm font-black tracking-tight text-gray-800">
                  Profile Score
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    completionPercentage === "100"
                      ? "bg-blue-50 text-blue-700 border-blue-100"
                      : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}
                >
                  {completionPercentage === "100"
                    ? "Verified"
                    : "Action Required"}
                </span>
              </div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileInView="visible"
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                }}
                className="relative flex items-center justify-center my-4"
              >
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black tracking-tight text-blue-600 leading-none">
                    {completionPercentage}%
                  </span>
                  <span className="text-[9px] text-gray-400 font-black uppercase mt-1 tracking-widest">
                    Complete
                  </span>
                </div>

                <svg className="w-36 h-36 transform -rotate-90 overflow-visible">
                  <defs>
                    <linearGradient
                      id="bluishGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    className="stroke-slate-100"
                    strokeWidth="9"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    stroke="url(#bluishGradient)"
                    strokeWidth="9"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray="389.6"
                    strokeDashoffset={
                      389.6 -
                      (389.6 * parseFloat(completionPercentage || 0)) / 100
                    }
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
              </motion.div>
              <div className="mt-4 w-full flex flex-col items-center">
                <p className="text-xs text-gray-500 mb-5 leading-relaxed font-medium max-w-[240px]">
                  {completionPercentage === "100"
                    ? "Your credentials check out! Enjoy priority access to new active marketplace jobs."
                    : "Finish up your identification details to open up premium high-rate client tasks."}
                </p>

                {completionPercentage !== "100" && (
                  <Link
                    to="createProfile"
                    className="block text-center w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all text-sm shadow-sm shadow-blue-100 hover:shadow-md active:scale-[0.99]"
                  >
                    Complete Verification Setup
                  </Link>
                )}
              </div>
            </section>

            {/* Communications & Messaging Callouts */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              <h2 className="text-base font-black tracking-tight">Inbox Hub</h2>

              <button className="flex items-center justify-between w-full p-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:border-primary transition-all bg-gray-50">
                <div className="flex items-center gap-2">
                  <LiaEnvelopeSolid size={22} className="text-gray-400" />
                  <span className="text-xs font-bold">Unread Messages</span>
                </div>
                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-black rounded">
                  {totalUnreadMessages}
                </span>
              </button>

              <button className="flex items-center justify-between w-full p-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:border-primary transition-all bg-gray-50">
                <div className="flex items-center gap-2">
                  <LiaBriefcaseSolid size={22} className="text-gray-400" />
                  <span className="text-xs font-bold">Job Proposals</span>
                </div>
                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-black rounded">
                  {totalPendingOrders}
                </span>
              </button>
            </section>
            <OrderStatusPieChart providerStats={providerStats} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
