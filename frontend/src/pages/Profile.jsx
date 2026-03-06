import React, { useState } from "react";
import PersonalInfo from "../components/profile/PersonalInfo";
import AdditionalInfo from "../components/profile/AdditionalInfo";
import Verification from "../components/profile/Verification";

const Profile = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    name: "Aleena Jabeen", // Predefined
    email: "aleena@gmail.com", // Predefined
    bio: "",
    address: {
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  },
    education: "",
    certificates: null,
    hasExperience: "Yes",
    cnicNo: "",
    cnicPicture: null,
    profilePicture: null,
    // Step 2
    experienceDetails: "",
    experienceDoc: null,
    skills: ["Plumber", "Carpenter", "Electrician"],
    // Step 3
    phoneNumber: "",
    otp: ["", "", "", ""],
  });

  const nextStep = () => setStep((prev) => prev + 1);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-sm md:p-8 p-2">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-12 relative">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  step >= num ? "bg-secondary text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {num}
                </div>
                <span className={`text-xs mt-2 font-medium ${step === num ? "text-secondary" : "text-gray-400"}`}>
                  {num === 1 ? "Personal Info" : num === 2 ? "Additional Info" : "Verification"}
                </span>
              </div>
              {num < 3 && (
                <div className={`w-24 md:w-40 h-[2px] mb-6 border-t-2 border-dashed ${
                  step > num ? "border-secondary" : "border-gray-300"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Rendering */}
        {step === 1 && <PersonalInfo formData={formData} setFormData={setFormData} onNext={nextStep} />}
        {step === 2 && <AdditionalInfo formData={formData} setFormData={setFormData} onNext={nextStep} />}
        {step === 3 && <Verification formData={formData} setFormData={setFormData} />}
      </div>
    </div>
  );
};

export default Profile;