import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { sendPhoneOTP, verifyPhoneOTP } from "../../../store/serviceProvider/profile-slice";

const Verification = ({ formData, setFormData, onSubmit, onBack }) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false); // New State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData((prev) => ({ ...prev, otp: newOtp }));

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const validatePhone = () => {
    let newErrors = {};
    if (!formData.phoneNumber.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^03\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phone = "Enter valid Pakistani phone number (03XXXXXXXXX)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) return;
    try {
      setErrors((prev) => ({ ...prev, otp: null, phone: null }));
      // await dispatch(sendPhoneOTP({ phone: formData.phoneNumber })).unwrap();
      setOtpSent(true);
      setIsPhoneVerified(false); // Reset if they change number and resend
    } catch (err) {
      setErrors((prev) => ({ ...prev, phone: err || "Failed to send OTP" }));
    }
  };

  const handleSubmit = async () => {
    // 1. Check if OTP was even sent
    if (!otpSent) {
      setErrors((prev) => ({ ...prev, phone: "Please send and verify OTP first." }));
      return;
    }

    // 2. Check if OTP fields are filled
    if (formData.otp.some((d) => d === "")) {
      setErrors((prev) => ({ ...prev, otp: "Please enter the complete 6-digit OTP." }));
      return;
    }

    setIsSubmitting(true);
    const otpString = formData.otp.join("");

    try {
      // 3. Verify OTP
      // await dispatch(verifyPhoneOTP({ 
      //   phone: formData.phoneNumber, 
      //   otp: otpString 
      // })).unwrap();

      setIsPhoneVerified(true);
      
      // 4. If verification passes, proceed to final submit
      await onSubmit();
    } catch (err) {
      setIsPhoneVerified(false);
      setErrors((prev) => ({ ...prev, otp: err || "Invalid OTP. Please try again." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary mb-6">Verify Phone Number</h2>

      <div className="max-w-xl">
        {/* Email */}
        <div className="mb-4 ms-3">
          <label className="block text-base font-medium mb-2 ms-1">Email</label>
          <input
            type="text"
            value={formData.email}
            disabled
            className="w-full px-4 py-2 bg-gray-200 text-gray-600 rounded-full outline-none cursor-not-allowed"
          />
        </div>

        {/* Phone */}
        <div className="mb-4 ms-3">
          <label className="block text-base font-medium mb-2 ms-1">Phone Number</label>
          <div className="relative">
             <input
              type="text"
              placeholder="03XX------"
              disabled={otpSent && isPhoneVerified} // Lock if verified
              className={`w-full px-4 py-2 border rounded-full focus:outline-none transition-colors ${
                errors.phone ? "border-red-500" : "border-gray-300 focus:border-secondary"
              } ${isPhoneVerified ? "bg-green-50 border-green-500" : ""}`}
              value={formData.phoneNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            />
            {isPhoneVerified && (
              <span className="absolute right-4 top-2 text-green-600 font-bold">✓ Verified</span>
            )}
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1 ml-4">{errors.phone}</p>}
        </div>

        {/* Send OTP Button */}
        <div className="mb-6 ms-4">
          {!isPhoneVerified && (
            <button
              onClick={handleSendOtp}
              className="px-8 py-2 cursor-pointer bg-secondary text-white rounded-full text-base font-medium hover:bg-[#0e5641] transition-all"
            >
              {otpSent ? "Resend OTP" : "Send OTP"}
            </button>
          )}
        </div>

        {/* OTP Inputs */}
        {otpSent && (
          <div className="mb-8 ms-3">
            <label className="block text-base font-medium mb-4 ms-1">
              Enter OTP {isPhoneVerified && <span className="text-green-600">(Confirmed)</span>}
            </label>
            <div className="flex md:gap-4 gap-2 ms-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  maxLength="1"
                  disabled={isPhoneVerified}
                  value={formData.otp[i] || ""}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className={`w-12 h-12 md:w-16 md:h-12 border-2 rounded-lg text-center text-xl font-bold transition-all focus:outline-none ${
                    errors.otp 
                      ? "border-red-500" 
                      : isPhoneVerified 
                        ? "border-green-500 bg-green-50"
                        : formData.otp[i] 
                          ? "border-secondary" 
                          : "border-gray-300"
                  }`}
                />
              ))}
            </div>
            {errors.otp && <p className="text-red-500 text-xs mt-2 ml-4">{errors.otp}</p>}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-4 pt-8">
        <button
          type="button"
          onClick={onBack}
          className="md:w-sm w-xs cursor-pointer bg-gray-500 text-white font-bold py-3 rounded-full hover:bg-gray-600 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`md:w-sm w-xs cursor-pointer text-white font-bold py-3 rounded-full transition-all flex items-center justify-center ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-secondary hover:bg-[#0e5641]"
          }`}
        >
          {isSubmitting ? "Verifying..." : isPhoneVerified ? "Finish Registration" : "Verify & Submit"}
        </button>
      </div>
    </div>
  );
};

export default Verification;