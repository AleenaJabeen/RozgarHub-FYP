import React from "react";
import { MdOutlineShoppingBag } from "react-icons/md";

const OrderEmptyState = ({ activeTab }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-4 bg-gray-50 rounded-full mb-4">
        <MdOutlineShoppingBag className="text-gray-300 text-5xl" />
      </div>
      <h3 className="text-gray-800 font-bold text-xl mb-1">No orders found</h3>
      <p className="text-gray-500 text-sm">
        {activeTab
          ? `You don't have any ${activeTab} orders at the moment.`
          : "You haven't placed any orders yet. Start exploring services!"}
      </p>
    </div>
  );
};

export default OrderEmptyState;