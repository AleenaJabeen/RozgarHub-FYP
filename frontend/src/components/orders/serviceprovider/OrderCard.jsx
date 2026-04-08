import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HiOutlineCalendar, HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineShoppingBag } from "react-icons/md";
import { startWork } from "../../../store/orders/order-slice";
import { showToast } from "../../../utils/toastHelper";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:     "bg-amber-100  text-amber-700  border-amber-200",
  accepted:    "bg-blue-100   text-blue-700   border-blue-200",
  "in-progress": "bg-purple-100 text-purple-700 border-purple-200",
  completed:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected:    "bg-red-100    text-red-700    border-red-200",
  cancelled:   "bg-gray-100   text-gray-500   border-gray-200",
};

const StatusBadge = ({ status }) => (
  <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${STATUS_STYLES[status] || "bg-gray-100 text-gray-500"}`}>
    {status}
  </span>
);

// ─── OrderCard ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, role, onRespond, onCancel, onComplete }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const gig          = order.gigId;
  const customer     = order.customerId?.user;
  const provider     = order.serviceProviderId?.user;
  const displayName  = role === "customer"
    ? (provider?.name  || "Provider")
    : (customer?.name  || "Customer");
  const displayLabel = role === "customer" ? "Provider" : "Customer";

  const scheduledDate = order.scheduledDate
    ? new Date(order.scheduledDate).toLocaleDateString("en-PK", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

  const handleStartWork = async () => {
    try {
      await dispatch(startWork(order._id)).unwrap();
      showToast("Work started successfully.");
    } catch (err) {
      showToast(err || "Something went wrong.", "error");
    }
  };

  return (
    <div 
      onClick={() => navigate(`/serviceprovider/orders/${order._id}`)}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md hover:border-secondary/30 cursor-pointer transition-all"
    >

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <MdOutlineShoppingBag className="text-secondary text-xl" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">
              {gig?.title || "Gig"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {displayLabel}: <span className="font-semibold text-gray-600 capitalize">{displayName}</span>
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* ── Meta ── */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <HiOutlineCalendar className="text-secondary text-sm" />
          {scheduledDate}
        </span>
        {order.serviceLocation && (
          <span className="flex items-center gap-1.5">
            <HiOutlineLocationMarker className="text-secondary text-sm" />
            {order.serviceLocation}
          </span>
        )}
        <span className="flex items-center gap-1.5 capitalize font-medium text-gray-600">
          {order.orderType}
        </span>
      </div>

      {/* ── Billing summary (completed orders only) ── */}
      {order.status === "completed" && order.totalAmount != null && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
          <span className="text-xs text-emerald-700 font-medium">Total Billed</span>
          <span className="text-sm font-bold text-emerald-700">Rs {order.totalAmount}</span>
        </div>
      )}

      {/* ── Action Buttons (role + status aware) ─────────────────────────────── */}
      <div className="flex flex-wrap gap-2 pt-1">

        {/* Provider: pending → accept / reject */}
        {role === "serviceprovider" && order.status === "pending" && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onRespond(order, "accept"); }}
              className="flex-1 py-2 text-sm font-bold bg-secondary text-white rounded-full hover:bg-[#0e5641] transition-all"
            >
              Accept
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRespond(order, "reject"); }}
              className="flex-1 py-2 text-sm font-bold bg-white text-red-500 border border-red-300 rounded-full hover:bg-red-50 transition-all"
            >
              Reject
            </button>
          </>
        )}

        {/* Provider: accepted → start work */}
        {role === "serviceprovider" && order.status === "accepted" && (
          <button
            onClick={(e) => { e.stopPropagation(); handleStartWork(); }}
            className="flex-1 py-2 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
          >
            Start Work
          </button>
        )}

        {/* Provider: in-progress → complete */}
        {role === "serviceprovider" && order.status === "in-progress" && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(order); }}
            className="flex-1 py-2 text-sm font-bold bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all"
          >
            Mark Complete
          </button>
        )}

        {/* Customer or Provider: pending | accepted | in-progress → cancel */}
        {["pending", "accepted", "in-progress"].includes(order.status) && (
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(order); }}
            className="flex-1 py-2 text-sm font-bold bg-white text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;