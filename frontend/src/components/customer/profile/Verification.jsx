import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { sendCustomerPhoneOTP, verifyCustomerPhoneOTP } from "../../../store/customer/profile-slice";

const CustomerVerification = ({ formData, setFormData, onSubmit, onBack }) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpRefs = useRef([]);

  // ─── OTP Input Handlers ─────────────────────────────────────────
  const handleOtpChange = (value, index) => {
    // Only allow single digits
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData((prev) => ({ ...prev, otp: newOtp }));

    // Auto-advance to next box
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ─── Phone Validation ───────────────────────────────────────────
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

  // ─── Send OTP ───────────────────────────────────────────────────
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

  // ─── Verify OTP then Submit ─────────────────────────────────────
  // Critical: verifyCustomerPhoneOTP MUST succeed before calling onSubmit()
  const handleSubmit = async () => {
    if (formData.otp.some((d) => d === "")) {
      setErrors((prev) => ({ ...prev, otp: "Please enter the complete OTP." }));
      return;
    }

    setIsSubmitting(true);
    const otp = formData.otp.join("");

    try {
      // Step 1: Verify the OTP — throws if invalid/expired
      await dispatch(
        verifyCustomerPhoneOTP({ phone: formData.phoneNumber, otp })
      ).unwrap();

      // Step 2: Only if verification passed, fire the profile creation
      await onSubmit();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        otp: err || "Invalid or expired OTP. Please try again.",
      }));
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
        <div className="mb-8 ms-3">
          <label className="block text-base font-medium mb-2 ms-1">Phone Number</label>
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
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* ── Send OTP Button ── */}
        <div className="mb-4 ms-4">
          <button
            onClick={handleSendOtp}
            className="px-8 py-2 cursor-pointer bg-secondary text-white rounded-full text-base font-medium hover:bg-[#0e5641] transition-all"
          >
            {otpSent ? "Resend OTP" : "Send OTP"}
          </button>
        </div>

        {/* ── OTP Input Boxes ── */}
        {otpSent && (
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
