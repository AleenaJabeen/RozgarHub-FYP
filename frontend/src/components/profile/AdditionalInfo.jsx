import React, { useState } from "react";
import { IoClose, IoDocumentAttachOutline, IoChevronDown } from "react-icons/io5";

const AdditionalInfo = ({ formData, setFormData, onNext }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.experienceDetails.trim()) newErrors.experienceDetails = "Experience details are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary mb-6">Additional Information</h2>
      <div className="max-w-2xl">
      <div>
        <label className="block text-sm font-semibold mb-1">Experience</label>
        <textarea 
          placeholder="Enter your experience"
          className={`w-full p-4 border rounded-xl h-32 focus:outline-none ${errors.experienceDetails ? "border-red-500" : "border-gray-300"}`}
          onChange={(e) => setFormData({...formData, experienceDetails: e.target.value})}
        />
        {errors.experienceDetails && <p className="text-red-500 text-xs mt-1">{errors.experienceDetails}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Experience document - Optional</label>
        <div className="w-full px-4 py-2 bg-gray-200 rounded-lg flex justify-between items-center text-gray-500 cursor-pointer">
          <span>File Input</span>
          <IoDocumentAttachOutline size={20}/>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Skills:</label>
        <div className="relative mb-4">
          <input type="text" placeholder="Add Skills" className="md:w-1/2 w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
          <IoChevronDown className="absolute md:left-[45%] right-1.5 top-3 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-3">
          {formData.skills.map((skill) => (
            <div key={skill} className="flex items-center gap-2 px-6 py-2 bg-gray-200 rounded-full font-medium">
              {skill}
              <IoClose className="cursor-pointer" onClick={() => removeSkill(skill)} />
            </div>
          ))}
        </div>
      </div>
      </div>
<div className="flex justify-center pt-8">
      <button 
        onClick={() => validate() && onNext()}
        className="md:w-lg w-xs bg-secondary text-white font-bold py-3 rounded-full sm:mt-12 hover:bg-[#0e5641] transition-all"
      >
        Continue to Step 3
      </button>
      </div>
    </div>
  );
};

export default AdditionalInfo;