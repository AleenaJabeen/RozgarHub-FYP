import React, { useState } from "react";
import { IoClose, IoChevronDown } from "react-icons/io5";
import { FaCheck, FaRegFileAlt } from "react-icons/fa";


const AdditionalInfo = ({ formData, setFormData, onNext,onBack }) => {
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState("");

  const handleExperienceDoc = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, experienceDoc: "Only PDF/JPG/PNG allowed." }));
      return;
    }
    setFormData((prev) => ({ ...prev, experienceDoc: file }));
    setErrors((prev) => ({ ...prev, experienceDoc: "" }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      setErrors((prev) => ({ ...prev, skill: "Skill already added." }));
      return;
    }
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setSkillInput("");
    setErrors((prev) => ({ ...prev, skill: "" }));
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skillToRemove) }));
  };

  const handleUrgentToggle = () => {
    setFormData((prev) => ({
      ...prev,
      urgentHire: prev.urgentHire === "yes" ? "no" : "yes",
    }));
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.experienceDetails.trim()) newErrors.experienceDetails = "Experience details are required.";
    if (formData.skills.length === 0)       newErrors.skills = "Add at least one skill.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary mb-6">Additional Information</h2>
      <div className="max-w-2xl space-y-5">

        {/* Experience */}
        <div className="ms-3">
          <label className="block text-base font-medium mb-2">Experience</label>
          <textarea
            placeholder="Enter your experience..."
            className={`w-full p-4 border rounded-3xl h-32 focus:outline-none ${errors.experienceDetails ? "border-red-500" : "border-gray-300"}`}
            value={formData.experienceDetails}
            onChange={(e) => { setFormData((prev) => ({ ...prev, experienceDetails: e.target.value })); if (errors.experienceDetails) setErrors((p) => ({ ...p, experienceDetails: "" })); }}
          />
          {errors.experienceDetails && <p className="text-red-500 text-xs mt-1">{errors.experienceDetails}</p>}
        </div>

        {/* Experience Doc */}
        <div className="ms-3">
          <label className="block text-base font-medium mb-2">Experience Document <span className="text-gray-400 font-normal">(Optional)</span></label>
          <label className="cursor-pointer">
            <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleExperienceDoc} />
            <div className="w-full px-4 py-2 bg-gray-300 rounded-full flex justify-between items-center text-tertiary hover:bg-gray-300 transition-colors">
              <span>{formData.experienceDoc ? formData.experienceDoc.name : "Choose File"}</span>
              <FaRegFileAlt size={20} className="text-gray-500" />
            </div>
          </label>
          {errors.experienceDoc && <p className="text-red-500 text-xs mt-1">{errors.experienceDoc}</p>}
        </div>

        {/* Skills */}
        <div className="ms-3">
          <label className="block text-base font-medium mb-2">Skills</label>
          <div className="relative flex gap-2 mb-3">
            <div className="relative flex-1 md:max-w-xs">
              <input
                type="text"
                placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="w-full px-4 py-2 border border-gray-300 rounded-full outline-none pr-8"
              />
             
            </div>
            <button onClick={addSkill} className="px-4 py-2 bg-secondary text-white rounded-full text-sm font-medium hover:bg-[#0e5641] transition-all">
              Add
            </button>
          </div>
          {errors.skill && <p className="text-red-500 text-xs mb-2">{errors.skill}</p>}

          <div className="flex flex-wrap gap-3">
            {formData.skills.map((skill) => (
              <div key={skill} className="flex items-center gap-2 px-5 py-2 bg-gray-200 rounded-full font-medium text-sm">
                {skill}
                <IoClose className="cursor-pointer text-gray-600 hover:text-red-500" onClick={() => removeSkill(skill)} />
              </div>
            ))}
          </div>
          {errors.skills && <p className="text-red-500 text-xs mt-2">{errors.skills}</p>}
        </div>
{/* Urgent Hire Section */}
<div className="ms-3 pt-4">
  <label className="block text-base font-medium mb-3">
    Are you available for urgent hire?
  </label>
  <div className="flex gap-6">
    {/* Yes Option */}
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="radio"
        name="urgentHire"
        value="true"
        checked={formData.urgentHire === true}
        onChange={(e) => updateField({ urgentHire: true })}
        className="hidden" 
      />
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        formData.urgentHire === true ? "border-secondary" : "border-gray-300 group-hover:border-gray-400"
      }`}>
        {formData.urgentHire === true && <div className="w-2.5 h-2.5 rounded-full bg-secondary" />}
      </div>
      <span className={`text-sm font-medium ${formData.urgentHire === true ? "text-secondary" : "text-gray-600"}`}>
        Yes
      </span>
    </label>

    {/* No Option */}
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="radio"
        name="urgentHire"
        value="false"
        checked={formData.urgentHire === false}
        onChange={(e) => updateField({ urgentHire: false })}
        className="hidden"
      />
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        formData.urgentHire === false ? "border-secondary" : "border-gray-300 group-hover:border-gray-400"
      }`}>
        {formData.urgentHire === false && <div className="w-2.5 h-2.5 rounded-full bg-secondary" />}
      </div>
      <span className={`text-sm font-medium ${formData.urgentHire === false ? "text-secondary" : "text-gray-600"}`}>
        No
      </span>
    </label>
  </div>
</div>

      
      </div>
      

      <div className="flex justify-center gap-4 pt-8">
        <button
          type="button"
          onClick={onBack}
          className="md:w-sm w-xs  cursor-pointer bg-secondary text-white font-bold py-3 rounded-full mt-8 hover:bg-[#0e5641] transition-all">
        
          Back
        </button>
        <button onClick={() => validate() && onNext()}
          className="md:w-sm w-xs  cursor-pointer bg-secondary text-white font-bold py-3 rounded-full mt-8 hover:bg-[#0e5641] transition-all">
         Next
        </button>
      </div>
    </div>
  );
};

export default AdditionalInfo;