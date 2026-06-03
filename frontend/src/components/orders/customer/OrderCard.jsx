import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { HiOutlineCalendar, HiOutlineLocationMarker } from "react-icons/hi";
import { IoPersonCircle } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa"; 
import { rebroadcastOrderThunk } from "../../../store/orders/order-slice";
import { showToast } from "../../../utils/toastHelper";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  "in-progress": "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const CustomerOrderCard = ({ order, onCancel }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [timeElapsed, setTimeElapsed] = useState("");
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const [isRebroadcasting, setIsRebroadcasting] = useState(false);

  const provider = order.serviceProviderId;
  const isCancellable = ["pending", "accepted", "in-progress"].includes(order.status);
  const isBroadcast = order.isBroadcast;
  const broadcastCount = order.broadcastCount || 1;

  useEffect(() => {
    if (!isBroadcast || order.status !== "pending") return;
    
    const updateTimers = () => {
      const now = new Date();
      const createdDiff = Math.floor((now - new Date(order.createdAt)) / 60000);
      
      if (createdDiff < 1) setTimeElapsed("Just now");
      else if (createdDiff < 60) setTimeElapsed(`${createdDiff} min ago`);
      else setTimeElapsed(`${Math.floor(createdDiff / 60)} hr ${createdDiff % 60} min ago`);

      const updateDiffSec = Math.floor((now - new Date(order.updatedAt)) / 1000);
      setSecondsSinceUpdate(updateDiffSec);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [isBroadcast, order.createdAt, order.updatedAt, order.status]);

  const handleRebroadcast = async () => {
    try {
      setIsRebroadcasting(true);
      await dispatch(rebroadcastOrderThunk(order._id)).unwrap();
      showToast("Alert re-sent to nearby providers.", "success");
    } catch (err) {
      showToast(err || "Failed to rebroadcast.", "error");
    } finally {
      setIsRebroadcasting(false);
    }
  };

  const canRebroadcast = isBroadcast && order.status === "pending" && secondsSinceUpdate >= 30 && broadcastCount < 3;

  return (
    <div 
      onClick={() => navigate(`/customer/orders/${order._id}`)}
      className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden flex flex-col transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
        isBroadcast ? "border-gray-100 hover:border-amber-400" : "border-gray-100 hover:border-secondary/50"
      }`}
    >
      {/* ✅ ADDED: border-gray-100 to make the line light gray */}
      <div className={`p-5 border-b border-gray-200 flex justify-between items-start gap-4 transition-colors duration-300 ${isBroadcast ? "bg-amber-50/50" : "bg-white"}`}>
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
            {isBroadcast ? order.requestTitle : (order.gigId?.title || "Custom Order")}
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">ID: {order._id.slice(-6)}</p>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize flex-shrink-0 ${STATUS_COLORS[order.status]}`}>
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
              Target: {order.responseTimeLimit}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <HiOutlineCalendar className="text-gray-400 text-base flex-shrink-0" />
              <span className="font-medium">
                {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : order.inspectionTime ? new Date(order.inspectionTime).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : "Unscheduled"}
              </span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          {isBroadcast && order.status === "pending" ? (
            <div className="flex flex-col gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 items-start">
              <div className="w-full">
                <p className="text-xs font-bold text-amber-800">Broadcasting to Providers...</p>
                <p className="text-[10px] font-semibold text-amber-600 mt-0.5 flex items-center gap-1">
                  Attempt {broadcastCount}/3 • Placed {timeElapsed}
                </p>
              </div>
              
              {canRebroadcast && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRebroadcast();
                  }}
                  disabled={isRebroadcasting}
                  className="w-auto px-5 py-2 mt-1 text-xs font-bold text-white bg-[#0d7a5f] rounded-lg hover:bg-[#095c47] transition-colors disabled:opacity-50"
                >
                  {isRebroadcasting ? "Sending..." : `Send Alert Again (${3 - broadcastCount} left)`}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 group">
              {provider?.user?.avatar ? (
                <img src={provider.user.avatar} alt="Provider" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
              ) : (
                <IoPersonCircle className="text-[40px] text-gray-300" />
              )}
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-0.5">Service Provider</p>
                <p className="text-sm font-bold text-gray-800 capitalize line-clamp-1">
                  {provider?.user?.name || provider?.name || "Waiting for Provider"}
                </p>
              </div>
            </div>
          )}
        </div>

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

      <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/customer/orders/${order._id}`);
          }}
          className="flex-1 py-2 text-sm font-bold text-secondary bg-white border border-gray-200 rounded-lg hover:border-secondary hover:text-white hover:bg-secondary transition-all"
        >
          View Details
        </button>
        {isCancellable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(order);
            }}
            className="px-4 py-2 text-sm font-bold text-red-500 bg-white border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerOrderCard;