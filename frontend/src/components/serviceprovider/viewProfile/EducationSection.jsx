import React, { useState, useRef, useEffect } from 'react' // 1. Added useRef and useEffect
import { LuPlus } from "react-icons/lu";
import { GiGraduateCap } from "react-icons/gi";

function EducationSection({ formData, updateField }) {
  const [editEducation, setEditEducation] = useState(false);
  
  // 2. Create a reference for the section container
  const sectionRef = useRef(null);

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-tertiary bg-transparent";

  // 3. Handle clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // If the section is in edit mode AND the click was outside the sectionRef
      if (editEducation && sectionRef.current && !sectionRef.current.contains(event.target)) {
        setEditEducation(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editEducation]); // Re-run effect when editEducation changes

  return (
    <>
      {/* 4. Attach the ref to the main wrapper div */}
      <div 
        ref={sectionRef} 
        className="border border-gray-300 rounded-2xl p-6 shadow-md mb-6"
      >
        <h3 className="md:text-2xl text-xl font-bold text-tertiary flex items-center gap-3 mb-4">
          <GiGraduateCap className="text-secondary" size={20}/> Education
        </h3>

      {/* Change this line */}
{editEducation ? (
  <>
    <textarea
      rows={3}
      className={`${inputCls} resize-none`}
      placeholder="Enter your education"
      value={formData.education || ""}
      onChange={(e) => updateField({ education: e.target.value })}
      autoFocus
    />

    <div className="flex justify-end mt-2">
      <button
        onClick={() => setEditEducation(false)}
        className="px-4 py-1 flex items-center gap-1 text-base bg-secondary text-white rounded-lg"
      >
        <LuPlus/> Add
      </button>
    </div>
  </>
) : (
  <div className="flex flex-col items-start gap-3">
    {/* Only show the text if it actually exists */}
    {formData.education ? (
      <span className="text-gray-800 font-medium whitespace-pre-wrap">
        {formData.education}
      </span>
    ) : (
      <p className="text-gray-400 italic text-sm">No education details added.</p>
    )}

    <button
      className="flex items-center gap-2 text-tertiary text-base border border-gray-300 rounded-lg px-4 py-2"
      onClick={() => setEditEducation(true)}
    >
      {formData.education ? "Edit Education" : "Add Education"}
    </button>
  </div>
)}
      </div>
    </>
  )
}

export default EducationSection;