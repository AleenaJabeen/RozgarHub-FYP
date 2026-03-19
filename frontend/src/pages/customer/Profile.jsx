import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CustomerPersonalInfo from "../../components/customer/profile/PersonalInfo";
import CustomerVerification from "../../components/customer/profile/Verification";
import { createCustomerProfile } from "../../store/customer/profile-slice";
import { showToast } from "../../utils/toastHelper";

const CustomerProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // ─── Form State (with localStorage draft rehydration) ───────────
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("customerProfileDraft");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // File blobs cannot be serialized — always reset to null on rehydration
      return { ...parsed, avatar: null };
    }
    return {
      name:        user?.name  || "",
      email:       user?.email || "",
      avatar:      null,
      address:     { street: "", city: "", state: "", country: "", zipCode: "" },
      location:    { latitude: null, longitude: null },
      phoneNumber: "",
      otp:         ["", "", "", "", "", ""],
    };
  });

  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("customerProfileStep");
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  // ─── Persist draft to localStorage on every change ──────────────
  useEffect(() => {
    if (!user) {
      localStorage.removeItem("customerProfileDraft");
      localStorage.removeItem("customerProfileStep");
      navigate("/login");
      return;
    }

    // Omit the file blob — localStorage only stores serializable data
    const { avatar, ...serializableData } = formData;
    localStorage.setItem("customerProfileDraft", JSON.stringify(serializableData));
    localStorage.setItem("customerProfileStep", String(step));

    window.scrollTo(0, 0);
  }, [formData, step, user]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // ─── Final Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    const data = new FormData();

    data.append("phone",   formData.phoneNumber);
    data.append("street",  formData.address.street);
    data.append("city",    formData.address.city);
    data.append("state",   formData.address.state);
    data.append("country", formData.address.country);
    data.append("zipCode", formData.address.zipCode);

    // Only append avatar if the user uploaded one
    if (formData.avatar) {
      data.append("avatar", formData.avatar);
    }

    // Critical: never send the string "null" — backend GeoJSON validation will reject it
    if (formData.location.longitude !== null && formData.location.latitude !== null) {
      data.append("longitude", formData.location.longitude);
      data.append("latitude",  formData.location.latitude);
    }

    try {
      const response = await dispatch(createCustomerProfile(data)).unwrap();
      // Clean up draft on success
      localStorage.removeItem("customerProfileDraft");
      localStorage.removeItem("customerProfileStep");
      showToast(response.message);
      navigate("/customer");
    } catch (err) {
      showToast(err || "Something went wrong", "error");
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="lg:p-8 md:p-6 p-2">

        {/* ── 2-Step Stepper ── */}
        <div className="flex items-center justify-center mb-12 relative">
          {[1, 2].map((num) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step >= num ? "bg-secondary text-white" : "bg-gray-400 text-primary"
                  }`}
                >
                  {num}
                </div>
                <span
                  className={`text-xs mt-2 font-semibold ${
                    step === num ? "text-secondary" : "text-gray-400"
                  }`}
                >
                  {num === 1 ? "Personal Info" : "Verification"}
                </span>
              </div>

              {num < 2 && (
                <div
                  className={`w-24 md:w-40 h-[2px] mb-6 border-t-2 border-dashed ${
                    step > num ? "border-secondary" : "border-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Step Renderer ── */}
        {step === 1 && (
          <CustomerPersonalInfo
            formData={formData}
            setFormData={setFormData}
            onNext={nextStep}
          />
        )}
        {step === 2 && (
          <CustomerVerification
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onBack={prevStep}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
