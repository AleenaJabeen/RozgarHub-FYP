import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderById,
  cancelOrder,
  clearActiveOrder,
} from "../../../store/orders/order-slice";
import ActionModal from "../../../components/orders/ActionModal";
import { showToast } from "../../../utils/toastHelper";
import { HiArrowLeft, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";
import { MdOutlineShoppingBag, MdOutlineAccountBalanceWallet } from "react-icons/md";
import { IoPersonCircle, IoChevronForward, IoImageOutline } from "react-icons/io5";

import { getSocket, connectSocket } from "../../../socket/socket";

const STATUS_STYLES = {
  pending:       "bg-amber-100 text-amber-700 border-amber-200",
  accepted:      "bg-blue-100 text-blue-700 border-blue-200",
  "in-progress": "bg-purple-100 text-purple-700 border-purple-200",
  completed:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected:      "bg-red-100 text-red-700 border-red-200",
  cancelled:     "bg-gray-100 text-gray-500 border-gray-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-500"
    }`}
  >
    {status}
  </span>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-secondary text-base flex-shrink-0">{icon}</div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const dispatch    = useDispatch();

  const { activeOrder: order, loading, error } = useSelector((state) => state.orders);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getOrderById(orderId));

    let socket = getSocket();
    if (!socket) {
      socket = connectSocket();
    }

    // Define named handlers so we can cleanly remove them later
    const handleBroadcastClaimed = (claimedOrderId) => {
      if (claimedOrderId === orderId) {
        showToast("A provider has accepted your urgent request.", "success");
        dispatch(getOrderById(orderId)); 
      }
    };

    const handleOrderAutoCancelled = (cancelledOrderId) => {
      if (cancelledOrderId === orderId) {
        showToast("Order was auto-cancelled. No provider accepted in time.", "error");
        dispatch(getOrderById(orderId));
      }
    };

    // Attach listeners
    socket.on("broadcast_claimed", handleBroadcastClaimed);
    socket.on("order_auto_cancelled", handleOrderAutoCancelled);

    return () => { 
      dispatch(clearActiveOrder()); 
      
      if (socket) {
        socket.off("broadcast_claimed", handleBroadcastClaimed);
        socket.off("order_auto_cancelled", handleOrderAutoCancelled);
      }
    };
  }, [dispatch, orderId]);

  const handleCancelConfirm = async ({ cancellationReason }) => {
    try {
      await dispatch(cancelOrder({ orderId, cancellationReason })).unwrap();
      showToast("Order cancelled successfully.");
      setShowModal(false);
      navigate(-1);
    } catch (err) {
      showToast(err || "Something went wrong.", "error");
    }
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500 font-semibold">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-secondary text-white rounded-full text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  const gig           = order.gigId;
  const provider      = order.serviceProviderId;
  const providerUser  = provider?.user;
  const providerName  = providerUser?.name || provider?.name || "Unknown Provider";
  const isCancellable = ["pending", "accepted", "in-progress"].includes(order.status);
  const isBroadcast   = order.isBroadcast;

  const scheduledDate = order.scheduledDate
    ? new Date(order.scheduledDate).toLocaleDateString("en-PK", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className={`border rounded-2xl p-5 shadow-sm ${isBroadcast ? 'bg-amber-50/30 border-amber-200' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate(-1)}
                className="mt-0.5 p-2 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 hover:bg-gray-100 bg-white transition-all duration-200 flex-shrink-0 border border-gray-100"
              >
                <HiArrowLeft className="text-gray-600 text-lg" />
              </button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  {isBroadcast && (
                    <span className="flex items-center gap-1 text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                      Urgent
                    </span>
                  )}
                  <h1 className="text-lg font-bold text-gray-800">
                    {isBroadcast ? order.requestTitle : (gig?.title || "Order Details")}
                  </h1>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  Order ID: {order._id}
                </p>
              </div>
            </div>

            {isCancellable && (
              <button
                onClick={() => setShowModal(true)}
                className="self-start cursor-pointer sm:self-auto px-5 py-2 text-sm font-bold text-red-500 border border-red-200 bg-white rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 hover:bg-red-50 transition-all duration-200 flex-shrink-0"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Billing Summary — only visible after work is completed */}
            {order.status === "completed" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <MdOutlineAccountBalanceWallet className="text-secondary text-lg" />
                  <h3 className="text-base font-bold text-gray-800">Billing Summary</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Hours Worked</span>
                    <span className="text-gray-800 font-bold">{order.hoursWorked} hrs</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Hourly Rate</span>
                    <span className="text-gray-800 font-bold">Rs {order.hourlyRate}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-800">Total Amount</span>
                    <span className="text-lg font-extrabold text-[#0d7a5f]">
                      Rs {order.totalAmount}
                    </span>
                  </div>

                  {order.finalDescription && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Work Note</p>
                      <p className="text-sm text-gray-600 italic">"{order.finalDescription}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MdOutlineShoppingBag className="text-secondary text-lg" />
                <h3 className="text-base font-bold text-gray-800">Job Requirements</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.requirements || (
                  <span className="text-gray-300 italic">No specific requirements provided.</span>
                )}
              </p>
            </div>

            {order.orderImages?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <IoImageOutline className="text-secondary text-lg" />
                  <h3 className="text-base font-bold text-gray-800">Reference Images</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {order.orderImages.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square rounded-xl overflow-hidden border border-gray-100 hover:border-secondary hover:shadow-md transition-all"
                    >
                      <img
                        src={url}
                        alt={`Reference image ${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800">Logistics</h3>
              <InfoRow icon={<HiOutlineLocationMarker />} label="Service Location" value={order.serviceLocation} />
              
              {isBroadcast ? (
                 <InfoRow icon={<HiOutlineClock className="text-amber-500" />} label="Time Limit" value={order.responseTimeLimit} />
              ) : (
                 <InfoRow icon={<HiOutlineCalendar />} label="Scheduled Date" value={scheduledDate} />
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Service Provider</h3>

              {isBroadcast && order.status === "pending" ? (
                <div className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <p className="text-sm font-bold text-amber-800">Broadcasting Request...</p>
                  <p className="text-xs text-amber-600 mt-1">Waiting for nearby providers to accept your emergency request.</p>
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (provider?._id) navigate(`/customer/provider/${provider._id}`, { state: { providerProfile: provider } });
                  }}
                  className={`flex items-center gap-3 p-3 -mx-3 rounded-2xl transition-all duration-200 group ${provider?._id ? 'cursor-pointer hover:bg-gray-50 active:scale-95' : ''}`}
                >
                  {providerUser?.avatar ? (
                    <img
                      src={providerUser.avatar}
                      alt={providerName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <IoPersonCircle className="text-[48px] text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 capitalize truncate">
                      {providerName}
                    </p>
                  </div>
                  {provider?._id && <IoChevronForward className="text-gray-300 group-hover:text-secondary text-base transition-colors flex-shrink-0" />}
                </div>
              )}
            </div>

            {order.latePenaltyDiscount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-bold text-red-700">Late Start Penalty Applied</p>
                <p className="text-xs text-red-600 mt-1.5 leading-relaxed">
                  The service provider started the work past the target time. You will receive a {order.latePenaltyDiscount}% discount on the final bill.
                </p>
              </div>
            )}
            
            {order.status === "cancelled" && order.cancellationReason && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-700">Cancellation Note</p>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  {order.cancellationReason}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {showModal && (
        <ActionModal
          mode="cancel"
          loading={loading}
          onConfirm={handleCancelConfirm}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default OrderDetails;