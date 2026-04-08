import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrders, cancelOrder, clearOrderError } from "../../../store/orders/order-slice";
import { showToast } from "../../../utils/toastHelper";
import { MdOutlineShoppingBag } from "react-icons/md";

// Modular Components
import OrderTabs from "../../../components/orders/customer/OrderTabs";
import OrderEmptyState from "../../../components/orders/customer/OrderEmptyState";
import CustomerOrderCard from "../../../components/orders/customer/OrderCard";
import ActionModal from "../../../components/orders/ActionModal";

const CustomerOrderManagement = () => {
  const dispatch = useDispatch();
  const { orders, pagination, loading, error } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState("");
  const [modal, setModal] = useState(null);

  // Fetch orders whenever the tab changes
  useEffect(() => {
    dispatch(getOrders({ status: activeTab }));
  }, [dispatch, activeTab]);

  // Clean up errors on unmount
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-secondary rounded-xl shadow-sm">
            <MdOutlineShoppingBag className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-sm text-gray-500 font-medium">
              {pagination?.total ?? 0} order{pagination?.total !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* Modular Tabs */}
        <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Error State */}
        {error && (
          <div className="mb-6 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && orders.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary border-t-transparent" />
          </div>
        ) : (
          /* Data / Empty State */
          <>
            {orders.length === 0 ? (
              <OrderEmptyState activeTab={activeTab} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders.map((order) => (
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

        {/* Pagination (Only shows if more than 1 page) */}
        {pagination?.totalPages > 1 && (
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

      {/* Modular Modal */}
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