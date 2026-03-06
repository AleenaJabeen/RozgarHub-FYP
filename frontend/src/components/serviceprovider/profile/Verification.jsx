import React, { useState, useRef } from "react";

const Verification = ({ formData, setFormData, onSubmit }) => {
  const [errors, setErrors] = useState({});
  const otpRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData((prev) => ({ ...prev, otp: newOtp }));
    // Auto-focus next
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.phoneNumber.trim())       newErrors.phone = "Phone number is required.";
    else if (!/^\+?\d{10,15}$/.test(formData.phoneNumber.replace(/\s/g, "")))
                                            newErrors.phone = "Enter a valid phone number.";
    if (formData.otp.some((d) => d === "")) newErrors.otp = "Please enter the complete OTP.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary mb-6">Verify Phone Number</h2>
      <div className="max-w-2xl">

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input type="text" value={formData.email} disabled className="w-full px-4 py-2 bg-gray-200 rounded-lg outline-none" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Phone Number</label>
          <input
            type="text" placeholder="+92XXXXXXXXXXX"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${errors.phone ? "border-red-500" : "border-gray-300"}`}
            value={formData.phoneNumber}
            onChange={(e) => { setFormData((prev) => ({ ...prev, phoneNumber: e.target.value })); if (errors.phone) setErrors((p) => ({ ...p, phone: "" })); }}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div className="mb-4">
          <button className="px-5 py-2 bg-secondary text-white rounded-full text-sm font-medium hover:bg-[#0e5641] transition-all">
            Send OTP
          </button>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold mb-2">Enter OTP</label>
          <div className="flex md:gap-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                type="text"
                maxLength="1"
                value={formData.otp[i]}
                onChange={(e) => handleOtpChange(e.target.value, i)}
                onKeyDown={(e) => handleOtpKeyDown(e, i)}
                className={`w-16 h-12 border rounded-xl text-center text-xl focus:outline-none ${errors.otp ? "border-red-500" : "border-gray-300 focus:border-secondary"}`}
              />
            ))}
          </div>
          {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={handleSubmit}
          className="md:w-lg w-xs bg-secondary text-white font-bold py-3 rounded-full hover:bg-[#0e5641] transition-all">
          Submit Profile
        </button>
      </div>
    </div>
  );
};

export default Verification;