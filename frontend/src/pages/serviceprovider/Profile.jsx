import React, { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import PersonalInfo from "../../components/serviceprovider/profile/PersonalInfo";
import AdditionalInfo from "../../components/serviceprovider/profile/AdditionalInfo";
import Verification from "../../components/serviceprovider/profile/Verification";
import { createProviderProfile } from "../../store/serviceProvider/profile-slice";
import { showToast } from "../../utils/toastHelper";
import {checkAuth} from '../../store/auth-slice'

const Profile = () => {
  const dispatch = useDispatch();
  const navigate=useNavigate();
 
   const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("serviceProviderProfileDraft");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return {
        ...parsed,
        certificates: null,
        cnicPicture: null,
        profilePicture: null,
        experienceDoc: null
      };
    }
    return {
      name: user?.name || "",
      email: user?.email || "",
      bio: "",
      address: { street: "", city: "", state: "", country: "", zipCode: "" },
      location: { latitude: null, longitude: null },
      education: "",
      certificates: null,
      urgentHire:false,
      cnicNo: "",
      cnicPicture: null,
      profilePicture: null,
      experienceDetails: "",
      experienceDoc: null,
      skills: ["Plumber", "Carpenter", "Electrician"],
      phoneNumber: "",
      otp: ["", "", "", "", "", ""],
    };
  });
  
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("profileCurrentStep");
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  // Save draft to localStorage whenever formData or step changes
useEffect(() => {
  if (user) { // optional: only save if user exists
    localStorage.setItem("serviceProviderProfileDraft", JSON.stringify(formData));
    localStorage.setItem("profileCurrentStep", step.toString());
  }
}, [formData, step, user]);
 
  useEffect(() => {
   if (!user) {
    localStorage.removeItem("serviceProviderProfileDraft");
    localStorage.removeItem("profileCurrentStep");
    // Optional: Redirect to login if user is missing
    navigate('/login'); 
  }
     window.scrollTo(0, 0);
  }, [step,user]);

  
  

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

const handleSubmit = async() => {
  const data = new FormData();

  data.append("name", formData.name);
  data.append("bio", formData.bio);
  data.append("cnicNo", formData.cnicNo);
  data.append("experienceDetails", formData.experienceDetails);
  data.append("phone", formData.phoneNumber);
   data.append("education", formData.education);
  data.append("skills", formData.skills.join(","));
  data.append("street", formData.address.street);
  data.append("city", formData.address.city);
  data.append("state", formData.address.state);
  data.append("country", formData.address.country);
  data.append("zipCode", formData.address.zipCode);
  data.append("longitude", formData.location.longitude);
  data.append("latitude", formData.location.latitude);
  data.append("urgentHire", formData.urgentHire);

  if (formData.profilePicture) data.append("avatar", formData.profilePicture);
  if (formData.cnicPicture) data.append("cnicImg", formData.cnicPicture);
  if (formData.certificates) data.append("certificates", formData.certificates);
  if (formData.experienceDoc) data.append("experienceDocuments", formData.experienceDoc);
  console.log("cnicPicture:", formData.cnicPicture instanceof File); // must be true
console.log("cnicPicture name:", formData.cnicPicture?.name);

  for (let [key, value] of data.entries()) {
    console.log(key, value instanceof File ? `FILE: ${value.name}` : value);
  }

  try {
      const response = await dispatch(createProviderProfile(data)).unwrap();
      await dispatch(checkAuth());
      localStorage.removeItem("serviceProviderProfileDraft"); // Clean up!
      localStorage.removeItem("profileCurrentStep");
      showToast(response.message);
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Something went wrong', 'error');
    }
 
};

  return (
    <div className="min-h-screen  py-10 px-4">
      <div className="lg:p-8 md:p-6 p-2">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-12 relative">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  step >= num ? "bg-secondary text-white" : "bg-gray-400 text-primary"
                }`}>
                  {num}
                </div>
                <span className={`text-xs mt-2 font-semibold ${step === num ? "text-secondary" : "text-gray-400"}`}>
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
        {step === 2 && <AdditionalInfo formData={formData} setFormData={setFormData} onNext={nextStep} onBack={prevStep} />}
        {step === 3 && <Verification formData={formData} setFormData={setFormData} onSubmit={handleSubmit} onBack={prevStep} />}
      </div>
    </div>
  );
};

export default Profile;