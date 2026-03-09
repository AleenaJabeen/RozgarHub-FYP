import React, { useState } from "react";
import {useNavigate} from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import PersonalInfo from "../../components/serviceprovider/profile/PersonalInfo";
import AdditionalInfo from "../../components/serviceprovider/profile/AdditionalInfo";
import Verification from "../../components/serviceprovider/profile/Verification";
import { createProviderProfile } from "../../store/serviceProvider/profile-slice";
import { showToast } from "../../utils/toastHelper";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate=useNavigate();
  const [step, setStep] = useState(1);
   const { user } = useSelector((state) => state.auth);
   const name=user?.name;
   const email=user?.email;
  const [formData, setFormData] = useState({
    name: name,
    email: email,
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
   otp: ["", "", "", "", "", ""],
  });

  const nextStep = () => setStep((prev) => prev + 1);

const handleSubmit = async() => {
  const data = new FormData();

  data.append("bio", formData.bio);
  data.append("cnicNo", formData.cnicNo);
  data.append("experienceDetails", formData.experienceDetails);
  data.append("phone", formData.phoneNumber);
  data.append("skills", formData.skills.join(","));
  data.append("street", formData.address.street);
  data.append("city", formData.address.city);
  data.append("state", formData.address.state);
  data.append("country", formData.address.country);
  data.append("zipCode", formData.address.zipCode);
  data.append("longitude", formData.location.longitude);
  data.append("latitude", formData.location.latitude);
  data.append("urgentHire", false);

  if (formData.profilePicture) data.append("avatar", formData.profilePicture);
  if (formData.cnicPicture) data.append("cnicImg", formData.cnicPicture);
  if (formData.certificates) data.append("certificates", formData.certificates);
  if (formData.experienceDoc) data.append("experienceDocuments", formData.experienceDoc);
  console.log("cnicPicture:", formData.cnicPicture instanceof File); // must be true
console.log("cnicPicture name:", formData.cnicPicture?.name);

  // ✅ Correct way to log FormData contents
  for (let [key, value] of data.entries()) {
    console.log(key, value instanceof File ? `FILE: ${value.name}` : value);
  }

  try {
  const response = await dispatch(createProviderProfile(data)).unwrap();
  showToast(response.message);   // Now this will work
  console.log(response.message);
  navigate('/');
} catch (err) {
  showToast(err.message || 'Something went wrong','error');
  console.error(err);
}
 
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