import React, { useState } from "react";
import { IoDocumentAttachOutline, IoChevronDown } from "react-icons/io5";

const PersonalInfo = ({ formData, setFormData, onNext }) => {
  const [errors, setErrors] = useState({});

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [name]: value,
      },
    });
    // Clear error for this specific field if it exists
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.bio.trim()) newErrors.bio = "Bio is required";
    if (!formData.address.street.trim()) newErrors.street = "Street is required";
    if (!formData.address.city.trim()) newErrors.city = "City is required";
    if (!formData.cnicNo.trim()) newErrors.cnicNo = "CNIC Number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary mb-6">Personal Information</h2>
      <div className="flex flex-col md:flex-row gap-8 md:gap-28">
        <div className="flex flex-col items-center md:order-2">
          <div className="w-48 h-48 rounded-full border-2 border-dashed border-gray-400 bg-red-50 flex items-center justify-center text-center p-6 cursor-pointer hover:bg-red-100 transition-colors">
            <p className="text-gray-800 font-medium">upload profile picture</p>
          </div>
        </div>
        <div className="max-w-2xl flex-1 space-y-4 md:order-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Name</label>
              <input type="text" value={formData.name} disabled className="w-full px-4 py-2 bg-gray-200 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input type="text" value={formData.email} disabled className="w-full px-4 py-2 bg-gray-200 rounded-lg outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Bio</label>
            <textarea 
              placeholder="Add Some Bio"
              className={`w-full p-4 border rounded-xl h-32 focus:outline-none ${errors.bio ? "border-red-500" : "border-gray-300"}`}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
            {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Address Details</label>
            <input 
              name="street" type="text" placeholder="Street Address" 
              className={`w-full px-4 py-2 border rounded-full focus:outline-none ${errors.street ? "border-red-500" : "border-gray-300"}`}
              value={formData.address.street}
              onChange={handleAddressChange}
            />
            {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
            <div className="grid grid-cols-2 gap-3">
              <input 
                name="city" type="text" placeholder="City" 
                className={`px-4 py-2 border rounded-full focus:outline-none ${errors.city ? "border-red-500" : "border-gray-300"}`}
                value={formData.address.city}
                onChange={handleAddressChange}
              />
              <input 
                name="state" type="text" placeholder="State/Province" 
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                value={formData.address.state}
                onChange={handleAddressChange}
              />
            </div>
            
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            <div className="grid grid-cols-2 gap-3">
              <input 
                name="country" type="text" placeholder="Country" 
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                value={formData.address.country}
                onChange={handleAddressChange}
              />
              <input 
                name="zipCode" type="text" placeholder="Zip Code" 
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                value={formData.address.zipCode}
                onChange={handleAddressChange}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-semibold mb-1">Education</label>
             <input type="text" placeholder="Education(optional)" className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none" />
          </div>

          <div>
             <label className="block text-sm font-semibold mb-1">Certificates</label>
             <div className="w-full px-4 py-2 bg-gray-200 rounded-full flex justify-between items-center text-gray-500 cursor-pointer">
                <span>File Input</span>
                <IoDocumentAttachOutline size={20}/>
             </div>
          </div>

          {/* <div className="flex items-center gap-4">
            <span className="font-semibold">Experience</span>
            <div className="flex border border-secondary rounded-full overflow-hidden">
               <button className="px-4 py-1 bg-secondary text-white">Yes</button>
               <button className="px-4 py-1">No</button>
            </div>
          </div> */}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">CNIC No.</label>
              <input 
                type="text" placeholder="CNIC" 
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${errors.cnicNo ? "border-red-500" : "border-gray-300"}`}
                onChange={(e) => setFormData({...formData, cnicNo: e.target.value})}
              />
              {errors.cnicNo && <p className="text-red-500 text-xs mt-1">{errors.cnicNo}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">CNIC Picture</label>
              <div className="w-full px-4 py-2 bg-gray-200 rounded-lg flex justify-between items-center text-gray-500 cursor-pointer">
                <span>File Input</span>
                <IoDocumentAttachOutline size={20}/>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="flex justify-center pt-8">
      <button 
        onClick={handleContinue}
        className="md:w-lg w-xs bg-secondary text-white font-bold py-3 rounded-full mt-8 hover:bg-[#0e5641] transition-all"
      >
        Continue to Step 2
      </button>
      </div>
    </div>
  );
};

export default PersonalInfo;