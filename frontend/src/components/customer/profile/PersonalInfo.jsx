import React, { useState } from "react";
import { IoPersonCircle } from "react-icons/io5";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { 
  FaTrash, 
  FaCamera,
  FaMapMarkerAlt,
  FaCity,
  FaMap,
  FaGlobeAmericas,
  FaMailBulk
} from "react-icons/fa"; 

import { HiPlus } from "react-icons/hi";

const blankAddress = { street: "", city: "", state: "", country: "", zipCode: "" };

const CustomerPersonalInfo = ({ formData, setFormData, onNext }) => {
  const [errors, setErrors]           = useState({});
  const [locationStatus, setLocationStatus] = useState("");
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false); // ✅ Added state for denied permission

  // ─── Geolocation ────────────────────────────────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }
    
    setLocationStatus("Requesting location...");
    setLocationPermissionDenied(false); // Reset state on new attempt

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setFormData((prev) => ({ ...prev, location: { latitude, longitude } }));
        setLocationStatus(`Coordinates : "${latitude}, ${longitude}"`);
        if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
      },
      (error) => {
        // ✅ Explicitly check for Permission Denied (Error Code 1)
        if (error.code === 1) {
          setLocationStatus("Permission Denied.");
          setLocationPermissionDenied(true);
        } else {
          const messages = {
            2: "Location unavailable. Try again.",
            3: "Request timed out. Try again.",
          };
          setLocationStatus(messages[error.code] || "Unable to retrieve location.");
        }
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
      
    if (!formData.name?.trim())
      newErrors.name = "Name is required.";
      
    if (!formData.addresses[0]?.street?.trim())
      newErrors["street_0"] = "Street address is required.";
      
    if (!formData.addresses[0]?.city?.trim())
      newErrors["city_0"] = "City is required.";
      
    if (!formData.addresses[0]?.country?.trim())
      newErrors["country_0"] = "Country is required.";
      
    if (formData.location.latitude === null || formData.location.longitude === null)
      newErrors.location = "Pinpointing your exact location is mandatory.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary mb-6">Personal Information</h2>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-28">

        {/* ── Avatar Upload ── */}
        <div className="flex flex-col items-center md:order-2">
          <label className="cursor-pointer relative group">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            <div className="md:w-[250px] md:h-[250px] w-[150px] h-[150px] flex flex-col items-center justify-center text-center overflow-hidden rounded-full bg-gray-50 border-2 border-dashed border-gray-300 relative transition-all group-hover:border-secondary">
              
              {formData.avatar ? (
                <img
                  src={
                    formData.avatar instanceof File
                      ? URL.createObjectURL(formData.avatar)
                      : formData.avatar
                  }
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <>
                  <IoPersonCircle className="md:text-[180px] text-[100px] text-gray-300" />
                  <p className="md:text-sm text-xs text-gray-400 font-medium">Upload Picture</p>
                </>
              )}

              {/* Hover Overlay with Camera Icon */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <FaCamera className="text-white text-3xl md:text-5xl mb-2" />
                <span className="text-white text-xs md:text-sm font-semibold">Change Photo</span>
              </div>

            </div>
          </label>
          {errors.avatar && <p className="text-red-500 text-xs mt-2 font-medium">{errors.avatar}</p>}
        </div>

        {/* ── Left Fields ── */}
        <div className="max-w-3xl flex-1 space-y-6 md:order-1">

          {/* ── Name & Email ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ms-3">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={`w-full ms-2 capitalize px-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors font-medium text-gray-900 ${
                  errors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-secondary"
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 ms-4">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ms-3">Email</label>
              <input
                type="text"
                value={formData.email}
                disabled
                className="w-full ms-2 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200 outline-none cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* ── Address Blocks ── */}
          {formData.addresses.map((addr, index) => (
            <div
              key={index}
              className="space-y-4 ms-3 p-5 border border-gray-200 rounded-2xl relative bg-white shadow-sm"
            >
              {/* Block header */}
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-tertiary">
                  {index === 0 ? "Primary Address" : `Additional Address ${index}`}
                </label>

                {/* Remove button */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeAddress(index)}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <FaTrash className="text-xs" />
                    Remove
                  </button>
                )}
              </div>

              {/* Street Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  name="street"
                  type="text"
                  placeholder={`Street Address ${index === 0 ? '*' : ''}`}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors ${
                    errors[`street_${index}`] ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-secondary"
                  }`}
                  value={addr.street}
                  onChange={(e) => handleAddressChange(e, index)}
                />
              </div>
              {errors[`street_${index}`] && (
                <p className="text-red-500 text-xs mt-1 ml-4">{errors[`street_${index}`]}</p>
              )}

              {/* City & State Inputs */}
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaCity className="text-gray-400" />
                  </div>
                  <input
                    name="city"
                    type="text"
                    placeholder={`City ${index === 0 ? '*' : ''}`}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors ${
                      errors[`city_${index}`] ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-secondary"
                    }`}
                    value={addr.city}
                    onChange={(e) => handleAddressChange(e, index)}
                  />
                  {errors[`city_${index}`] && (
                    <p className="text-red-500 text-xs mt-1 ml-4">{errors[`city_${index}`]}</p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaMap className="text-gray-400 text-sm" />
                  </div>
                  <input
                    name="state"
                    type="text"
                    placeholder="State/Province"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors"
                    value={addr.state}
                    onChange={(e) => handleAddressChange(e, index)}
                  />
                </div>
              </div>

              {/* Country & Zip Code Inputs */}
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaGlobeAmericas className="text-gray-400" />
                  </div>
                  <input
                    name="country"
                    type="text"
                    placeholder={`Country ${index === 0 ? '*' : ''}`}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors ${
                      errors[`country_${index}`] ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-secondary"
                    }`}
                    value={addr.country}
                    onChange={(e) => handleAddressChange(e, index)}
                  />
                  {errors[`country_${index}`] && (
                    <p className="text-red-500 text-xs mt-1 ml-4">{errors[`country_${index}`]}</p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaMailBulk className="text-gray-400 text-sm" />
                  </div>
                  <input
                    name="zipCode"
                    type="text"
                    placeholder="Zip Code"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors"
                    value={addr.zipCode}
                    onChange={(e) => handleAddressChange(e, index)}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* ── Add Another Address Button ── */}
          {formData.addresses.length < 3 && (
            <div className="ms-3">
              <button
                type="button"
                onClick={addAddress}
                className="flex items-center gap-2 px-6 py-2.5 border-2 border-dashed border-secondary text-secondary rounded-full text-sm font-bold hover:bg-secondary hover:text-white transition-all shadow-sm"
              >
                <HiPlus className="text-lg" />
                Add Another Address
              </button>
            </div>
          )}

          {/* ── Geolocation ── */}
          <div className="ms-3 pt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pinpoint Exact Location <span className="text-red-500">*</span></label>
            <div className={`lg:w-1/2 w-full flex items-center justify-between pl-4 pr-2 py-1.5 border bg-white rounded-full focus-within:ring-2 focus-within:ring-secondary/20 transition-all ${
              errors.location || locationPermissionDenied ? "border-red-500 focus-within:border-red-500" : "border-gray-300 focus-within:border-secondary"
            }`}>
              <input
                type="text"
                placeholder="Click the target to locate..."
                value={locationStatus || (formData.location.latitude ? `Coordinates : "${formData.location.latitude}, ${formData.location.longitude}"` : "")}
                disabled
                className={`w-full focus:outline-none bg-transparent text-sm truncate mr-2 ${locationPermissionDenied ? 'text-red-500' : 'text-gray-600'}`}
              />
              <button 
                type="button" 
                onClick={handleGetLocation}
                className="p-2 bg-secondary/10 hover:bg-secondary/20 rounded-full transition-colors group"
              >
                <FaLocationCrosshairs className="text-secondary text-lg group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            {errors.location && !locationPermissionDenied && (
              <p className="text-red-500 text-xs mt-1 ms-2">{errors.location}</p>
            )}

            {locationPermissionDenied && (
              <div className="lg:w-1/2 w-full mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 shadow-sm animate-[fadeIn_0.3s_ease-out]">
                <p className="text-xs text-red-700 font-medium leading-relaxed">
                  <span className="font-bold block mb-0.5">Location Access Blocked!</span> 
                  Please click the <span className="font-bold">Lock icon (🔒)</span> or <span className="font-bold">Site settings</span> in your browser's address bar to allow location access, then click the target icon again.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="flex justify-center pt-10 border-t border-gray-100 mt-8">
        <button
          onClick={() => validate() && onNext()}
          className="md:w-[300px] w-full cursor-pointer bg-secondary text-white font-bold py-3.5 rounded-full hover:bg-emerald-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default CustomerPersonalInfo;