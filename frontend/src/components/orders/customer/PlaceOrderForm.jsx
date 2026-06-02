import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../../../store/orders/order-slice";
import { getCategories } from "../../../store/serviceProvider/category-slice"; 
import { showToast } from "../../../utils/toastHelper";
import { MdUploadFile } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { 
  HiOutlineLocationMarker, 
  HiOutlineCalendar, 
  HiOutlineClock, 
  HiOutlineDocumentText,
  HiOutlineBriefcase,
  HiOutlineTag
} from "react-icons/hi";

// Strict list for urgent broadcast categories
const URGENT_ALLOWED_CATEGORIES = [
  "Plumber",
  "Electrician",
  "Car Mechanic",
  "AC & Fridge Repair",
  "Appliance Repair",
  "Carpenter",
  "Labor Work",
  "CCTV Installation"
];

const PlaceOrderForm = ({ gig, serviceProviderId, bookingType = "hourly", isBroadcast = false, broadcastCoords, onSuccess }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.orders);
  const { categories = [] } = useSelector((state) => state.categories);

  const [minDateTime, setMinDateTime] = useState("");

  useEffect(() => {
    if (isBroadcast && categories.length === 0) {
      dispatch(getCategories());
    }
  }, [dispatch, isBroadcast, categories.length]);

  // ✅ Generate current datetime to block past dates on the calendar
  useEffect(() => {
    const now = new Date();
    // Adjust for local timezone offset so the input 'min' attribute works correctly
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMinDateTime(now.toISOString().slice(0, 16));
  }, []);

  const urgentCategories = categories.filter((cat) => 
    URGENT_ALLOWED_CATEGORIES.includes(cat.name)
  );

  const getBackendOrderType = () => {
    if (bookingType === "urgent") return "UrgentHire";
    if (bookingType === "inspection") return "InspectionHire";
    return "DirectHire";
  };
  
  const backendOrderType = getBackendOrderType();

  const [formData, setFormData] = useState({
    requestTitle: "", 
    category: "",     
    serviceLocation: "",
    requirements: "",
    scheduledDate: "",
    responseTimeLimit: "",
    inspectionTime: "",
    inspectionNotes: "",
  });
  
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      showToast("You can only upload a maximum of 5 images.", "error");
      return;
    }
    setImages([...images, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    
    submitData.append("orderType", backendOrderType);
    submitData.append("serviceLocation", formData.serviceLocation);
    if (formData.requirements) submitData.append("requirements", formData.requirements);

    if (isBroadcast || backendOrderType === "UrgentHire") {
      submitData.append("isBroadcast", "true");
      submitData.append("requestTitle", formData.requestTitle);
      submitData.append("category", formData.category);
      submitData.append("responseTimeLimit", formData.responseTimeLimit);
      submitData.append("isUrgent", true);

      if (broadcastCoords) {
        submitData.append("longitude", broadcastCoords.longitude);
        submitData.append("latitude", broadcastCoords.latitude);
      }
    } else {
      submitData.append("gigId", gig._id);
      submitData.append("serviceProviderId", serviceProviderId);
      
      // ✅ Attach scheduled datetime if it's a DirectHire
      if (backendOrderType === "DirectHire") {
        submitData.append("scheduledDate", formData.scheduledDate);
      }
      
      if (backendOrderType === "InspectionHire") {
        submitData.append("inspectionTime", formData.inspectionTime);
        if (formData.inspectionNotes) submitData.append("inspectionNotes", formData.inspectionNotes);
      }
    }

    images.forEach((img) => {
      submitData.append("orderImages", img);
    });

    try {
      await dispatch(createOrder(submitData)).unwrap();
      showToast(isBroadcast ? "Urgent Hiring Broadcast sent!" : "Order placed successfully!", "success");
      if (onSuccess) onSuccess(); 
    } catch (err) {
      showToast(err || "Failed to place order.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* ── Broadcast Details ── */}
      {isBroadcast && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              Task / Issue Title <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiOutlineBriefcase className="text-orange-400 text-lg" />
              </div>
              <input
                type="text"
                name="requestTitle"
                required
                placeholder="E.g., Broken Pipe Flooding"
                value={formData.requestTitle}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium text-gray-800 bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              Service Category <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiOutlineTag className="text-orange-400 text-lg" />
              </div>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium text-gray-800 bg-gray-50/50 focus:bg-white appearance-none"
              >
                <option value="" disabled>Select an urgent category...</option>
                {urgentCategories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Standard Logistics ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
            Service Location <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <HiOutlineLocationMarker className="text-gray-400 group-focus-within:text-secondary transition-colors text-lg" />
            </div>
            <input
              type="text"
              name="serviceLocation"
              required
              placeholder="E.g., 123 Main St, Lahore"
              value={formData.serviceLocation}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium text-gray-800 bg-gray-50/50 hover:bg-white focus:bg-white"
            />
          </div>
        </div>

        {/* ✅ Updated: Mandatory DateTime for Hourly Orders */}
        {!isBroadcast && backendOrderType === "DirectHire" && (
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              Scheduled Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiOutlineCalendar className="text-gray-400 group-focus-within:text-secondary transition-colors text-lg" />
              </div>
              <input
                type="datetime-local"
                name="scheduledDate"
                required
                min={minDateTime} // Blocks past dates/times
                value={formData.scheduledDate}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium text-gray-800 bg-gray-50/50 hover:bg-white focus:bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {backendOrderType === "UrgentHire" && (
        <div className="p-6 bg-orange-50/50 border border-orange-200 rounded-2xl shadow-sm">
          <label className="block text-xs font-bold text-orange-800 uppercase tracking-wide mb-2">
            Required Response Time Limit <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <HiOutlineClock className="text-orange-400 group-focus-within:text-orange-600 transition-colors text-lg" />
            </div>
            <input
              type="text"
              name="responseTimeLimit"
              required
              placeholder="E.g., Within 2 hours, ASAP"
              value={formData.responseTimeLimit}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3.5 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium text-gray-800 bg-white placeholder-orange-900/30"
            />
          </div>
        </div>
      )}

      {/* ✅ Updated: Added min to Inspection Time */}
      {backendOrderType === "InspectionHire" && (
        <div className="p-6 bg-purple-50/50 border border-purple-200 rounded-2xl shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-bold text-purple-800 uppercase tracking-wide mb-2">
              Specific Inspection Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiOutlineClock className="text-purple-400 group-focus-within:text-purple-600 transition-colors text-lg" />
              </div>
              <input
                type="datetime-local"
                name="inspectionTime"
                required
                min={minDateTime} // Blocks past dates/times
                value={formData.inspectionTime}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium text-gray-800 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-800 uppercase tracking-wide mb-2">
              Inspection Notes <span className="text-purple-400 font-normal normal-case">(Optional)</span>
            </label>
            <textarea
              name="inspectionNotes"
              rows={2}
              placeholder="Any details the provider should know before arriving..."
              value={formData.inspectionNotes}
              onChange={handleChange}
              className="w-full px-4 py-3.5 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium text-gray-800 bg-white resize-none placeholder-purple-900/30"
            />
          </div>
        </div>
      )}

      {/* ── Job Requirements ── */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
          Job Requirements & Details <span className="text-gray-400 font-normal normal-case">(Recommended)</span>
        </label>
        <div className="relative group">
          <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
            <HiOutlineDocumentText className="text-gray-400 group-focus-within:text-secondary transition-colors text-lg" />
          </div>
          <textarea
            name="requirements"
            rows={4}
            placeholder="Describe exactly what you need done in detail..."
            value={formData.requirements}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium text-gray-800 placeholder-gray-400 bg-gray-50/50 hover:bg-white focus:bg-white resize-none"
          />
        </div>
      </div>

      {/* ── Reference Images Upload ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
            Reference Images
          </label>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Max 5 limits</span>
        </div>
        
        <div className="flex items-center justify-center w-full group">
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-200 border-dashed rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-gray-50 hover:border-secondary transition-all group-focus-within:ring-2 group-focus-within:ring-secondary/20">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="p-3 bg-white shadow-sm rounded-full mb-3 group-hover:scale-110 transition-transform">
                <MdUploadFile className="text-2xl text-secondary" />
              </div>
              <p className="text-sm text-gray-500 font-medium"><span className="text-secondary font-bold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG or JPEG</p>
            </div>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {images.length > 0 && (
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2 custom-scrollbar">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 flex-shrink-0 group/img">
                <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm" />
                <button 
                  type="button" 
                  onClick={() => setImages(images.filter((_, i) => i !== idx))} 
                  className="absolute -top-2 -right-2 bg-white text-gray-500 hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md border border-gray-100 transition-colors opacity-0 group-hover/img:opacity-100"
                >
                  <IoClose className="text-base" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Submit Button ── */}
      <div className="pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 text-white font-extrabold text-base rounded-xl transition-all flex justify-center items-center shadow-lg active:scale-[0.98] ${
            loading 
              ? "bg-gray-400 cursor-not-allowed shadow-none" 
              : isBroadcast
                ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30"
                : "bg-secondary hover:bg-[#0e5641] shadow-secondary/30"
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
             isBroadcast ? "Broadcast Urgent Hiring Request" : "Confirm & Place Order"
          )}
        </button>
      </div>
    </form>
  );
};

export default PlaceOrderForm;