import React, { useState } from "react";

const Verification = ({ formData, setFormData }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.phoneNumber.trim())
      newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary mb-6">
        Verify Phone Number
      </h2>

      <div className="max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="text"
            value={formData.email}
            disabled
            className="w-full px-4 py-2 bg-gray-200 rounded-lg outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            Enter Phone number
          </label>
          <input
            type="text"
            placeholder="+92XXXXXXXXXXX"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${errors.phone ? "border-red-500" : "border-gray-300"}`}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold mb-1">Verify OTP</label>
          <div className="flex md:gap-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                className="w-16 h-12 border border-gray-300 rounded-xl text-center text-xl focus:border-secondary focus:outline-none"
              />
            ))}
          </div>
        </div>

        <button className="w-full bg-secondary text-white font-bold py-2 rounded-lg mb-12">
          Verify
        </button>
        
      </div>
      <div className="flex justify-center pt-8">
          <button
            onClick={() => validate() && alert("Profile Submitted!")}
            className="md:w-lg w-xs bg-secondary text-white font-bold py-3 rounded-full hover:bg-[#0e5641] transition-all"
          >
            Submit
          </button>
        </div>
    </div>
  );
};

export default Verification;
