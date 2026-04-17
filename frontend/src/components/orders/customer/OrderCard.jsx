import React from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineCalendar, HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineShoppingBag } from "react-icons/md";

const STATUS_STYLES = {
  pending:       "bg-amber-100 text-amber-700 border-amber-200",
  accepted:      "bg-blue-100 text-blue-700 border-blue-200",
  "in-progress": "bg-purple-100 text-purple-700 border-purple-200",
  completed:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected:      "bg-red-100 text-red-700 border-red-200",
  cancelled:     "bg-gray-100 text-gray-500 border-gray-200",
};

const StatusBadge = ({ status }) => (
  <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${STATUS_STYLES[status] || "bg-gray-100 text-gray-500"}`}>
    {status}
  </span>
);

const CustomerOrderCard = ({ order, onCancel }) => {
  const navigate = useNavigate();

  const gig = order.gigId;
  const provider = order.serviceProviderId?.user;
  const providerName = provider?.name || "Provider";

  const scheduledDate = order.scheduledDate
    ? new Date(order.scheduledDate).toLocaleDateString("en-PK", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

  return (
    <div
      onClick={() => navigate(`/customer/orders/${order._id}`)}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 hover:border-secondary cursor-pointer transition-all duration-200"
    >

      {/* Header: Icon, Title, Provider, and Badge */}
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
              Provider: <span className="font-semibold text-gray-600 capitalize">{providerName}</span>
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Details: Date, Location, Order Type */}
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

      {/* Billing Preview (Only shows if order is finished) */}
      {order.status === "completed" && order.totalAmount != null && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
          <span className="text-xs text-emerald-700 font-medium">Total Billed</span>
          <span className="text-sm font-bold text-emerald-700">Rs {order.totalAmount}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {["pending", "accepted", "in-progress"].includes(order.status) && (
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(order); }}
            className="flex-1 py-2 text-sm font-bold bg-white text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition-all"
          >
            Cancel Order
          </button>
        )}
      </div>

    </div>
  );
};

export default CustomerOrderCard;