import React, { useState } from "react";
import { IoPersonCircle } from "react-icons/io5";
import { FaLocationCrosshairs } from "react-icons/fa6";

const CustomerPersonalInfo = ({ formData, setFormData, onNext }) => {
  const [errors, setErrors] = useState({});
  const [locationStatus, setLocationStatus] = useState("");

  // ─── Geolocation ───────────────────────────────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }
    setLocationStatus("Requesting location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({ ...prev, location: { latitude, longitude } }));
        setLocationStatus(`Location captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        const messages = {
          1: "Permission denied. Please allow location access in your browser settings.",
          2: "Location unavailable. Try again.",
          3: "Request timed out. Try again.",
        };
        setLocationStatus(messages[error.code] || "Unable to retrieve location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ─── Avatar Upload ──────────────────────────────────────────────
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, avatar: "Please upload a valid image." }));
      return;
    }
    setFormData((prev) => ({ ...prev, avatar: file }));
    setErrors((prev) => ({ ...prev, avatar: "" }));
  };

  // ─── Address ────────────────────────────────────────────────────
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ─── Validation ─────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.avatar)                    newErrors.avatar  = "Please upload a profile picture.";
    if (!formData.address.street.trim())     newErrors.street  = "Street address is required.";
    if (!formData.address.city.trim())       newErrors.city    = "City is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary mb-6">Personal Information</h2>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-28">

        {/* ── Avatar Upload ── */}
        <div className="flex flex-col items-center md:order-2">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            <div className="md:w-[250px] md:h-[250px] w-[150px] h-[150px] flex flex-col items-center justify-center text-center overflow-hidden">
              {formData.avatar ? (
                <img
                  src={URL.createObjectURL(formData.avatar)}
                  alt="Profile"
                  className="md:w-[250px] md:h-[250px] w-[150px] h-[150px] object-cover rounded-full"
                />
              ) : (
                <>
                  <IoPersonCircle className="md:text-[200px] text-[120px] text-gray-300" />
                  <p className="md:text-base text-sm">Upload Profile Picture</p>
                </>
              )}
            </div>
          </label>
          {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>}
        </div>

        <div className="max-w-3xl flex-1 space-y-4 md:order-1">

          {/* ── Name & Email (Disabled) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium mb-2 ms-3">Name</label>
              <input
                type="text"
                value={formData.name.toUpperCase()}
                disabled
                className="w-full ms-2 px-4 py-2 bg-gray-300 rounded-full outline-none"
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-2 ms-3">Email</label>
              <input
                type="text"
                value={formData.email}
                disabled
                className="w-full ms-2 px-4 py-2 bg-gray-300 rounded-full outline-none"
              />
            </div>
          </div>

          {/* ── Address ── */}
          <div className="space-y-3 ms-3">
            <label className="block text-base font-medium text-tertiary">Address Details</label>

            <input
              name="street"
              type="text"
              placeholder="Street Address"
              className={`w-full px-4 py-2 border rounded-full focus:outline-none ${
                errors.street ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.address.street}
              onChange={handleAddressChange}
            />
            {errors.street && <p className="text-red-500 text-xs">{errors.street}</p>}

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
              <input
                name="city"
                type="text"
                placeholder="City"
                className={`px-4 py-2 border rounded-full focus:outline-none ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.address.city}
                onChange={handleAddressChange}
              />
              <input
                name="state"
                type="text"
                placeholder="State/Province"
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                value={formData.address.state}
                onChange={handleAddressChange}
              />
            </div>
            {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
              <input
                name="country"
                type="text"
                placeholder="Country"
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                value={formData.address.country}
                onChange={handleAddressChange}
              />
              <input
                name="zipCode"
                type="text"
                placeholder="Zip Code"
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                value={formData.address.zipCode}
                onChange={handleAddressChange}
              />
            </div>
          </div>

          {/* ── Geolocation ── */}
          <div className="ms-3">
            <label className="block text-base font-medium mb-2">Location</label>
            <div className="lg:w-1/2 w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-full">
              <input
                type="text"
                placeholder="Click to capture location"
                value={locationStatus}
                disabled
                className="w-full focus:outline-none bg-transparent"
              />
              <button type="button" onClick={handleGetLocation}>
                <FaLocationCrosshairs className="text-secondary" />
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={() => validate() && onNext()}
          className="md:w-md w-xs cursor-pointer bg-secondary text-white font-bold py-3 rounded-full mt-8 hover:bg-[#0e5641] transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CustomerPersonalInfo;
