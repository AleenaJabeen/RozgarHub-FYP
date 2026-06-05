import React, { useState, useEffect, useRef } from "react";
import { IoPersonCircle } from "react-icons/io5";
import { FaLocationCrosshairs, FaMapLocationDot } from "react-icons/fa6";
import { SiOpenstreetmap } from "react-icons/si";
import { FaRegFileAlt } from "react-icons/fa";
import {
  MdOutlineBadge,
  MdOutlineLocationCity,
  MdOutlinePublic,
  MdOutlineMailOutline,
  MdOutlinePerson,
} from "react-icons/md";
import {
  TbFileDescription,
  TbMapPin,
  TbSchool,
  TbRoad,
  TbZip,
} from "react-icons/tb";
import { PiIdentificationCard } from "react-icons/pi";
import { HiOutlineMapPin } from "react-icons/hi2";
import LocationPickerMap from "./LocationPickerMap";

// ─── Reusable input wrapper with left icon ────────────────────────────────────
const IconInput = ({ icon: Icon, error, children }) => (
  <div className="relative flex items-center">
    <Icon className="absolute left-3 text-gray-400 text-lg pointer-events-none z-10" />
    {React.cloneElement(children, {
      className: `${children.props.className || ""} pl-9`.trim(),
    })}
    {error && (
      <p className="absolute -bottom-5 left-1 text-red-500 text-xs">{error}</p>
    )}
  </div>
);

const PersonalInfo = ({ formData, setFormData, onNext }) => {
  const [errors, setErrors] = useState({});
  const [locationStatus, setLocationStatus] = useState("");
  const profilePreviewUrl = useRef(null);

  // Revoke object URL on unmount or when profilePicture changes — fixes memory leak
  useEffect(() => {
    if (formData.profilePicture) {
      profilePreviewUrl.current = URL.createObjectURL(formData.profilePicture);
    }
    return () => {
      if (profilePreviewUrl.current) {
        URL.revokeObjectURL(profilePreviewUrl.current);
        profilePreviewUrl.current = null;
      }
    };
  }, [formData.profilePicture]);

  // ─── Geolocation ─────────────────────────────────────────────────────────────
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
        setLocationStatus(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setErrors((p) => ({ ...p, location: "" }));
      },
      (error) => {
        const messages = {
          1: "Permission denied. Allow location access in browser settings.",
          2: "Location unavailable. Try again.",
          3: "Request timed out. Try again.",
        };
        setLocationStatus(
          messages[error.code] || "Unable to retrieve location.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // ─── File handlers ────────────────────────────────────────────────────────────
  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: "Please upload a valid image.",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, profilePicture: file }));
    setErrors((prev) => ({ ...prev, profilePicture: "" }));
  };

  const handleCertificates = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        certificates: "Only PDF/JPG/PNG allowed.",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, certificates: file }));
    setErrors((prev) => ({ ...prev, certificates: "" }));
  };

  const handleCnicPicture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        cnicPicture: "Only JPG/PNG/PDF allowed.",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, cnicPicture: file }));
    setErrors((prev) => ({ ...prev, cnicPicture: "" }));
  };

  // ─── Address change ───────────────────────────────────────────────────────────
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.bio.trim()) newErrors.bio = "Bio is required.";
    if (!formData.location?.latitude || !formData.location?.longitude)
      newErrors.location = "Location is required.";
    if (!formData.address.country.trim())
      newErrors.country = "Country is required.";
    if (!formData.address.city.trim()) newErrors.city = "City is required.";

    const plainCnic = formData.cnicNo.replace(/-/g, "");
    if (!formData.cnicNo.trim()) {
      newErrors.cnicNo = "CNIC Number is required.";
    } else if (!/^\d+$/.test(plainCnic)) {
      newErrors.cnicNo = "CNIC must contain only numbers.";
    } else if (plainCnic.length !== 13) {
      newErrors.cnicNo = `CNIC must be 13 digits (current: ${plainCnic.length}).`;
    }

    if (!formData.profilePicture)
      newErrors.profilePicture = "Please upload a profile picture.";
    if (!formData.cnicPicture)
      newErrors.cnicPicture = "Please upload your CNIC picture.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const inputBase =
    "w-full px-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary transition-all md:text-base text-sm";

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-secondary">
        Personal Information
      </h2>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-20">
        {/* ── Profile Picture ── */}
        <div className="flex flex-col items-center gap-2 md:order-2 shrink-0">
          <label className="cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicture}
            />
            <div className="relative md:w-[220px] md:h-[220px] w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-dashed border-gray-300 group-hover:border-secondary transition-colors flex items-center justify-center bg-gray-50">
              {formData.profilePicture ? (
                <img
                  src={URL.createObjectURL(formData.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-secondary transition-colors px-3 text-center">
                  <IoPersonCircle className="text-[90px] md:text-[120px]" />
                  <p className="text-xs font-medium">Upload Profile Picture</p>
                </div>
              )}
            </div>
          </label>
          {errors.profilePicture && (
            <p className="text-red-500 text-xs text-center">
              {errors.profilePicture}
            </p>
          )}
        </div>

        {/* ── Form Fields ── */}
        <div className="flex-1 space-y-5 md:order-1">
          {/* Name & Email */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formData.name.toUpperCase()}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                  }}
                  placeholder="Your full name"
                  className={`${inputBase}  ${errors.name ? "border-red-500" : "border-gray-300"}`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs ml-2">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                Email
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formData.email}
                  disabled
                  className={`${inputBase} bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200`}
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Bio
            </label>
            <div className="relative">
              <textarea
                placeholder="Tell customers a bit about yourself...e.g I am Plumber"
                className={`w-full pl-4 pr-4 py-3 border rounded-2xl h-28 focus:outline-none focus:ring-2 focus:ring-secondary md:text-base text-sm transition-all resize-none ${
                  errors.bio ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.bio}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, bio: e.target.value }));
                  if (errors.bio) setErrors((p) => ({ ...p, bio: "" }));
                }}
              />
            </div>
            {errors.bio && (
              <p className="text-red-500 text-xs ml-2">{errors.bio}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-3 pb-4">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Address
            </label>

            {/* Street */}
            <div className="relative flex items-center pb-3">
              <SiOpenstreetmap className="absolute left-3 text-gray-500 text-lg pointer-events-none" />
              <input
                name="street"
                type="text"
                placeholder="Street Address"
                className={`${inputBase} pl-9 ${errors.street ? "border-red-500" : "border-gray-300"}`}
                value={formData.address.street}
                onChange={handleAddressChange}
              />
            </div>
            {errors.street && (
              <p className="text-red-500 text-xs ml-2">{errors.street}</p>
            )}

            {/* City & State */}
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-x-3 gap-y-6  pb-3">
              <div className="space-y-3"> 
                <div className="relative flex items-center">
                  <MdOutlineLocationCity className="absolute left-3 text-gray-500 text-lg pointer-events-none" />
                  <input
                    name="city"
                    type="text"
                    placeholder="City"
                    className={`${inputBase} pl-9 ${errors.city ? "border-red-500" : "border-gray-300"}`}
                    value={formData.address.city}
                    onChange={handleAddressChange}
                  />
                                     {errors.city && (
      <p className="absolute left-2 top-full mt-1 text-red-500 text-xs">
        {errors.city}
      </p>
    )}
                </div>
               
              </div>

              <div className="relative flex items-center">
                <FaMapLocationDot className="absolute left-3 text-gray-500 text-lg pointer-events-none" />
                <input
                  name="state"
                  type="text"
                  placeholder="State / Province"
                  className={`${inputBase} pl-9 border-gray-300`}
                  value={formData.address.state}
                  onChange={handleAddressChange}
                />
              </div>
            </div>

            {/* Country & Zip */}
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-y-6 gap-x-3 items-center">
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <MdOutlinePublic className="absolute left-3 text-gray-500 text-lg pointer-events-none" />
                  <input
                    name="country"
                    type="text"
                    placeholder="Country"
                    className={`${inputBase} pl-9 ${errors.country ? "border-red-500" : "border-gray-300"}`}
                    value={formData.address.country}
                    onChange={handleAddressChange}
                  />
                         {errors.country && (
      <p className="absolute left-2 top-full mt-1 text-red-500 text-xs">
        {errors.country}
      </p>
    )}
                </div>
         
              </div>

              <div className="relative flex items-center">
                <TbZip className="absolute left-3 text-gray-500 text-lg pointer-events-none" />
                <input
                  name="zipCode"
                  type="text"
                  placeholder="Zip Code"
                  className={`${inputBase} pl-9 border-gray-300`}
                  value={formData.address.zipCode}
                  onChange={handleAddressChange}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1 mt-4">
<LocationPickerMap
  value={
    formData.location
      ? {
          lat: formData.location.latitude,
          lng: formData.location.longitude,
          displayName: formData.location.displayName,
        }
      : null
  }
  onChange={(loc) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        latitude: loc.lat,
        longitude: loc.lng,
        displayName: loc.displayName, // store for UI only
      },
    }));

    setErrors((p) => ({ ...p, location: "" }));
  }}
  error={errors.location}
/>
            {/* {errors.location && (
              <p className="text-red-500 text-xs ml-2">{errors.location}</p>
            )} */}
          </div>
        
            {/* Education */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Education
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative flex items-center">
                <TbSchool className="absolute left-3 text-gray-500 text-lg pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Matric or Intermediate"
                  className={`${inputBase} pl-9 border-gray-300`}
                  value={formData.education}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      education: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Certificates */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-600 ml-1">
                Certificates{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={handleCertificates}
                />
                <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full transition-colors">
                  <FaRegFileAlt className="text-gray-500 text-base shrink-0" />
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {formData.certificates
                      ? formData.certificates.name
                      : "Choose File (PDF / JPG / PNG)"}
                  </span>
                </div>
              </label>
              {errors.certificates && (
                <p className="text-red-500 text-xs ml-2">
                  {errors.certificates}
                </p>
              )}
            </div>
         

          {/* CNIC */}
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                CNIC No.
              </label>
              <div className="relative flex items-center">
                <MdOutlineBadge className="absolute left-3 text-gray-500 text-lg pointer-events-none" />
                <input
                  type="text"
                  placeholder="1234567890123"
                  className={`${inputBase} pl-9 ${errors.cnicNo ? "border-red-500" : "border-gray-300"}`}
                  value={formData.cnicNo}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      cnicNo: e.target.value,
                    }));
                    if (errors.cnicNo) setErrors((p) => ({ ...p, cnicNo: "" }));
                  }}
                />
              </div>
              {errors.cnicNo && (
                <p className="text-red-500 text-xs ml-2">{errors.cnicNo}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                CNIC Picture
              </label>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleCnicPicture}
                />
                <div
                  className={`flex items-center gap-3 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border rounded-full transition-colors ${
                    errors.cnicPicture ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <PiIdentificationCard className="text-gray-500 text-base shrink-0" />
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {formData.cnicPicture
                      ? formData.cnicPicture.name
                      : "Choose File"}
                  </span>
                </div>
              </label>
              {errors.cnicPicture && (
                <p className="text-red-500 text-xs ml-2">
                  {errors.cnicPicture}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={() => validate() && onNext()}
          className="md:w-80 w-full cursor-pointer bg-secondary text-white font-bold py-3 rounded-full hover:brightness-110 active:scale-[0.97] transition-all shadow-md"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PersonalInfo;
