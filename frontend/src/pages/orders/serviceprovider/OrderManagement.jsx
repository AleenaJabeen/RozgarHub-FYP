import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrders,
  respondToOrder,
  completeOrder,
  cancelOrder,
  clearOrderError,
} from "../../../store/orders/order-slice";
import OrderCard from "../../../components/orders/serviceprovider/OrderCard";
import ActionModal from "../../../components/orders/ActionModal";
import { showToast } from "../../../utils/toastHelper";
import { MdOutlineShoppingBag } from "react-icons/md";
import { FaBolt } from "react-icons/fa";

const TABS = [
  { label: "All",         value: ""            },
  { label: "Pending",     value: "pending"      },
  { label: "Accepted",    value: "accepted"     },
  { label: "In Progress", value: "in-progress"  },
  { label: "Completed",   value: "completed"    },
  { label: "Cancelled",   value: "cancelled"    },
];

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, pagination, loading, error } = useSelector(
    (state) => state.orders
  );

  const [activeTab, setActiveTab] = useState("");
  const [modal, setModal] = useState(null);
  const [showOnlyBroadcasts, setShowOnlyBroadcasts] = useState(false);

  useEffect(() => {
    const params = activeTab ? { status: activeTab } : {};
    dispatch(getOrders(params));
  }, [dispatch, activeTab]);

  useEffect(() => () => { dispatch(clearOrderError()); }, [dispatch]);

  const handleRespond = (order, action) => {
    if (action === "accept") {
      dispatch(respondToOrder({ orderId: order._id, action: "accept" }))
        .unwrap()
        .then(() => showToast("Order accepted.", "success"))
        .catch((err) => showToast(err || "Something went wrong.", "error"));
    } else {
      setModal({ mode: "reject", order, action });
    }
  };

  const handleCancel = (order) => {
    setModal({ mode: "cancel", order });
  };

  const handleComplete = (order) => {
    setModal({ 
       mode: "complete", 
       order, 
       rate: order.hourlyRate || order.gigId?.hourlyRate 
    });
  };

  const handleModalConfirm = async (fields) => {
    const { mode, order } = modal;

    try {
      if (mode === "reject") {
        await dispatch(
          respondToOrder({
            orderId: order._id,
            action: "reject",
            cancellationReason: fields.cancellationReason,
          })
        ).unwrap();
        showToast("Order rejected.", "success");
      }

      if (mode === "cancel") {
        await dispatch(
          cancelOrder({
            orderId: order._id,
            cancellationReason: fields.cancellationReason,
          })
        ).unwrap();
        showToast("Order cancelled.", "success");
      }

      if (mode === "complete") {
        await dispatch(
          completeOrder({
            orderId:          order._id,
            hoursWorked:      Number(fields.hoursWorked),
            hourlyRate:       Number(fields.hourlyRate),
            finalDescription: fields.finalDescription,
          })
        ).unwrap();
        showToast("Order marked as completed.", "success");
      }

      setModal(null);
    } catch (err) {
      showToast(err || "Something went wrong.", "error");
    }
  };

  const filteredOrders = showOnlyBroadcasts 
    ? orders.filter(order => order.isBroadcast === true) 
    : orders;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-secondary rounded-xl">
            <MdOutlineShoppingBag className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-sm text-gray-400">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-5 py-2 text-sm font-bold rounded-full transition-all border ${
                  activeTab === tab.value
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 w-max select-none">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={showOnlyBroadcasts}
                onChange={() => setShowOnlyBroadcasts(!showOnlyBroadcasts)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${showOnlyBroadcasts ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showOnlyBroadcasts ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <FaBolt className={showOnlyBroadcasts ? "text-amber-500" : "text-gray-400"} />
              Urgent Only
            </span>
          </label>
        </div>

        {error && (
          <div className="mb-6 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {loading && filteredOrders.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
          </div>
        ) : (
          <>
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MdOutlineShoppingBag className="text-gray-200 text-6xl mb-4" />
                <p className="text-gray-400 font-semibold text-lg">No orders found</p>
                <p className="text-gray-300 text-sm mt-1">
                  {activeTab
                    ? `No ${activeTab} orders at the moment.`
                    : "You don't have any orders yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    role={user?.role}
                    onRespond={handleRespond}
                    onCancel={handleCancel}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {pagination && pagination.totalPages > 1 && !showOnlyBroadcasts && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() =>
                  dispatch(
                    getOrders({
                      ...(activeTab ? { status: activeTab } : {}),
                      page: p,
                    })
                  )
                }
                className={`w-9 h-9 rounded-full text-sm font-bold transition-all border ${
                  pagination.page === p
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white text-gray-500 border-gray-200 hover:border-secondary hover:text-secondary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ActionModal
          mode={modal.mode}
          loading={loading}
          onConfirm={handleModalConfirm}
          onClose={() => setModal(null)}
          prefilledRate={modal.rate}
        />
      )}
    </div>
  );
};

export default OrderManagement;