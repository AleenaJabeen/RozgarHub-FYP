import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineShoppingBag } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import { FaSearchPlus, FaBolt } from "react-icons/fa";
import PlaceOrderForm from "../../../components/orders/customer/PlaceOrderForm";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false); // ✅ Used for fade-in animation

  const gig = location.state?.gig;
  const serviceProviderId = location.state?.serviceProviderId;
  const bookingType = location.state?.bookingType || "hourly"; // Catch the passed state

  useEffect(() => {
    if (!gig || !serviceProviderId) {
      navigate("/customer/services");
    } else {
      // Trigger simple fade-in effect on mount
      setTimeout(() => setIsReady(true), 100);
    }
  }, [gig, serviceProviderId, navigate]);

  if (!gig || !serviceProviderId) return null;

  // When the form finishes, redirect to the orders page
  const handleSuccess = () => {
    navigate("/customer/orders");
  };

  // ── Beautiful Type Indicator Mappings ──
  const getTypeDisplay = () => {
    switch(bookingType) {
      case 'urgent':
        return {
          title: "Urgent Hiring",
          desc: "Priority Response • Premium Rate",
          color: "bg-amber-50 border-amber-200 text-amber-800",
          icon: <FaBolt className="text-amber-500 text-xl" />
        };
      case 'inspection':
        return {
          title: "Pre-Work Inspection",
          desc: "On-site Assessment • Fixed Rate",
          color: "bg-purple-50 border-purple-200 text-purple-800",
          icon: <FaSearchPlus className="text-purple-500 text-xl" />
        };
      default:
        return {
          title: "Standard Hourly Booking",
          desc: "Regular Scheduling • Base Rate",
          color: "bg-blue-50 border-blue-200 text-blue-800",
          icon: <IoTimeOutline className="text-blue-500 text-2xl" />
        };
    }
  };

  const displayConfig = getTypeDisplay();

  return (
    <div className={`min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transform transition-all translate-y-0">
        
        {/* Page Header */}
        <div className="bg-secondary px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <MdOutlineShoppingBag className="text-3xl opacity-80" />
            <h1 className="text-2xl font-bold">Place Your Order</h1>
          </div>
          <p className="opacity-90 text-sm">
            You are requesting the service: <span className="font-bold underline decoration-white/30 underline-offset-2">{gig.title}</span>
          </p>
        </div>

        <div className="p-8">
          {/* ✅ Beautiful Order Type Indicator Banner */}
          <div className={`flex items-center gap-4 p-4 mb-8 rounded-xl border ${displayConfig.color}`}>
            <div className="p-3 bg-white rounded-lg shadow-sm flex-shrink-0">
              {displayConfig.icon}
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider uppercase opacity-70 mb-0.5">Selected Order Type</p>
              <h3 className="text-lg font-bold leading-tight">{displayConfig.title}</h3>
              <p className="text-sm font-medium opacity-80">{displayConfig.desc}</p>
            </div>
          </div>

          {/* Modular Form Component */}
          {/* IMPORTANT: We are passing bookingType as a prop so PlaceOrderForm knows what type it is! */}
          <PlaceOrderForm 
            gig={gig} 
            serviceProviderId={serviceProviderId} 
            bookingType={bookingType} 
            onSuccess={handleSuccess} 
          />
        </div>

      </div>
    </div>
  );
};

export default PlaceOrder;