import React, { useState } from "react";
import { useDispatch } from "react-redux";
import PersonalInfo from "../../components/serviceprovider/profile/PersonalInfo";
import AdditionalInfo from "../../components/serviceprovider/profile/AdditionalInfo";
import Verification from "../../components/serviceprovider/profile/Verification";

const Profile = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "Aleena Jabeen",
    email: "aleena@gmail.com",
    bio: "",
    address: { street: "", city: "", state: "", country: "", zipCode: "" },
    location: { latitude: null, longitude: null }, // 📍 geolocation
    education: "",
    certificates: null,       // File object
    cnicNo: "",
    cnicPicture: null,         // File object
    profilePicture: null,      // File object
    experienceDetails: "",
    experienceDoc: null,       // File object
    skills: ["Plumber", "Carpenter", "Electrician"],
    phoneNumber: "",
    otp: ["", "", "", ""],
  });

  const nextStep = () => setStep((prev) => prev + 1);

  const handleSubmit = () => {
    // Build FormData for multipart/form-data (file uploads)
    const data = new FormData();

    // Scalar fields
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("bio", formData.bio);
    data.append("education", formData.education);
    data.append("cnicNo", formData.cnicNo);
    data.append("experienceDetails", formData.experienceDetails);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("skills", JSON.stringify(formData.skills));
    data.append("address", JSON.stringify(formData.address));
    data.append("location", JSON.stringify(formData.location));

    // File fields (only append if file exists)
    if (formData.profilePicture) data.append("profilePicture", formData.profilePicture);
    if (formData.certificates)   data.append("certificates", formData.certificates);
    if (formData.cnicPicture)    data.append("cnicPicture", formData.cnicPicture);
    if (formData.experienceDoc)  data.append("experienceDoc", formData.experienceDoc);
console.log(data)
    // dispatch(createProfile(data));
  };

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

        {step === 1 && <PersonalInfo formData={formData} setFormData={setFormData} onNext={nextStep} />}
        {step === 2 && <AdditionalInfo formData={formData} setFormData={setFormData} onNext={nextStep} />}
        {step === 3 && <Verification formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />}
      </div>
    </div>
  );
};

export default Profile;