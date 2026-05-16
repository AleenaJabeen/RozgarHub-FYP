import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderById,
  respondToOrder,
  startWork,
  completeOrder,
  cancelOrder,
  clearActiveOrder,
  clearOrderError,
} from "../../../store/orders/order-slice";
import ActionModal from "../../../components/orders/ActionModal";
import { showToast } from "../../../utils/toastHelper";
import { HiArrowLeft, HiOutlineCalendar, HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineShoppingBag, MdOutlineAccountBalanceWallet } from "react-icons/md";
import { IoPersonCircle, IoTimeOutline, IoCallOutline, IoMailOutline } from "react-icons/io5";
import { FaCheckCircle, FaTimesCircle, FaPlayCircle, FaFlagCheckered, FaBan } from "react-icons/fa";

// ─────────────────────────────────────────────
// Status Badge — same colour map as OrderCard
// ─────────────────────────────────────────────
const STATUS_STYLES = {
  pending:       "bg-amber-100  text-amber-700  border-amber-200",
  accepted:      "bg-blue-100   text-blue-700   border-blue-200",
  "in-progress": "bg-purple-100 text-purple-700 border-purple-200",
  completed:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected:      "bg-red-100    text-red-700    border-red-200",
  cancelled:     "bg-gray-100   text-gray-500   border-gray-200",
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

// ─────────────────────────────────────────────
// Info Row — icon + label + value
// ─────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-secondary text-base flex-shrink-0">{icon}</div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const dispatch    = useDispatch();

  const { activeOrder: order, loading, error } = useSelector((state) => state.orders);
  const [modal, setModal] = useState(null); // { mode }

  // Fetch on mount — clear both order and error on unmount
  useEffect(() => {
    dispatch(getOrderById(orderId));
    return () => {
      dispatch(clearActiveOrder());
      dispatch(clearOrderError());
    };
  }, [dispatch, orderId]);

  // ── Action Handlers ──────────────────────────────────────────────
  const handleAccept = () => {
    dispatch(respondToOrder({ orderId, action: "accept" }))
      .unwrap()
      .then(() => showToast("Order accepted."))
      .catch((err) => showToast(err || "Something went wrong.", "error"));
  };

  const handleStartWork = () => {
    dispatch(startWork(orderId))
      .unwrap()
      .then(() => showToast("Work started."))
      .catch((err) => showToast(err || "Something went wrong.", "error"));
  };

  const handleModalConfirm = async (fields) => {
    try {
      if (modal.mode === "reject") {
        await dispatch(
          respondToOrder({ orderId, action: "reject", cancellationReason: fields.cancellationReason })
        ).unwrap();
        showToast("Order rejected.");
      }
      if (modal.mode === "cancel") {
        await dispatch(
          cancelOrder({ orderId, cancellationReason: fields.cancellationReason })
        ).unwrap();
        showToast("Order cancelled.");
      }
      if (modal.mode === "complete") {
        await dispatch(
          completeOrder({
            orderId,
            hoursWorked:      Number(fields.hoursWorked),
            hourlyRate:       Number(fields.hourlyRate),
            finalDescription: fields.finalDescription,
          })
        ).unwrap();
        showToast("Order marked as completed.");
      }
      setModal(null);
    } catch (err) {
      showToast(err || "Something went wrong.", "error");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500 font-semibold">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-secondary text-white rounded-full text-sm font-bold hover:bg-[#0e5641] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  const gig          = order.gigId;
  const customerDoc  = order.customerId;
  const customerUser = customerDoc?.user;
  const customerName = customerUser?.name || customerDoc?.name || "Customer";

  const scheduledDate = order.scheduledDate
    ? new Date(order.scheduledDate).toLocaleDateString("en-PK", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const isCancellable = ["pending", "accepted", "in-progress"].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate(-1)}
                className="mt-0.5 p-2 rounded-full hover:bg-gray-100 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex-shrink-0"
              >
                <HiArrowLeft className="text-gray-600 text-lg" />
              </button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-lg font-bold text-gray-800">
                    {gig?.title || "Order Details"}
                  </h1>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  Order ID: {order._id}
                </p>
              </div>
            </div>

            {/* Order type pill */}
            <span className="self-start sm:self-auto text-xs font-bold px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full capitalize">
              {order.orderType}
            </span>
          </div>
        </div>

        {/* ── 12-Column Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ══════════════════════════════════════
              LEFT COLUMN — 8 spans
          ══════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-6">

            {/* ✅ UPDATED: Clickable Customer Details Card */}
            <div 
              onClick={() => navigate(`/serviceprovider/customer/${customerDoc?._id}`, { 
                state: { customerProfile: customerDoc } 
              })}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-secondary/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800">Customer Details</h3>
                <span className="text-xs font-bold text-secondary opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                  View Full Profile &rarr;
                </span>
              </div>

              <div className="flex items-center gap-4">
                {customerUser?.avatar ? (
                  <img
                    src={customerUser.avatar}
                    alt={customerName}
                    loading="lazy"
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
                  />
                ) : (
                  <IoPersonCircle className="text-[56px] text-gray-300 flex-shrink-0" />
                )}
                <div>
                  <p className="text-base font-bold text-gray-800 capitalize group-hover:text-secondary transition-colors">{customerName}</p>
                  {customerUser?.email && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                      <IoMailOutline className="text-secondary text-sm" />
                      {customerUser.email}
                    </span>
                  )}
                  {customerUser?.phone && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <IoCallOutline className="text-secondary text-sm" />
                      {customerUser.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Service Location & Timing Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-5">Service Location & Timing</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoRow
                  icon={<HiOutlineLocationMarker />}
                  label="Service Location"
                  value={order.serviceLocation}
                />
                <InfoRow
                  icon={<HiOutlineCalendar />}
                  label="Scheduled Date"
                  value={scheduledDate}
                />
                <InfoRow
                  icon={<MdOutlineShoppingBag />}
                  label="Order Type"
                  value={order.orderType}
                />
                {order.orderType === "UrgentHire" && order.responseTimeLimit && (
                  <InfoRow
                    icon={<IoTimeOutline />}
                    label="Response Time Limit"
                    value={order.responseTimeLimit}
                  />
                )}
                {order.orderType === "InspectionHire" && order.inspectionTime && (
                  <InfoRow
                    icon={<IoTimeOutline />}
                    label="Inspection Time"
                    value={new Date(order.inspectionTime).toLocaleDateString("en-PK", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  />
                )}
              </div>

              {order.orderType === "InspectionHire" && order.inspectionNotes && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Inspection Notes
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{order.inspectionNotes}</p>
                </div>
              )}
            </div>

            {/* Job Requirements Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4">Job Requirements</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {order.requirements || (
                  <span className="text-gray-300 italic">No specific requirements provided by the customer.</span>
                )}
              </p>
            </div>

            {/* Reference Images */}
            {order.orderImages?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-4">Reference Images</h3>
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
                        alt={`Reference ${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════
              RIGHT COLUMN — 4 spans (sidebar)
          ══════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-5">

            {/* ── Action Panel ─────────────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-6">
              <h3 className="font-bold text-gray-800 mb-4">Actions</h3>

              <div className="space-y-3">

                {/* PENDING → Accept / Reject */}
                {order.status === "pending" && (
                  <>
                    <button
                      onClick={handleAccept}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold bg-secondary text-white rounded-full hover:bg-[#0e5641] hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaCheckCircle className="text-base" />
                      Accept Order
                    </button>
                    <button
                      onClick={() => setModal({ mode: "reject" })}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold bg-white text-red-500 border border-red-200 rounded-full hover:bg-red-50 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <FaTimesCircle className="text-base" />
                      Reject Order
                    </button>
                  </>
                )}

                {/* ACCEPTED → Start Work */}
                {order.status === "accepted" && (
                  <button
                    onClick={handleStartWork}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlayCircle className="text-base" />
                    Start Work
                  </button>
                )}

                {/* IN-PROGRESS → Mark Complete */}
                {order.status === "in-progress" && (
                  <button
                    onClick={() => setModal({ mode: "complete" , rate: gig?.hourlyRate})}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold bg-purple-600 text-white rounded-full hover:bg-purple-700 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FaFlagCheckered className="text-base" />
                    Mark as Complete
                  </button>
                )}

                {/* PENDING | ACCEPTED | IN-PROGRESS → Cancel */}
                {isCancellable && (
                  <button
                    onClick={() => setModal({ mode: "cancel" })}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold bg-white text-gray-500 border border-gray-200 rounded-full hover:text-red-500 hover:border-red-200 hover:bg-red-50 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FaBan className="text-base" />
                    Cancel Order
                  </button>
                )}

                {/* Terminal statuses — no actions available */}
                {["completed", "rejected", "cancelled"].includes(order.status) && (
                  <div className="text-center py-3">
                    <p className="text-xs text-gray-400 italic">
                      No further actions available for this order.
                    </p>
                  </div>
                )}
              </div>

              {/* Status context hint */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Current Status</span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            </div>

            {/* ── Billing Summary (completed only) ─────────────────────────── */}
            {order.status === "completed" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MdOutlineAccountBalanceWallet className="text-secondary text-lg" />
                  <h3 className="font-bold text-gray-800">Billing Summary</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Hours Worked</span>
                    <span className="font-semibold text-gray-800">
                      {order.hoursWorked ?? "—"} hrs
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Hourly Rate</span>
                    <span className="font-semibold text-gray-800">
                      Rs {order.hourlyRate ?? "—"}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Total Amount</span>
                    <span className="text-base font-bold text-secondary">
                      Rs {order.totalAmount ?? "—"}
                    </span>
                  </div>
                  {order.finalDescription && (
                    <p className="text-xs text-gray-500 pt-1 leading-relaxed border-t border-gray-100">
                      {order.finalDescription}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Cancellation Info (rejected/cancelled only) ───────────────── */}
            {(order.status === "rejected" || order.status === "cancelled") &&
              order.cancellationReason && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">
                  {order.status === "rejected" ? "Rejection Reason" : "Cancellation Reason"}
                </p>
                <p className="text-sm text-red-700 leading-relaxed">
                  {order.cancellationReason}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Action Modal ─────────────────────────────────────────────────────── */}
      {modal && (
        <ActionModal
          mode={modal.mode}
          loading={loading}
          onConfirm={handleModalConfirm}
          onClose={() => setModal(null)}
          prefilledRate={order.isBroadcast ? order.hourlyRate : order.gigId?.hourlyRate}
        />
      )}
    </div>
  );
};

export default OrderDetails;