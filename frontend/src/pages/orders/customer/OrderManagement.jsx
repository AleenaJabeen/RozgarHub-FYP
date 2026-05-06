import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; 
import { getOrders, cancelOrder, clearOrderError } from "../../../store/orders/order-slice";
import { showToast } from "../../../utils/toastHelper";
import { MdOutlineShoppingBag } from "react-icons/md";
import { FaBolt } from "react-icons/fa"; 

import OrderTabs from "../../../components/orders/customer/OrderTabs";
import OrderEmptyState from "../../../components/orders/customer/OrderEmptyState";
import CustomerOrderCard from "../../../components/orders/customer/OrderCard";
import ActionModal from "../../../components/orders/ActionModal";

const CustomerOrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const { orders, pagination, loading, error } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState("");
  const [modal, setModal] = useState(null);
  
  const [showOnlyBroadcasts, setShowOnlyBroadcasts] = useState(false);

  useEffect(() => {
    dispatch(getOrders({ status: activeTab }));
  }, [dispatch, activeTab]);

  useEffect(() => () => { dispatch(clearOrderError()); }, [dispatch]);

  const handleCancelClick = (order) => {
    setModal({ mode: "cancel", order });
  };

  const handleModalConfirm = async (fields) => {
    try {
      await dispatch(
        cancelOrder({
          orderId: modal.order._id,
          cancellationReason: fields.cancellationReason,
        })
      ).unwrap();
      showToast("Order cancelled successfully.", "success");
      setModal(null);
    } catch (err) {
      showToast(err || "Failed to cancel order.", "error");
    }
  };

  const filteredOrders = showOnlyBroadcasts 
    ? orders.filter(order => order.isBroadcast === true) 
    : orders;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-secondary rounded-xl shadow-sm">
              <MdOutlineShoppingBag className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
              <p className="text-sm text-gray-500 font-medium">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/customer/place-order", { 
              state: { bookingType: 'urgent', isBroadcast: true } 
            })}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0d7a5f] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#095c47] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <FaBolt />
            Broadcast Urgent Request
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />
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
          <div className="mb-6 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-bold">
            {error}
          </div>
        )}

        {loading && orders.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary border-t-transparent" />
          </div>
        ) : (
          <>
            {filteredOrders.length === 0 ? (
              <OrderEmptyState activeTab={activeTab} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <CustomerOrderCard
                    key={order._id}
                    order={order}
                    onCancel={handleCancelClick}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {pagination?.totalPages > 1 && !showOnlyBroadcasts && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => dispatch(getOrders({ status: activeTab, page: p }))}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-all border shadow-sm ${
                  pagination.page === p
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary"
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
        />
      )}
    </div>
  );
};

export default CustomerOrderManagement;