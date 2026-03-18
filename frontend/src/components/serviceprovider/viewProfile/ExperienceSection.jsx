import { useState, useRef, useEffect } from "react";
import { IoTrash } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import { FaBriefcase, FaAward, FaAlignLeft } from "react-icons/fa";
import { LuPlus } from "react-icons/lu";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-tertiary bg-transparent";

const ExperienceSection = ({ formData, updateField }) => {
  const [editExpId, setEditExpId] = useState(null);
  const [editDetails, setEditDetails] = useState(false); 
  
  const experienceContainerRef = useRef(null);
  const detailsRef = useRef(null);

  // Default to empty array if experience doesn't exist
  const experienceList = formData.experience || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (experienceContainerRef.current && !experienceContainerRef.current.contains(event.target)) {
        setEditExpId(null);
      }
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        setEditDetails(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateExperience = (index, key, value) => {
    const updated = [...(formData.experience || [])];
    updated[index] = { ...updated[index], [key]: value };
    updateField({ experience: updated });
  };

  const handleExperienceUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const updated = [...(formData.experience || [])];
    updated[index] = { ...(updated[index] || {}), documentUrl: fileUrl };
    updateField({ experience: updated });
  };

  const removeExperience = (index) => {
    const updated = (formData.experience || []).filter((_, i) => i !== index);
    updateField({ experience: updated });
    if (editExpId === index) setEditExpId(null);
  };

 const handleCertificateUpload = (e) => {
  const files = Array.from(e.target.files);
  const newCerts = files.map(file => ({
    file: file, 
    preview: URL.createObjectURL(file) 
  }));

  updateField({
    certificates: [...(formData.certificates || []), ...newCerts],
  });
};

  const removeCertificate = (index) => {
    updateField({ certificates: (formData.certificates || []).filter((_, i) => i !== index) });
  };

  return (
    <>
      {/* 1. Experience Overview Text Field */}
      <div ref={detailsRef} className="border border-gray-300 rounded-2xl p-6 shadow-md mb-6 bg-white">
        <h3 className="md:text-2xl text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <FaAlignLeft className="text-secondary" size={18} /> Experience Overview
        </h3>
        
        {/* FIX: Removed the "|| !formData.experienceDetails" check */}
        {editDetails ? (
          <div className="space-y-3">
            <textarea
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Provide a general overview of your work history..."
              value={formData.experienceDetails || ""}
              onChange={(e) => updateField({ experienceDetails: e.target.value })}
              autoFocus
            />
            <div className="flex justify-end">
              <button
                onClick={() => setEditDetails(false)}
                className="px-6 py-1 text-sm bg-secondary text-white rounded-lg hover:bg-secondary/90"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            {formData.experienceDetails ? (
               <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
               {formData.experienceDetails}
             </p>
            ) : (
              <p className="text-gray-400 italic text-sm mb-2">No overview added yet.</p>
            )}
           
            <button
              onClick={() => setEditDetails(true)}
              className="mt-3 flex items-center gap-2 text-tertiary text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
            >
              <MdOutlineEdit size={18} /> {formData.experienceDetails ? "Edit Overview" : "Add Overview"}
            </button>
          </div>
        )}
      </div>

      {/* 2. Experience Documents/List Section */}
      <div ref={experienceContainerRef} className="border border-gray-300 rounded-2xl p-6 shadow-md bg-white">
        <h3 className="md:text-2xl text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <FaBriefcase className="text-secondary" size={18} /> Experience Documents
        </h3>

        <div className="space-y-4">
          {experienceList.length === 0 && !editExpId && (
            <p className="text-gray-400 italic text-sm">No experience documents uploaded.</p>
          )}

          {experienceList.map((exp, index) => {
            // FIX: Removed the auto-edit check for empty titles
            const isEditing = editExpId === index;

            return (
              <div
                key={index}
                className={`border rounded-xl p-4 transition-all ${
                  isEditing ? "border-secondary bg-white shadow-sm" : "border-secondary/10 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {isEditing ? (
                  <>
                    <textarea
                      rows={2}
                      className={`${inputCls} resize-none mb-2`}
                      placeholder="Title / Workplace (e.g. Senior Electrician at Tesla)"
                      value={exp.title}
                      autoFocus
                      onChange={(e) => updateExperience(index, "title", e.target.value)}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <input type="file" className="text-xs" onChange={(e) => handleExperienceUpload(e, index)} />
                      <div className="flex gap-2">
                        <button onClick={() => removeExperience(index)} className="text-xs text-red-500 flex items-center gap-1 px-2">
                          <IoTrash size={14} /> Remove
                        </button>
                        <button onClick={() => setEditExpId(null)} className="px-4 py-1 text-xs bg-secondary text-white rounded-lg">
                          Save Record
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-800 font-semibold">{exp.title || "Untitled Experience"}</p>
                      {exp.documentUrl && (
                        <a href={exp.documentUrl} target="_blank" rel="noreferrer" className="text-xs text-secondary underline">
                          View Attachment
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <MdOutlineEdit className="cursor-pointer text-gray-500 hover:text-secondary" size={20} onClick={() => setEditExpId(index)} />
                      <IoTrash className="cursor-pointer text-gray-300 hover:text-red-400" size={18} onClick={() => removeExperience(index)} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Button to add a new document row */}
        {!editExpId && (
          <button 
            onClick={() => {
              const newList = [...experienceList, { title: "", documentUrl: "" }];
              updateField({ experience: newList });
              setEditExpId(newList.length - 1);
            }}
            className="mt-4 text-secondary text-sm font-bold flex items-center gap-1 hover:underline"
          >
            <LuPlus /> Add Document
          </button>
        )}
      </div>

      {/* 3. Certificates Section */}
      <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-md mt-6">
        <div className="flex flex-col gap-4 mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaAward className="text-secondary" size={20} /> Certificates
          </h3>
          <label className="w-fit flex items-center gap-1 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-base text-tertiary hover:bg-gray-100 transition-colors">
             <LuPlus/> Add Certificates
             <input type="file" multiple onChange={handleCertificateUpload} className="hidden" />
          </label>
        </div>

        {(formData.certificates || []).length === 0 ? (
          <p className="text-gray-400 text-sm italic">No certificates uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.certificates.map((cert, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <a href={cert} target="_blank" rel="noreferrer" className="text-secondary text-sm font-medium truncate max-w-[80%]">
                  Certificate {index + 1}
                </a>
                <button onClick={() => removeCertificate(index)} className="p-1 hover:bg-red-50 rounded-full">
                    <IoTrash className="text-red-400" size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ExperienceSection;