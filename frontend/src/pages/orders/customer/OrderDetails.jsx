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
import { HiArrowLeft, HiOutlineCalendar, HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineShoppingBag, MdOutlineAccountBalanceWallet } from "react-icons/md";
import { IoPersonCircle, IoTimeOutline, IoImageOutline, IoChevronForward } from "react-icons/io5";
import { FaStar } from "react-icons/fa";

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
    return () => { dispatch(clearActiveOrder()); };
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
  // Fix 4: robust name fallback
  const providerName  = providerUser?.name || provider?.name || "Unknown Provider";
  const isCancellable = ["pending", "accepted", "in-progress"].includes(order.status);

  const scheduledDate = order.scheduledDate
    ? new Date(order.scheduledDate).toLocaleDateString("en-PK", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const inspectionDate = order.inspectionTime
    ? new Date(order.inspectionTime).toLocaleDateString("en-PK", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-start gap-4">
              {/* Fix 3: interactive Go Back button */}
              <button
                onClick={() => navigate(-1)}
                className="mt-0.5 p-2 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
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

            {/* Fix 3: interactive Cancel button */}
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

        {/* ── Two-Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* Job Requirements */}
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

            {/* Fix 2: Reference Images — only render if array is non-empty */}
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
                        onError={(e) => {
                          e.currentTarget.src = "";
                          e.currentTarget.alt = "Image unavailable";
                          e.currentTarget.className = "w-full h-full object-cover bg-gray-100";
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {(order.orderType === "UrgentHire" || order.orderType === "InspectionHire") && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <IoTimeOutline className="text-secondary text-lg" />
                  <h3 className="text-base font-bold text-gray-800">Special Instructions</h3>
                </div>

                {order.orderType === "UrgentHire" && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
                    <IoTimeOutline className="text-amber-500 text-lg flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                        Response Time Limit
                      </p>
                      <p className="text-sm font-bold text-amber-700 mt-0.5">
                        {order.responseTimeLimit || "—"}
                      </p>
                    </div>
                  </div>
                )}

                {order.orderType === "InspectionHire" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl">
                      <HiOutlineCalendar className="text-blue-500 text-lg flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                          Inspection Time
                        </p>
                        <p className="text-sm font-bold text-blue-700 mt-0.5">
                          {inspectionDate || "—"}
                        </p>
                      </div>
                    </div>
                    {order.inspectionNotes && (
                      <p className="text-sm text-gray-600 px-1 leading-relaxed">
                        {order.inspectionNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-5">

            {/* Logistics */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800">Logistics</h3>
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
            </div>

            {/* Fix 1: Clickable Service Provider card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Service Provider</h3>

              <div
                onClick={() => navigate(`/customer/provider/${provider?._id}`, { 
                  state: { providerProfile: provider } 
                })}
                className="flex items-center gap-3 p-3 -mx-3 rounded-2xl cursor-pointer hover:bg-gray-50 active:scale-95 transition-all duration-200 group"
              >
                {providerUser?.avatar ? (
                  <img
                    src={providerUser.avatar}
                    alt={providerName}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
                  />
                ) : (
                  <IoPersonCircle className="text-[48px] text-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {/* Fix 4: robust name fallback */}
                  <p className="text-sm font-bold text-gray-800 capitalize truncate">
                    {providerName}
                  </p>
                  {provider?.averageRating > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <FaStar className="text-amber-400 text-xs" />
                      <span className="text-xs font-semibold text-gray-600">
                        {provider.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({provider.totalReviews || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
                <IoChevronForward className="text-gray-300 group-hover:text-secondary text-base transition-colors flex-shrink-0" />
              </div>

              {provider?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {provider.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Billing Summary */}
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