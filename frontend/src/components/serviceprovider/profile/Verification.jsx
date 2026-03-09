import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { sendPhoneOTP, verifyPhoneOTP } from "../../../store/serviceProvider/profile-slice";
import { useNavigate } from "react-router-dom";

const Verification = ({ formData, setFormData, onSubmit }) => {
  const dispatch = useDispatch();
  const navigate=useNavigate()
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
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
      // await dispatch(sendPhoneOTP(formData.phoneNumber)).unwrap();
      setOtpSent(true);
    } catch (err) {
      setErrors((prev) => ({ ...prev, phone: err }));
    }
  };

  const validateOtp = () => {
    let newErrors = {};

    // if (formData.otp.some((d) => d === "")) {
    //   newErrors.otp = "Please enter the complete OTP.";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateOtp()) return;

    const otp = formData.otp.join("");
        console.log(otp)

    try {
      // await dispatch(
      //   verifyPhoneOTP({
      //     phone: formData.phoneNumber,
      //     otp
      //   })
      // ).unwrap();

      const messaage=await onSubmit();
      console.log(messaage)
      // navigate('/serviceprovider')
    } catch (err) {
      setErrors((prev) => ({ ...prev, otp: err }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary mb-6">
        Verify Phone Number
      </h2>

      <div className="max-w-2xl">

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="text"
            value={formData.email}
            disabled
            className="w-full px-4 py-2 bg-gray-200 rounded-lg outline-none"
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            Phone Number
          </label>

          <input
            type="text"
            placeholder="03001234567"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                phoneNumber: e.target.value
              }))
            }
          />

          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Send OTP */}
        <div className="mb-4">
          <button
            onClick={handleSendOtp}
            className="px-5 py-2 bg-secondary text-white rounded-full text-sm font-medium hover:bg-[#0e5641] transition-all"
          >
            {otpSent ? "Resend OTP" : "Send OTP"}
          </button>
        </div>

        {/* OTP Inputs */}
        {otpSent && (
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-2">
              Enter OTP
            </label>

            <div className="flex md:gap-4 gap-2">
              {[0, 1, 2, 3,4,5].map((i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  maxLength="1"
                  value={formData.otp[i]}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className={`w-16 h-12 border rounded-xl text-center text-xl focus:outline-none ${
                    errors.otp
                      ? "border-red-500"
                      : "border-gray-300 focus:border-secondary"
                  }`}
                />
              ))}
            </div>

            {errors.otp && (
              <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
            )}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-center pt-8">
        <button
          onClick={handleSubmit}
          className="md:w-lg w-xs bg-secondary text-white font-bold py-3 rounded-full hover:bg-[#0e5641] transition-all"
        >
          Submit Profile
        </button>
      </div>
    </div>
  );
};

export default Verification;