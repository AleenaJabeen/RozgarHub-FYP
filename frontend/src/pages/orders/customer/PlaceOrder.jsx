import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineShoppingBag } from "react-icons/md";
import PlaceOrderForm from "../../../components/orders/customer/PlaceOrderForm";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const gig = location.state?.gig;
  const serviceProviderId = location.state?.serviceProviderId;


  React.useEffect(() => {
    if (!gig || !serviceProviderId) {
      navigate("/customer/services");
    }
  }, [gig, serviceProviderId, navigate]);

  if (!gig || !serviceProviderId) return null;

  // When the form finishes, redirect to the orders page
  const handleSuccess = () => {
    navigate("/customer/orders");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Page Header */}
        <div className="bg-secondary px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <MdOutlineShoppingBag className="text-3xl opacity-80" />
            <h1 className="text-2xl font-bold">Place Your Order</h1>
          </div>
          <p className="opacity-90">
            You are requesting the service: <span className="font-bold">{gig.title}</span>
          </p>
        </div>

        {/* Modular Form Component */}
        <div className="p-8">
          <PlaceOrderForm 
            gig={gig} 
            serviceProviderId={serviceProviderId} 
            onSuccess={handleSuccess} 
          />
        </div>

      </div>
    </div>
  );
};

export default PlaceOrder;