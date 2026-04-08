import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../../../store/orders/order-slice";
import { showToast } from "../../../utils/toastHelper";
import { MdUploadFile } from "react-icons/md";

const PlaceOrderForm = ({ gig, serviceProviderId, onSuccess }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.orders);

  const [formData, setFormData] = useState({
    orderType: "DirectHire",
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
    submitData.append("gigId", gig._id);
    submitData.append("serviceProviderId", serviceProviderId);
    submitData.append("orderType", formData.orderType);
    submitData.append("serviceLocation", formData.serviceLocation);
    
    if (formData.requirements) submitData.append("requirements", formData.requirements);
    if (formData.scheduledDate) submitData.append("scheduledDate", formData.scheduledDate);

    if (formData.orderType === "UrgentHire") {
      submitData.append("responseTimeLimit", formData.responseTimeLimit);
      submitData.append("isUrgent", true);
    } else if (formData.orderType === "InspectionHire") {
      submitData.append("inspectionTime", formData.inspectionTime);
      if (formData.inspectionNotes) submitData.append("inspectionNotes", formData.inspectionNotes);
    }

    images.forEach((img) => {
      submitData.append("orderImages", img);
    });

    try {
      await dispatch(createOrder(submitData)).unwrap();
      showToast("Order placed successfully!", "success");
      if (onSuccess) onSuccess(); 
    } catch (err) {
      showToast(err || "Failed to place order.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Order Type <span className="text-red-500">*</span></label>
        <select
          name="orderType"
          value={formData.orderType}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary transition-colors"
        >
          <option value="DirectHire">Standard Direct Hire</option>
          <option value="UrgentHire">Urgent Hire (Fast Response Needed)</option>
          <option value="InspectionHire">Inspection / Survey Hire</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Service Location <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="serviceLocation"
            required
            placeholder="E.g., 123 Main St, Lahore"
            value={formData.serviceLocation}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Date</label>
          <input
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary transition-colors text-gray-600"
          />
        </div>
      </div>

      {formData.orderType === "UrgentHire" && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <label className="block text-sm font-semibold text-amber-800 mb-2">Required Response Time Limit <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="responseTimeLimit"
            required
            placeholder="E.g., 2 hours"
            value={formData.responseTimeLimit}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      )}

      {formData.orderType === "InspectionHire" && (
        <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-semibold text-blue-800 mb-2">Inspection Time <span className="text-red-500">*</span></label>
            <input
              type="datetime-local"
              name="inspectionTime"
              required
              value={formData.inspectionTime}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-800 mb-2">Inspection Notes</label>
            <textarea
              name="inspectionNotes"
              rows={2}
              placeholder="Details for the inspection..."
              value={formData.inspectionNotes}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Job Requirements & Details</label>
        <textarea
          name="requirements"
          rows={4}
          placeholder="Describe exactly what you need done..."
          value={formData.requirements}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Reference Images (Max 5)</label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <MdUploadFile className="text-3xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            </div>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
        {images.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 flex-shrink-0">
                <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 text-white font-bold rounded-xl transition-all flex justify-center items-center ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-secondary hover:bg-[#0e5641]"
        }`}
      >
        {loading ? "Placing Order..." : "Confirm & Place Order"}
      </button>

    </form>
  );
};

export default PlaceOrderForm;