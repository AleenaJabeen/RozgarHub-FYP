import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { MdOutlineVerified } from "react-icons/md";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import {
  sendCustomerPhoneOTP,
  verifyCustomerPhoneOTP,
} from "../../../store/customer/profile-slice";
import { showToast } from "../../../utils/toastHelper"; // ✅ Imported toastHelper

const CustomerVerification = ({ formData, setFormData, onSubmit, onBack, user }) => {
  const dispatch = useDispatch();
  const [errors, setErrors]           = useState({});
  const [otpSent, setOtpSent]         = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpRefs = useRef([]);

  // ─── Phone is already verified — lock the entire OTP section ────
  const isAlreadyVerified = !!user?.isPhoneVerified;

  // ─── OTP Input Handlers ──────────────────────────────────────────
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData((prev) => ({ ...prev, otp: newOtp }));
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ─── Phone Validation ────────────────────────────────────────────
  const validatePhone = () => {
    const newErrors = {};
    if (!formData.phoneNumber.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^03\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phone = "Enter a valid Pakistani phone number (03XXXXXXXXX).";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Send OTP ────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!validatePhone()) return;
    try {
      await dispatch(sendCustomerPhoneOTP(formData.phoneNumber)).unwrap();
      setOtpSent(true);
      setErrors((prev) => ({ ...prev, phone: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, phone: err || "Failed to send OTP. Try again." }));
    }
  };

  // ─── Verify OTP then Submit ──────────────────────────────────────
  const handleSubmit = async () => {
    
    // ✅ GATE 1: Block user from submitting if they haven't verified phone
    if (!isAlreadyVerified) {
      if (!otpSent) {
        showToast("Please verify your phone number first before submitting.", "error");
        return;
      }
      if (formData.otp.some((d) => d === "")) {
        showToast("Please enter the complete OTP before submitting.", "error");
        setErrors((prev) => ({ ...prev, otp: "Please enter the complete OTP." }));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (!isAlreadyVerified) {
        // Gate 2: Verify OTP via backend — throws error if invalid/expired
        await dispatch(
          verifyCustomerPhoneOTP({
            phone: formData.phoneNumber,
            otp: formData.otp.join(""),
          })
        ).unwrap();
      }

      // Only reaches here if verified successfully (or was already verified)
      await onSubmit();
    } catch (err) {
      const errMsg = err || "Invalid or expired OTP. Please try again.";
      setErrors((prev) => ({
        ...prev,
        otp: errMsg,
      }));
      // ✅ Display toast if verification API fails
      showToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary mb-6">Verify Phone Number</h2>

      <div className="max-w-xl">

        {/* ── Email (Read-only) ── */}
        <div className="mb-4 ms-3">
          <label className="block text-base font-medium mb-2 ms-1">Email</label>
          <input
            type="text"
            value={formData.email}
            disabled
            className="w-full px-4 py-2 bg-gray-200 text-gray-600 rounded-full outline-none cursor-not-allowed"
          />
        </div>

        {/* ── Phone Number ── */}
        <div className="mb-6 ms-3">
          <label className="block text-base font-medium mb-2 ms-1">Phone Number</label>

          {isAlreadyVerified ? (
            // ── Verified State ──────────────────────────────────────────
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={user.phone || formData.phoneNumber}
                disabled
                className="w-full px-4 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-full outline-none cursor-not-allowed"
              />
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full flex-shrink-0">
                <MdOutlineVerified className="text-lg" />
                <span className="text-xs font-bold whitespace-nowrap">Verified</span>
              </div>
            </div>
          ) : (
            // ── Unverified State ────────────────────────────────────────
            <input
              type="text"
              placeholder="03XX------"
              className={`w-full px-4 py-2 border rounded-full focus:outline-none transition-colors ${
                errors.phone ? "border-red-500" : "border-gray-300 focus:border-secondary"
              }`}
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
            />
          )}
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* ── Verified Banner — replaces OTP section entirely ─────── */}
        {isAlreadyVerified && (
          <div className="ms-3 mb-6 flex items-start gap-4 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <IoShieldCheckmarkOutline className="text-emerald-500 text-3xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-700">Phone number securely verified</p>
              <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">
                Your phone has already been verified. You can update your other details and submit directly.
              </p>
            </div>
          </div>
        )}

        {/* ── Send OTP Button (hidden when already verified) ── */}
        {!isAlreadyVerified && (
          <div className="mb-4 ms-4">
            <button
              onClick={handleSendOtp}
              className="px-8 py-2 cursor-pointer bg-secondary text-white rounded-full text-base font-medium hover:bg-[#0e5641] transition-all"
            >
              {otpSent ? "Resend OTP" : "Send OTP"}
            </button>
          </div>
        )}

        {/* ── OTP Input Boxes (hidden when already verified) ── */}
        {!isAlreadyVerified && otpSent && (
          <div className="mb-8 ms-3">
            <label className="block text-base font-medium mb-4 ms-1">Enter OTP</label>
            <div className="flex md:gap-4 gap-2 ms-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  maxLength="1"
                  value={formData.otp[i] || ""}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className={`w-12 h-12 md:w-16 md:h-12 border-2 rounded-lg text-center text-xl font-bold transition-all focus:outline-none ${
                    errors.otp
                      ? "border-red-500"
                      : formData.otp[i]
                      ? "border-secondary"
                      : "border-gray-300"
                  }`}
                />
              ))}
            </div>
            {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
          </div>
        )}
      </div>

      {/* ── Navigation Buttons ── */}
      <div className="flex justify-center items-center gap-4 pt-8">
        <button
          type="button"
          onClick={onBack}
          className="md:w-sm w-xs cursor-pointer bg-secondary text-white font-bold py-3 rounded-full hover:bg-[#0e5641] transition-all"
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
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            "Submit Profile"
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomerVerification;