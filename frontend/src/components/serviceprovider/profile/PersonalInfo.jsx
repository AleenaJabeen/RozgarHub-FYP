import React, { useState } from "react";
import {  IoPersonCircle } from "react-icons/io5";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { FaRegFileAlt } from "react-icons/fa";

const PersonalInfo = ({ formData, setFormData, onNext }) => {
  const [errors, setErrors] = useState({});
  const [locationStatus, setLocationStatus] = useState(""); // feedback to user

  // ─── Geolocation ──────────────────────────────────────────────
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
        setLocationStatus(` Location captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        // Possible error codes: 1=PERMISSION_DENIED, 2=UNAVAILABLE, 3=TIMEOUT
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

  // ─── File handlers ─────────────────────────────────────────────
  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, profilePicture: "Please upload a valid image." }));
      return;
    }
    console.log(file)
    setFormData((prev) => ({ ...prev, profilePicture: file }));
    setErrors((prev) => ({ ...prev, profilePicture: "" }));
  };

  const handleCertificates = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, certificates: "Only PDF/JPG/PNG allowed." }));
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
      setErrors((prev) => ({ ...prev, cnicPicture: "Only JPG/PNG/PDF allowed." }));
      return;
    }
    setFormData((prev) => ({ ...prev, cnicPicture: file }));
    setErrors((prev) => ({ ...prev, cnicPicture: "" }));
  };

  // ─── Address change ────────────────────────────────────────────
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

 const validate = () => {
    let newErrors = {};

    // Bio
    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required.";
    }

    // Street
    if (!formData.address.street.trim()) {
      newErrors.street = "Street address is required.";
    }

    // City
    if (!formData.address.city.trim()) {
      newErrors.city = "City is required.";
    }
    const education=formData.education;
    console.log(education);

    // CNIC Number
    const plainCnic = formData.cnicNo.replace(/-/g, "");
    if (!formData.cnicNo.trim()) {
      newErrors.cnicNo = "CNIC Number is required.";
    } else if (!/^\d+$/.test(plainCnic)) {
      newErrors.cnicNo = "CNIC must contain only numbers.";
    } else if (plainCnic.length !== 13) {
      newErrors.cnicNo = `CNIC must be 13 digits (current: ${plainCnic.length}).`;
    }

    // Profile Picture
    if (!formData.profilePicture) {
      newErrors.profilePicture = "Please upload a profile picture.";
    }

    // CNIC Picture
    if (!formData.cnicPicture) {
      newErrors.cnicPicture = "Please upload a picture of your CNIC.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary mb-6">Personal Information</h2>
      <div className="flex flex-col md:flex-row gap-8 lg:gap-28">

        {/* Profile Picture */}
        <div className="flex flex-col items-center md:order-2">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicture} />
            <div className="md:w-[250px] md:h-[250px] w-[150px] h-[150px] flex flex-col items-center justify-center text-center transition-colors overflow-hidden">
              {formData.profilePicture ? (
                <img src={URL.createObjectURL(formData.profilePicture)} alt="Profile" className="md:w-[250px] md:h-[250px] w-[150px] h-[150px] object-cover rounded-full" />
              ) : (
                <>
              <IoPersonCircle className="md:text-[200px]  text-[120px] text-gray-300"/>
              <p className="md:text-base text-sm">Upload Profile Picture</p>
              </>
              )}
            </div>
          </label>
          {errors.profilePicture && <p className="text-red-500 text-xs mt-1">{errors.profilePicture}</p>}
        </div>

        <div className="max-w-3xl flex-1 space-y-4 md:order-1">
          {/* Name & Email */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium mb-2 ms-3">Name</label>
              <input type="text" value={formData.name.toUpperCase()} disabled className="w-full ms-2 px-4 py-2 bg-gray-300 rounded-full outline-none" />
            </div>
            <div>
              <label className="block text-base font-medium mb-2 ms-3">Email</label>
              <input type="text" value={formData.email} disabled className="w-full ms-2  px-4 py-2 bg-gray-300 rounded-full outline-none" />
            </div>
          </div>

          {/* Bio */}
          <div className="ms-3">
            <label className="block text-base font-medium mb-2 ms-1">Bio</label>
            <textarea
              placeholder="Add some bio..."
              className={`w-full  p-4 border rounded-3xl h-32 focus:outline-none ${errors.bio ? "border-red-500" : "border-gray-300"}`}
              value={formData.bio}
              onChange={(e) => { setFormData((prev) => ({ ...prev, bio: e.target.value })); if (errors.bio) setErrors((p) => ({ ...p, bio: "" })); }}
            />
            {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
          </div>

          {/* Address */}
          <div className="space-y-3 ms-3">
            <label className="block text-base font-medium text-tertiary">Address Details</label>
            <input name="street" type="text" placeholder="Street Address"
              className={`w-full px-4 py-2 border rounded-full focus:outline-none ${errors.street ? "border-red-500" : "border-gray-300"}`}
              value={formData.address.street} onChange={handleAddressChange} />
            {errors.street && <p className="text-red-500 text-xs">{errors.street}</p>}

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
              <input name="city" type="text" placeholder="City"
                className={`px-4 py-2 border rounded-full focus:outline-none ${errors.city ? "border-red-500" : "border-gray-300"}`}
                value={formData.address.city} onChange={handleAddressChange} />
              <input name="state" type="text" placeholder="State/Province"
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                value={formData.address.state} onChange={handleAddressChange} />
            </div>
            {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
              <input name="country" type="text" placeholder="Country"
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                value={formData.address.country} onChange={handleAddressChange} />
              <input name="zipCode" type="text" placeholder="Zip Code"
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                value={formData.address.zipCode} onChange={handleAddressChange} />
            </div>
          </div>

          {/* 📍 Get Location Button */}
          <div className="ms-3">
            <label className="block text-base font-medium mb-2">Location</label>
            <div className="lg:w-1/2 w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-full focus:outline-none">
            <input type="text" placeholder="Location" value={locationStatus} sisabled className="w-full focus:outline-none"/>
            <button
              type="button"
              onClick={handleGetLocation}
            >
             <FaLocationCrosshairs className="text-secondary"/>
            </button>
            </div>
            {/* {locationStatus && (
              <p className={`text-xs mt-1 ${locationStatus.includes("denied") || locationStatus.includes("unable") ? "text-red-500" : "text-green-600"}`}>
                {locationStatus}
              </p>
            )} */}
          </div>

          {/* Education */}
          <div className="ms-3">
            <label className="block text-base font-medium mb-2">Education</label>
            <input type="text" placeholder="Education (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
              value={formData.education}
              onChange={(e) => setFormData((prev) => ({ ...prev, education: e.target.value }))} />
          </div>

          {/* Certificates */}
          <div className="ms-3">
            <label className="block text-base font-medium mb-2">Certificates</label>
            <label className="cursor-pointer">
              <input type="file" accept=".pdf,image/*" className="hidden appearance-none" onChange={handleCertificates} />
              <div className="w-full px-4 py-2 bg-gray-300 rounded-full flex justify-between items-center text-tertiary hover:bg-gray-300 transition-colors">
                <span>{formData.certificates ? formData.certificates.name : "Choose File"}</span>
                <FaRegFileAlt size={20} className="text-gray-500"/>
              </div>
            </label>
            {errors.certificates && <p className="text-red-500 text-xs mt-1">{errors.certificates}</p>}
          </div>

          {/* CNIC */}
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            <div className="ms-3">
              <label className="block text-base font-medium mb-2">CNIC No.</label>
              <input type="text" placeholder="XXXXXXXXXXXXX"
                className={`w-full px-4 py-2 border rounded-full focus:outline-none ${errors.cnicNo ? "border-red-500" : "border-gray-300"}`}
                value={formData.cnicNo}
                onChange={(e) => { setFormData((prev) => ({ ...prev, cnicNo: e.target.value })); if (errors.cnicNo) setErrors((p) => ({ ...p, cnicNo: "" })); }} />
              {errors.cnicNo && <p className="text-red-500 text-xs mt-1">{errors.cnicNo}</p>}
            </div>
            <div className="ms-3">
              <label className="block text-base font-medium mb-2">CNIC Picture</label>
              <label className="cursor-pointer">
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleCnicPicture} />
                <div className={`w-full px-4 py-2 bg-gray-300 rounded-full flex justify-between items-center text-gray-500 hover:bg-gray-300 transition-colors ${errors.cnicPicture ? "border border-red-500" : ""}`}>
                  <span className="truncate text-sm">{formData.cnicPicture ? formData.cnicPicture.name : "Choose File"}</span>
                  <FaRegFileAlt size={20} className="text-gray-500" />
                </div>
              </label>
              {errors.cnicPicture && <p className="text-red-500 text-xs mt-1">{errors.cnicPicture}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={() => validate() && onNext()}
          className="md:w-md w-xs  cursor-pointer bg-secondary text-white font-bold py-3 rounded-full mt-8 hover:bg-[#0e5641] transition-all">
          Next
        </button>
      </div>
    </div>
  );
};

export default PersonalInfo;