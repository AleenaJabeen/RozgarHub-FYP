import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineShoppingBag } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import { FaSearchPlus, FaBolt } from "react-icons/fa";
import PlaceOrderForm from "../../../components/orders/customer/PlaceOrderForm";
import { showToast } from "../../../utils/toastHelper";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const gig = location.state?.gig || null;
  const serviceProviderId = location.state?.serviceProviderId || null;
  const bookingType = location.state?.bookingType || "hourly"; 
  const isBroadcast = location.state?.isBroadcast || false;

  // ✅ FIX 1: Initialize locLoading to true ONLY if it's a broadcast.
  // This prevents the empty form from flashing on the screen before the spinner appears.
  const [locLoading, setLocLoading] = useState(isBroadcast);
  const [broadcastCoords, setBroadcastCoords] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Fetch Geolocation
  useEffect(() => {
    if (!isBroadcast) return;

    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser. Broadcast requires location.", "error");
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBroadcastCoords({
          longitude: pos.coords.longitude,
          latitude:  pos.coords.latitude,
        });
        setLocLoading(false); // Done loading!
      },
      () => {
        showToast(
          "Location permission denied. Please enable location access — urgent broadcasts require your coordinates to find nearby providers.",
          "error"
        );
        setLocLoading(false);
        navigate(-1);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isBroadcast, navigate]);

  // ✅ FIX 2: Only trigger the animation AFTER the loading is completely finished.
  useEffect(() => {
    if (!isBroadcast && (!gig || !serviceProviderId)) {
      navigate("/customer/services");
      return;
    }

    if (!locLoading) {
      // A tiny 50ms delay ensures the DOM paints the hidden form first before transitioning
      const timer = setTimeout(() => setIsReady(true), 50); 
      return () => clearTimeout(timer);
    }
  }, [gig, serviceProviderId, isBroadcast, locLoading, navigate]);

  if (!isBroadcast && (!gig || !serviceProviderId)) return null;

  const handleSuccess = () => {
    navigate("/customer/orders");
  };

  const getTypeDisplay = () => {
    switch(bookingType) {
      case 'urgent':
        return {
          title: "Urgent Hiring Broadcast",
          desc: "Alert all nearby providers • Premium Rate",
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
    <div className="min-h-screen bg-gray-50 flex flex-col pt-10">
      
      {locLoading ? (
        // Smoother, cleaner loading state
        <div className="flex-1 flex flex-col items-center justify-center gap-5 mt-[-10vh]">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-70"></div>
            <div className="relative bg-white p-4 rounded-full shadow-md border border-amber-100">
              <FaBolt className="text-amber-500 text-2xl animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-amber-800 font-bold tracking-wide animate-pulse">
            Fetching your location for broadcast...
          </p>
        </div>
      ) : (
        // ✅ FIX 3: Added a beautiful slide-up (translate-y-8) and pop-in (scale-95) effect
        <div 
          className={`w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out transform ${
            isReady ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            
            {/* Page Header */}
            <div className={`px-8 py-7 text-white ${isBroadcast ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-secondary'}`}>
              <div className="flex items-center gap-3 mb-2">
                <MdOutlineShoppingBag className="text-3xl opacity-90" />
                <h1 className="text-2xl font-bold tracking-tight">
                  {isBroadcast ? "Urgent Hiring Request" : "Place Your Order"}
                </h1>
              </div>
              <p className="opacity-90 text-sm font-medium">
                {isBroadcast 
                  ? "This urgent request will be sent to all online providers matching your needs."
                  : <>You are requesting the service: <span className="font-bold underline decoration-white/30 underline-offset-2">{gig?.title}</span></>
                }
              </p>
            </div>

            <div className="p-8">
              <div className={`flex items-center gap-4 p-4 mb-8 rounded-xl border ${displayConfig.color}`}>
                <div className="p-3 bg-white rounded-xl shadow-sm flex-shrink-0">
                  {displayConfig.icon}
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase opacity-70 mb-0.5">Selected Order Type</p>
                  <h3 className="text-lg font-bold leading-tight">{displayConfig.title}</h3>
                  <p className="text-sm font-medium opacity-80">{displayConfig.desc}</p>
                </div>
              </div>

              <PlaceOrderForm 
                gig={gig} 
                serviceProviderId={serviceProviderId} 
                bookingType={bookingType} 
                isBroadcast={isBroadcast}
                broadcastCoords={broadcastCoords}
                onSuccess={handleSuccess} 
              />
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;