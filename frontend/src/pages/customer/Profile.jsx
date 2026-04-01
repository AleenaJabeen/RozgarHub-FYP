import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CustomerPersonalInfo from "../../components/customer/profile/PersonalInfo";
import CustomerVerification from "../../components/customer/profile/Verification";
import {
  createCustomerProfile,
  updateCustomerProfile,
  getCustomerProfile,
} from "../../store/customer/profile-slice";
import { showToast } from "../../utils/toastHelper";

const CustomerProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user }             = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.customerProfile);

  // ─── Fetch existing profile on mount ────────────────────────────
  useEffect(() => {
    dispatch(getCustomerProfile());
  }, [dispatch]);

  // ─── Smart Form State Initialization ────────────────────────────
  // Priority: 1. localStorage draft  2. Server data  3. Blank defaults
  const [formData, setFormData] = useState(() => {
    // Priority 1 — in-progress draft saved to localStorage
    const savedData = localStorage.getItem("customerProfileDraft");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return { ...parsed, avatar: null }; // blobs can't be serialized
    }

    // Priority 2 — pre-fill from existing Redux server data
    if (profile && user) {
      const coords = user.location?.currentLocation?.coordinates;
      return {
        name:        user.name        || "",
        email:       user.email       || "",
        avatar:      null,
        address: {
          street:  user.location?.address?.street  || "",
          city:    user.location?.address?.city    || "",
          state:   user.location?.address?.state   || "",
          country: user.location?.address?.country || "",
          zipCode: user.location?.address?.zipCode || "",
        },
        location: {
          // GeoJSON stores [longitude, latitude]
          longitude: coords?.[0] ?? null,
          latitude:  coords?.[1] ?? null,
        },
        phoneNumber: user.phone || "",
        otp:         ["", "", "", "", "", ""],
      };
    }

    // Priority 3 — brand new user, blank slate
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

    // Omit the file blob — not serializable
    const { avatar, ...serializableData } = formData;
    localStorage.setItem("customerProfileDraft", JSON.stringify(serializableData));
    localStorage.setItem("customerProfileStep", String(step));

    window.scrollTo(0, 0);
  }, [formData, step, user]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // ─── Dynamic Submit: create vs. update ──────────────────────────
  const handleSubmit = async () => {
    const data = new FormData();

    data.append("phone",   formData.phoneNumber);
    data.append("street",  formData.address.street);
    data.append("city",    formData.address.city);
    data.append("state",   formData.address.state);
    data.append("country", formData.address.country);
    data.append("zipCode", formData.address.zipCode);

    if (formData.avatar) {
      data.append("avatar", formData.avatar);
    }

    // Never send the string "null" — backend GeoJSON validation will reject it
    if (formData.location.longitude !== null && formData.location.latitude !== null) {
      data.append("longitude", formData.location.longitude);
      data.append("latitude",  formData.location.latitude);
    }

    try {
      // If a Customer document already exists — update; otherwise — create
      const action   = profile ? updateCustomerProfile : createCustomerProfile;
      const response = await dispatch(action(data)).unwrap();

      localStorage.removeItem("customerProfileDraft");
      localStorage.removeItem("customerProfileStep");
      showToast(response.message);
      navigate("/customer");
    } catch (err) {
      showToast(err || "Something went wrong", "error");
    }
  };

  // ─── Loading State ───────────────────────────────────────────────
  // Block render while GET is in-flight so the form doesn't flash
  // blank defaults before server data arrives and re-fills it.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
      </div>
    );
  }

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
