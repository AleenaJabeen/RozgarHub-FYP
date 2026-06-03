import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HiOutlineCalendar, HiOutlineLocationMarker } from "react-icons/hi";
import { IoPersonCircle } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa"; // ✅ Imported Check Circle
import { startWork } from "../../../store/orders/order-slice";
import { showToast } from "../../../utils/toastHelper";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  accepted: "bg-blue-100 text-blue-700 border-blue-200",
  "in-progress": "bg-purple-100 text-purple-700 border-purple-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

const OrderCard = ({ order, role, onRespond, onCancel, onComplete }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const gig = order.gigId;
  const customer = order.customerId?.user;
  const displayName = customer?.name || "Customer";

  const isBroadcast = order.isBroadcast;
  const isCancellable = ["pending", "accepted", "in-progress"].includes(order.status);

  const scheduledDate = order.scheduledDate
    ? new Date(order.scheduledDate).toLocaleDateString("en-PK", {
        day: "numeric", month: "short", year: "numeric",
      })
    : order.inspectionTime
    ? new Date(order.inspectionTime).toLocaleDateString("en-PK", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "Unscheduled";

  const handleStartWork = async () => {
    try {
      await dispatch(startWork(order._id)).unwrap();
      showToast("Work started successfully.", "success");
    } catch (err) {
      showToast(err || "Something went wrong.", "error");
    }
  };

  return (
    <div 
      onClick={() => navigate(`/serviceprovider/orders/${order._id}`)}
      className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden flex flex-col transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
        isBroadcast ? "border-amber-200 hover:border-amber-400" : "border-gray-100 hover:border-secondary/50"
      }`}
    >
      <div className={`p-5 border-b flex justify-between items-start gap-4 transition-colors duration-300 ${isBroadcast ? "bg-amber-50/50" : "bg-white"}`}>
        <div>
          {isBroadcast ? (
            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
              Urgent Broadcast
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-secondary font-bold text-xs uppercase tracking-wider mb-1">
              {order.orderType}
            </div>
          )}
          
          <h3 className="text-lg font-extrabold text-gray-900 leading-tight line-clamp-1">
            {isBroadcast ? order.requestTitle : (gig?.title || "Custom Order")}
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">ID: {order._id.slice(-6)}</p>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize flex-shrink-0 ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-500"}`}>
          {order.status}
        </span>
      </div>

      <div className="p-5 flex-1 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2.5 text-sm text-gray-600">
            <span className="line-clamp-1 font-medium">{order.serviceLocation}</span>
          </div>

          {isBroadcast ? (
            <div className="flex items-center gap-2.5 text-sm text-red-600 font-bold">
              Target Time: {order.responseTimeLimit}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <HiOutlineCalendar className="text-gray-400 text-base flex-shrink-0" />
              <span className="font-medium">{scheduledDate}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {customer?.avatar ? (
              <img src={customer.avatar} alt="Customer" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            ) : (
              <IoPersonCircle className="text-[40px] text-gray-300" />
            )}
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-0.5">Customer</p>
              <p className="text-sm font-bold text-gray-800 capitalize line-clamp-1">
                {displayName}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ ADDED: Total Billed Badge with Payment Status */}
        {order.status === "completed" && order.totalAmount != null && (
          <div className="mt-2 flex items-center justify-between px-4 py-3 bg-[#e6f4f1] border border-[#b3ddd3] rounded-xl transition-all animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col">
               <span className="text-xs text-[#0d7a5f] font-bold uppercase tracking-wider">Total Billed</span>
               {order.isPaid ? (
                 <span className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5 flex items-center gap-1">
                   <FaCheckCircle/> Paid
                 </span>
               ) : (
                 <span className="text-[10px] text-red-500 font-bold uppercase mt-0.5 animate-pulse">
                   Payment Pending
                 </span>
               )}
            </div>
            <span className="text-base font-extrabold text-[#0d7a5f]">
              Rs {order.totalAmount}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-2">
        {role === "serviceprovider" && order.status === "pending" && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onRespond(order, "accept"); }}
              className="flex-1 py-2 text-sm font-bold bg-secondary text-white rounded-lg hover:bg-[#0e5641] transition-all"
            >
              Accept
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRespond(order, "reject"); }}
              className="flex-1 py-2 text-sm font-bold bg-white text-red-500 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all"
            >
              Reject
            </button>
          </>
        )}

        {role === "serviceprovider" && order.status === "accepted" && (
          <button
            onClick={(e) => { e.stopPropagation(); handleStartWork(); }}
            className="flex-1 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Start Work
          </button>
        )}

        {role === "serviceprovider" && order.status === "in-progress" && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(order); }}
            className="flex-1 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            Mark Complete
          </button>
        )}

        {isCancellable && (
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(order); }}
            className="flex-1 py-2 text-sm font-bold bg-white text-gray-500 border border-gray-200 rounded-lg hover:text-red-500 hover:bg-red-50 transition-all"
          >
            Cancel
          </button>
        )}

        {!["pending", "accepted", "in-progress"].includes(order.status) && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/serviceprovider/orders/${order._id}`); }}
            className="w-full py-2 text-sm font-bold text-secondary bg-white border border-gray-200 rounded-lg hover:border-secondary hover:text-white hover:bg-secondary transition-all"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;