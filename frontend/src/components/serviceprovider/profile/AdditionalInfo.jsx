import React, { useState } from "react";
import { IoClose, IoDocumentAttachOutline, IoChevronDown } from "react-icons/io5";

const AdditionalInfo = ({ formData, setFormData, onNext }) => {
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
        <div>
          <label className="block text-sm font-semibold mb-1">Experience</label>
          <textarea
            placeholder="Enter your experience..."
            className={`w-full p-4 border rounded-xl h-32 focus:outline-none ${errors.experienceDetails ? "border-red-500" : "border-gray-300"}`}
            value={formData.experienceDetails}
            onChange={(e) => { setFormData((prev) => ({ ...prev, experienceDetails: e.target.value })); if (errors.experienceDetails) setErrors((p) => ({ ...p, experienceDetails: "" })); }}
          />
          {errors.experienceDetails && <p className="text-red-500 text-xs mt-1">{errors.experienceDetails}</p>}
        </div>

        {/* Experience Doc */}
        <div>
          <label className="block text-sm font-semibold mb-1">Experience Document <span className="text-gray-400 font-normal">(Optional)</span></label>
          <label className="cursor-pointer">
            <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleExperienceDoc} />
            <div className="w-full px-4 py-2 bg-gray-200 rounded-lg flex justify-between items-center text-gray-500 hover:bg-gray-300 transition-colors">
              <span>{formData.experienceDoc ? formData.experienceDoc.name : "Choose File"}</span>
              <IoDocumentAttachOutline size={20} />
            </div>
          </label>
          {errors.experienceDoc && <p className="text-red-500 text-xs mt-1">{errors.experienceDoc}</p>}
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-semibold mb-2">Skills</label>
          <div className="relative flex gap-2 mb-3">
            <div className="relative flex-1 md:max-w-xs">
              <input
                type="text"
                placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none pr-8"
              />
              <IoChevronDown className="absolute right-3 top-3 text-gray-400" />
            </div>
            <button onClick={addSkill} className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-[#0e5641] transition-all">
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
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={() => validate() && onNext()}
          className="md:w-lg w-xs bg-secondary text-white font-bold py-3 rounded-full sm:mt-12 hover:bg-[#0e5641] transition-all">
          Continue to Step 3
        </button>
      </div>
    </div>
  );
};

export default AdditionalInfo;