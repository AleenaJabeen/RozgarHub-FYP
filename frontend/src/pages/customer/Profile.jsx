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
import RozgarHubLoader from '../../components/layout/Loader'

// ─── Blank address template ───────────────────────────────────────
const blankAddress = { street: "", city: "", state: "", country: "", zipCode: "" };

const CustomerProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: authUser } = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.customerProfile);
  const profileUser = useSelector((state) => state.customerProfile.user);

  useEffect(() => {
    dispatch(getCustomerProfile());
  }, [dispatch]);

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("customerProfileDraft");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return { 
      ...parsed, 
      avatar: null, 
      addresses: parsed.addresses || [{ ...blankAddress }] 
    };
    }
    return {
      name:        authUser?.name  || "",
      email:       authUser?.email || "",
      avatar:      null,
      addresses:   [{ ...blankAddress }],
      location:    { latitude: null, longitude: null },
      phoneNumber: "",
      otp:         ["", "", "", "", "", ""],
    };
  });

  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("customerProfileStep");
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  useEffect(() => {
  if (loading) return;

  const coords = profileUser?.location?.currentLocation?.coordinates;

  setFormData((prev) => ({
    ...prev,
    name: authUser?.name || prev.name || "",
    email: authUser?.email || prev.email || "",
    avatar: prev.avatar instanceof File ? prev.avatar : (profileUser?.avatar || null),
    
    // SAFE ADDRESS INITIALIZATION
    addresses: [
      {
        street: profileUser?.location?.address?.street || "",
        city: profileUser?.location?.address?.city || "",
        state: profileUser?.location?.address?.state || "",
        country: profileUser?.location?.address?.country || "",
        zipCode: profileUser?.location?.address?.zipCode || "",
      },
      // Ensure this part doesn't crash if savedAddresses is missing
      ...(profile?.savedAddresses || []).slice(1, 3).map((raw) => {
        if (typeof raw !== 'string') return { ...blankAddress }; // Safety check
        const [street = "", city = "", state = "", country = "", zipCode = ""] =
          raw.split(",").map((s) => s.trim());
        return { street, city, state, country, zipCode };
      }),
    ].filter(Boolean), // Ensure no null items get in

    location: {
      longitude: coords?.[0] ?? prev.location?.longitude ?? null,
      latitude: coords?.[1] ?? prev.location?.latitude ?? null,
    },
    phoneNumber: profileUser?.phone || authUser?.phone || prev.phoneNumber || "",
  }));
}, [loading, profile, profileUser, authUser]); // Added authUser to deps for safety

  useEffect(() => {
    if (!authUser) {
      localStorage.removeItem("customerProfileDraft");
      localStorage.removeItem("customerProfileStep");
      navigate("/login");
      return;
    }
    const { avatar, ...serializableData } = formData;
    localStorage.setItem("customerProfileDraft", JSON.stringify(serializableData));
    localStorage.setItem("customerProfileStep", String(step));
  }, [formData, step, authUser]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("phone", formData.phoneNumber);

    const primary = formData.addresses[0] || blankAddress;
    data.append("street",  primary.street);
    data.append("city",    primary.city);
    data.append("state",   primary.state);
    data.append("country", primary.country);
    data.append("zipCode", primary.zipCode);

    const allAddressStrings = formData.addresses
      .map(({ street, city, state, country, zipCode }) =>
        [street, city, state, country, zipCode].filter(Boolean).join(", ")
      )
      .filter(Boolean);

    if (allAddressStrings.length > 0) {
      data.append("savedAddresses", JSON.stringify(allAddressStrings));
    }

    if (formData.avatar instanceof File) {
      data.append("avatar", formData.avatar);
    }

    if (formData.location.longitude !== null && formData.location.latitude !== null) {
      data.append("longitude", formData.location.longitude);
      data.append("latitude",  formData.location.latitude);
    }

    try {
      const action   = profile ? updateCustomerProfile : createCustomerProfile;
      const response = await dispatch(action(data)).unwrap();

      await dispatch(getCustomerProfile());

      localStorage.removeItem("customerProfileDraft");
      localStorage.removeItem("customerProfileStep");
      showToast(response.message);
      navigate("/customer");
    } catch (err) {
      showToast(err || "Something went wrong", "error");
    }
  };

  if (loading) {
    return (
        <RozgarHubLoader/>
    );
  }

  // FIX: Merge authUser and profileUser so Verification ALWAYS knows if you're verified
  const mergedUser = { ...authUser, ...profileUser };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="lg:p-8 md:p-6 p-2">
        <div className="flex items-center justify-center mb-12 relative">
          {[1, 2].map((num) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center z-10">
                <div
                  onClick={() => setStep(num)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors cursor-pointer ${
                    step >= num ? "bg-secondary text-white" : "bg-gray-400 text-primary"
                  }`}
                >
                  {num}
                </div>
                <span className={`text-xs mt-2 font-semibold ${step === num ? "text-secondary" : "text-gray-400"}`}>
                  {num === 1 ? "Personal Info" : "Verification"}
                </span>
              </div>
              {num < 2 && (
                <div className={`w-24 md:w-40 h-[2px] mb-6 border-t-2 border-dashed ${step > num ? "border-secondary" : "border-gray-300"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

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
            user={mergedUser}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;