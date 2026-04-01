// components/profile/SkillsSection.jsx
import { useState } from "react";
import { IoPencil, IoAdd, IoClose } from "react-icons/io5";
import { FaRegUser, FaBriefcase } from "react-icons/fa";
import { BsPersonFill } from "react-icons/bs";
import { LuPlus } from "react-icons/lu";
import { MdOutlineEdit } from "react-icons/md";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-tertiary bg-transparent";
const SkillsSection = ({
  formData,
  editSection,
  setEditSection,
  updateField,
  newSkill,
  setNewSkill,
}) => {
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || formData.skills?.includes(trimmed)) return;
    updateField({ skills: [...(formData.skills || []), trimmed] });
    setNewSkill("");
  };

  const removeSkill = (skill) =>
    updateField({ skills: formData.skills.filter((s) => s !== skill) });

  return (
    <>
      {/* Bio */}
      <div className="border border-gray-300 rounded-2xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="md:text-2xl text-xl font-bold text-gray-800 flex items-center gap-3">
            <BsPersonFill className="text-secondary" size={18} />About 
          </h3>
          {editSection !== "bio" && (
           <MdOutlineEdit
           size={24}
              className="cursor-pointer text-gray-600 hover:text-secondary cursor-pointer"
              onClick={() => setEditSection("bio")}
            />
          )}
        </div>
        {editSection === "bio" ? (
          <div className="space-y-3">
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={(e) => updateField({ bio: e.target.value })}
              className={`${inputCls} h-32 resize-none text-gray-600 text-base`}
              autoFocus
            />
            <div className="flex justify-end">
              <button
                onClick={() => setEditSection(null)}
                className="px-6 py-1.5 text-sm bg-secondary text-white rounded-full"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 leading-relaxed">
            {formData.bio || "Write something about your professional journey..."}
          </p>
        )}
      </div>

      {/* Skills */}
      <div className="border border-gray-300 rounded-2xl p-6 shadow-md">
        <h3 className="md:text-2xl text-xl font-bold text-gray-800 flex items-center gap-3 mb-4">
          <FaBriefcase className="text-secondary" size={18} /> Skills
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {(formData.skills || []).length === 0 && (
            <p className="text-gray-400 text-sm italic">No skills added yet.</p>
          )}
          {(formData.skills || []).map((skill, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-secondary rounded-full text-sm font-semibold border border-emerald-100 group"
            >
              {skill}
              <IoClose
                size={13}
                className=" group-hover:opacity-100 cursor-pointer hover:text-red-500 transition-opacity"
                onClick={() => removeSkill(skill)}
              />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="Type a skill and press Enter..."
            className={`${inputCls} flex-1`}
          />
          <button
            onClick={addSkill}
            className="px-4 py-2 bg-secondary text-white rounded-xl text-sm flex items-center gap-1 hover:opacity-90 whitespace-nowrap"
          >
            <LuPlus size={18} /> Add
          </button>
        </div>
      </div>
    </>
  );
};

export default SkillsSection;