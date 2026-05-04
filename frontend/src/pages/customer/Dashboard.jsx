import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { capitalizeWords } from "../../utils/capitalize";
import CustomerGigCard from "../../components/customer/gigs/CustomerGigCard";
import { getOrders } from '../../store/orders/order-slice';

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-blue-50 text-blue-700 border-blue-200",
  "in-progress": "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

const StatusBadge = ({ status }) => (
  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border capitalize ${STATUS_STYLES[status] || "bg-gray-100 text-gray-500"}`}>
    {status}
  </span>
);

const OrderRow = ({ order }) => {
  const title = order.isBroadcast ? order.requestTitle : (order.gigId?.title || "Order");
  const date = order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : "—";

  return (
    <Link to={`/customer/orders/${order._id}`} className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-[#f7f7f7] transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
        <span className="text-gray-400 text-xs font-bold">#</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#222325] truncate">{title}</p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
          {order.serviceLocation && <span className="truncate">{order.serviceLocation}</span>}
          <span className="flex-shrink-0">{date}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={order.status} />
        <span className="text-gray-300 group-hover:text-[#0d7a5f] transition-colors text-sm">&rarr;</span>
      </div>
    </Link>
  );
};

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.customerProfile) || {};
  const { orders } = useSelector((state) => state.orders) || { orders: [] };
  const dispatch = useDispatch();

  const [savedGigs, setSavedGigs] = useState([]);

  useEffect(() => {
    dispatch(getOrders({ status: '' }));
    try {
      const storedGigs = JSON.parse(localStorage.getItem("rozgar_saved_gigs")) || [];
      setSavedGigs(storedGigs);
    } catch (error) {
      console.error(error);
    }
  }, [dispatch]);

  const hasAvatar = !!user?.avatar;
  const hasPhone = !!user?.isPhoneVerified;
  const totalPoints = 100;
  const currentPoints = (hasAvatar ? 60 : 0) + (hasPhone ? 40 : 0);
  const completionPercentage = ((currentPoints / totalPoints) * 100).toFixed(0);

  const recentOrders = [...(orders || [])].slice(0, 4);
  const hasMoreOrders = (orders || []).length > 4;

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-4 md:p-8 font-sans text-[#222325]">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-14 h-14 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#0d7a5f] flex items-center justify-center font-bold text-xl text-white uppercase">
                {user?.name?.charAt(0) || "?"}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold leading-tight">
                Welcome back, {capitalizeWords(user?.name) || "Customer"}!
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="font-medium">Customer</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-bold">Recent Bookings</h2>
                <Link to="/customer/orders" className="text-xs font-semibold text-[#0d7a5f] hover:text-[#0e5641] transition-colors">
                  View All &rarr;
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="divide-y divide-gray-50 px-2">
                  {recentOrders.map((order) => (
                    <OrderRow key={order._id} order={order} />
                  ))}
                  {hasMoreOrders && (
                    <div className="px-4 py-3 text-center">
                      <Link to="/customer/orders" className="text-xs font-semibold text-[#0d7a5f] hover:underline">
                        View all orders
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-semibold text-gray-400">No bookings yet</p>
                  <p className="text-xs text-gray-300 mt-1">Your recent orders will appear here.</p>
                  <Link to="/customer/services" className="mt-4 px-5 py-2 text-xs font-bold text-[#0d7a5f] border border-[#0d7a5f] rounded-lg hover:bg-[#0d7a5f] hover:text-white transition-all">
                    Browse Services
                  </Link>
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-bold">Saved Gigs</h2>
                <Link to="/customer/services" className="text-xs font-semibold text-[#0d7a5f] hover:text-[#0e5641] transition-colors">
                  Browse More &rarr;
                </Link>
              </div>

              {savedGigs.length > 0 ? (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedGigs.map((gig) => (
                    <CustomerGigCard key={gig._id || gig} gig={gig} initialSaved={true} />
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-semibold text-gray-400">No saved gigs</p>
                  <p className="text-xs text-gray-300 mt-1">Tap the heart on any gig to save it here.</p>
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-4 space-y-5">
            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#222325]">Profile Strength</h2>
                <span className="text-sm font-bold text-[#0d7a5f]">
                  {completionPercentage}
                  <span className="text-gray-300 font-normal text-xs">/{totalPoints}</span>
                </span>
              </div>

              <div className="w-full bg-gray-100 h-1.5 rounded-full mb-3">
                <div className="bg-[#0d7a5f] h-1.5 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
              </div>

              <div className="space-y-1.5 mb-4">
                {[
                  { label: "Profile picture", done: hasAvatar, pts: 60 },
                  { label: "Phone verified", done: hasPhone, pts: 40 },
                ].map(({ label, done, pts }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-2 ${done ? "text-gray-500" : "text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${done ? "bg-[#0d7a5f]" : "bg-gray-300"}`} />
                      {label}
                    </span>
                    <span className={`font-semibold ${done ? "text-[#0d7a5f]" : "text-gray-300"}`}>
                      +{pts}
                    </span>
                  </div>
                ))}
              </div>

              {completionPercentage < 100 && (
                <Link to="/customer/profile" className="block text-center w-full py-2 text-xs font-bold text-[#0d7a5f] border border-[#0d7a5f] rounded-lg hover:bg-[#0d7a5f] hover:text-white transition-all">
                  Complete Profile
                </Link>
              )}
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#222325] mb-4">Your Activity</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Orders", value: profile?.totalOrdersPlaced ?? 0 },
                  { label: "Saved Gigs", value: savedGigs.length },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 bg-[#f7f7f7] rounded-xl border border-gray-100 text-center">
                    <p className="text-xl font-extrabold text-[#222325]">{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;