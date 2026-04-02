import React, { useState } from "react";
import { IoPersonCircle } from "react-icons/io5";
import { FaLocationCrosshairs, FaTrash } from "react-icons/fa6";
import { HiPlus } from "react-icons/hi";

const blankAddress = { street: "", city: "", state: "", country: "", zipCode: "" };

const CustomerPersonalInfo = ({ formData, setFormData, onNext }) => {
  const [errors, setErrors]           = useState({});
  const [locationStatus, setLocationStatus] = useState("");

  // ─── Geolocation ────────────────────────────────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }
    setLocationStatus("Requesting location...");
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
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

  // ─── Avatar Upload ───────────────────────────────────────────────
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

  // ─── Address Handlers ────────────────────────────────────────────
  const handleAddressChange = (e, index) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = [...prev.addresses];
      updated[index] = { ...updated[index], [name]: value };
      return { ...prev, addresses: updated };
    });
    // Clear per-field error
    const key = `${name}_${index}`;
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const addAddress = () => {
    if (formData.addresses.length >= 3) return;
    setFormData((prev) => ({
      ...prev,
      addresses: [...prev.addresses, { ...blankAddress }],
    }));
  };

  const removeAddress = (index) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  };

  // ─── Validation ──────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.avatar)
      newErrors.avatar = "Please upload a profile picture.";
    if (!formData.addresses[0]?.street?.trim())
      newErrors["street_0"] = "Street address is required.";
    if (!formData.addresses[0]?.city?.trim())
      newErrors["city_0"] = "City is required.";
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
                  src={
                    formData.avatar instanceof File
                      ? URL.createObjectURL(formData.avatar)
                      : formData.avatar // existing Cloudinary URL string
                  }
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

        {/* ── Left Fields ── */}
        <div className="max-w-3xl flex-1 space-y-6 md:order-1">

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

          {/* ── Address Blocks ── */}
          {formData.addresses.map((addr, index) => (
            <div
              key={index}
              className="space-y-3 ms-3 p-4 border border-gray-200 rounded-2xl relative"
            >
              {/* Block header */}
              <div className="flex items-center justify-between mb-1">
                <label className="block text-base font-medium text-tertiary">
                  {index === 0 ? "Primary Address" : `Additional Address ${index}`}
                </label>

                {/* Remove button — only for index 1 and 2 */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeAddress(index)}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <FaTrash className="text-xs" />
                    Remove
                  </button>
                )}
              </div>

              <input
                name="street"
                type="text"
                placeholder="Street Address"
                className={`w-full px-4 py-2 border rounded-full focus:outline-none ${
                  errors[`street_${index}`] ? "border-red-500" : "border-gray-300"
                }`}
                value={addr.street}
                onChange={(e) => handleAddressChange(e, index)}
              />
              {errors[`street_${index}`] && (
                <p className="text-red-500 text-xs">{errors[`street_${index}`]}</p>
              )}

              <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
                <input
                  name="city"
                  type="text"
                  placeholder="City"
                  className={`px-4 py-2 border rounded-full focus:outline-none ${
                    errors[`city_${index}`] ? "border-red-500" : "border-gray-300"
                  }`}
                  value={addr.city}
                  onChange={(e) => handleAddressChange(e, index)}
                />
                <input
                  name="state"
                  type="text"
                  placeholder="State/Province"
                  className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                  value={addr.state}
                  onChange={(e) => handleAddressChange(e, index)}
                />
              </div>
              {errors[`city_${index}`] && (
                <p className="text-red-500 text-xs">{errors[`city_${index}`]}</p>
              )}

              <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
                <input
                  name="country"
                  type="text"
                  placeholder="Country"
                  className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                  value={addr.country}
                  onChange={(e) => handleAddressChange(e, index)}
                />
                <input
                  name="zipCode"
                  type="text"
                  placeholder="Zip Code"
                  className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                  value={addr.zipCode}
                  onChange={(e) => handleAddressChange(e, index)}
                />
              </div>
            </div>
          ))}

          {/* ── Add Another Address Button ── */}
          {formData.addresses.length < 3 && (
            <div className="ms-3">
              <button
                type="button"
                onClick={addAddress}
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-secondary text-secondary rounded-full text-sm font-semibold hover:bg-secondary hover:text-white transition-all"
              >
                <HiPlus className="text-base" />
                Add Another Address
              </button>
            </div>
          )}

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
