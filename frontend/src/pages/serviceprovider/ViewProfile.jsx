import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IoPencil,
  IoCamera,
  IoAdd,
  IoLocationOutline,
  IoMailOutline,
  IoOpenOutline,
  IoCheckmark,
  IoClose,
  IoTrash,
} from "react-icons/io5";
import {
  FaRegUser,
  FaBriefcase,
  FaAward,
  FaGraduationCap,
} from "react-icons/fa";
import { capitalizeWords } from "../../utils/capitalize";
import {
  getProviderProfile,
  updateProviderProfile,
} from "../../store/serviceProvider/profile-slice";

const ViewProfile = () => {
  const dispatch = useDispatch();
  const profileState = useSelector((state) => state.serviceProviderProfile);
  const { profile = null, user = null, loading = false } = profileState || {};

  const [formData, setFormData] = useState({});
  const [editSection, setEditSection] = useState(null);
  const [newSkill, setNewSkill] = useState("");

  const [saving, setSaving] = useState(false);

  const timerRef = useRef(null);
  const latestDataRef = useRef({});

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    dispatch(getProviderProfile()).unwrap().catch(console.error);
  }, [dispatch]);

  // Seed from Redux - changed fullName to name
  useEffect(() => {
    if (profile && user) {
      const initial = {
        bio: profile.bio || "",
        experienceDetails: profile.experienceDetails || "",
        skills: profile.skills || [],
        name: capitalizeWords(user.name) || "", // Changed here
        city: capitalizeWords(user.location?.address?.city) || "",
        urgentHire: profile.urgentHire || "no",
        experienceDocuments: profile.experienceDocuments || [],
        certificates: profile.certificates || [],
      };
      setFormData(initial);
      latestDataRef.current = initial;
    }
  }, [profile, user]);

  const scheduleSave = useCallback(
    (nextData) => {
      latestDataRef.current = nextData;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const d = latestDataRef.current;
        const payload = new FormData();
        payload.append("bio", d.bio || "");
        payload.append("experienceDetails", d.experienceDetails || "");
        payload.append(
          "skills",
          Array.isArray(d.skills) ? d.skills.join(",") : "",
        );
        payload.append("name", d.name || ""); // Changed here
        payload.append("city", d.city || "");
        payload.append("urgentHire", d.urgentHire || "no");
        payload.append(
          "experienceDocuments",
          JSON.stringify(d.experienceDocuments || []),
        );

        payload.append("certificates", JSON.stringify(d.certificates || []));

        dispatch(updateProviderProfile(payload)).finally(() =>
          setSaving(false),
        );
      }, 6000);
    },
    [dispatch],
  );

  const updateField = (updates) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      scheduleSave(next);
      return next;
    });
  };

  const handleInputChange = (e) => {
    updateField({ [e.target.name]: e.target.value });
  };

  // Skills
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || formData.skills?.includes(trimmed)) return;
    updateField({ skills: [...(formData.skills || []), trimmed] });
    setNewSkill("");
  };
  const removeSkill = (skill) =>
    updateField({ skills: formData.skills.filter((s) => s !== skill) });
const addEducation = () => {
  updateField({
    education: [
      ...(formData.education || []),
      { title: "", documentUrl: "" } // new blank education
    ]
  });
};
// Missing State for Education Editing
  const [editEduId, setEditEduId] = useState(null);

  // Handle Certificate Uploads
  const handleCertificateUpload = (e) => {
    const files = Array.from(e.target.files);
    // Note: In a real app, you'd upload to a server here and get URLs back.
    // This example creates local object URLs for previewing.
    const newCerts = files.map(file => URL.createObjectURL(file));
    updateField({
      certificates: [...(formData.certificates || []), ...newCerts]
    });
  };

  // Handle Education Document Uploads
  const handleEducationUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileUrl = URL.createObjectURL(file);
    const updated = [...formData.experienceDocuments];
    updated[index] = { ...updated[index], documentUrl: fileUrl };

    updateField({ experienceDocuments: updated });
  };

  // Remove Education entry
  const removeEducation = (index) => {
    const updated = formData.experienceDocuments.filter((_, i) => i !== index);
    updateField({ experienceDocuments: updated });
  };
const updateEducation = (index, key, value) => {
  const updated = [...formData.experienceDocuments];
  updated[index][key] = value;

  updateField({ experienceDocuments: updated });
};
const addCertificate = (url) => {
  updateField({
    certificates: [...(formData.certificates || []), url]
  });
};
const removeCertificate = (index) => {
  updateField({
    certificates: formData.certificates.filter((_, i) => i !== index)
  });
};

  if (loading || (!profile && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
      </div>
    );
  }

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary bg-white";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-secondary overflow-hidden border-4 border-white shadow-md">
                  <img
                    src={user.avatar || "https://via.placeholder.com/150"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 text-secondary">
                  <IoCamera size={18} />
                </button>
              </div>

              <div className="flex-1 w-full text-center sm:text-left space-y-3">
                {/* Name */}
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {editSection === "name" ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        className="text-2xl font-bold border-b-2 border-secondary outline-none px-1 flex-1 bg-transparent"
                        autoFocus
                      />
                      <button
                        onClick={() => setEditSection(null)}
                        className="text-secondary"
                      >
                        <IoCheckmark size={22} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {capitalizeWords(formData.name || user.name)}
                      </h1>
                      <IoPencil
                        className="text-gray-400 hover:text-secondary cursor-pointer"
                        onClick={() => setEditSection("name")}
                      />
                    </>
                  )}
                </div>

                {/* Email — read only */}
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400">
                  <IoMailOutline size={15} />
                  <span className="text-sm cursor-not-allowed select-none">
                    {user.email}
                  </span>
                </div>

                {/* City */}
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                  <IoLocationOutline className="text-secondary" size={15} />
                  {editSection === "city" ? (
                    <div className="flex items-center gap-2">
                      <input
                        name="city"
                        value={formData.city || ""}
                        onChange={handleInputChange}
                        className="border-b border-secondary outline-none text-sm px-1 bg-transparent"
                        autoFocus
                      />
                      <button onClick={() => setEditSection(null)}>
                        <IoCheckmark className="text-secondary" size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span>{formData.city || "City not set"}</span>
                      <IoPencil
                        size={12}
                        className="text-gray-400 hover:text-secondary cursor-pointer"
                        onClick={() => setEditSection("city")}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaRegUser className="text-secondary" size={15} /> Professional
                Bio
              </h3>
              {editSection !== "bio" && (
                <IoPencil
                  className="text-gray-400 hover:text-secondary cursor-pointer"
                  onClick={() => setEditSection("bio")}
                />
              )}
            </div>
            {editSection === "bio" ? (
              <div className="space-y-3">
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  className={`${inputCls} h-32 resize-none`}
                  autoFocus
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => setEditSection(null)}
                    className="px-6 py-1.5 text-sm bg-secondary text-white rounded-full"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed">
                {formData.bio ||
                  "Write something about your professional journey..."}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <FaBriefcase className="text-secondary" size={15} /> Skills
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {(formData.skills || []).length === 0 && (
                <p className="text-gray-400 text-sm italic">
                  No skills added yet.
                </p>
              )}
              {(formData.skills || []).map((skill, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-secondary rounded-full text-sm font-semibold border border-emerald-100 group"
                >
                  {skill}
                  <IoClose
                    size={13}
                    className="opacity-0 group-hover:opacity-100 cursor-pointer hover:text-red-500 transition-opacity"
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
                <IoAdd size={17} /> Add
              </button>
            </div>
          </div>

          {/* Education */}
          
<div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
      <FaGraduationCap className="text-secondary" size={15} /> Education
    </h3>
    <button
      onClick={addEducation} // addEducation now creates { title: "", documentUrl: "" }
      className="flex items-center gap-1 text-sm text-secondary hover:opacity-80 font-medium"
    >
      <IoAdd size={19} /> Add
    </button>
  </div>

  {(formData.education || []).length === 0 ? (
    <p className="text-gray-400 text-sm italic">
      No education added yet. Click + Add to get started.
    </p>
  ) : (
    <div className="space-y-4">
      {formData.education.map((edu, index) => (
        <div
          key={index}
          className="border border-gray-100 rounded-xl p-4 bg-gray-50"
        >
          {editEduId === index ? (
            <div className="space-y-3">
              <input
                type="text"
                className={inputCls}
                placeholder="Education Title (e.g. BS Computer Science - FAST)"
                value={edu.title}
                onChange={(e) => updateEducation(index, "title", e.target.value)}
              />

              <input
                type="file"
                onChange={(e) => handleEducationUpload(e, index)}
              />
              {edu.documentUrl && (
                <a
                  href={edu.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary text-sm"
                >
                  View Uploaded Document
                </a>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={() => removeEducation(index)}
                  className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                >
                  <IoTrash size={13} /> Remove
                </button>
                <button
                  onClick={() => setEditEduId(null)}
                  className="px-5 py-1.5 text-sm bg-secondary text-white rounded-full"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">
                {edu.title || "Untitled Education"}
              </span>
              <div className="flex gap-3">
                <IoPencil
                  size={15}
                  className="text-gray-400 hover:text-secondary cursor-pointer"
                  onClick={() => setEditEduId(index)}
                />
                <IoTrash
                  size={15}
                  className="text-gray-300 hover:text-red-400 cursor-pointer"
                  onClick={() => removeEducation(index)}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>
        {/* Certificates */}
<div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
      <FaAward className="text-secondary" size={15} /> Certificates
    </h3>
    <input
      type="file"
      multiple
      onChange={handleCertificateUpload}
      className="text-sm text-secondary cursor-pointer"
    />
  </div>

  {(formData.certificates || []).length === 0 ? (
    <p className="text-gray-400 text-sm italic">No certificates uploaded yet.</p>
  ) : (
    <div className="space-y-2">
      {formData.certificates.map((cert, index) => (
        <div key={index} className="flex justify-between items-center">
          <a
            href={cert}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary text-sm"
          >
            View Certificate
          </a>
          <IoTrash
            onClick={() => removeCertificate(index)}
            className="cursor-pointer text-red-400"
          />
        </div>
      ))}
    </div>
  )}
</div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-10 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Hire Status</h3>
            <div
              className={`p-4 rounded-xl border-2 transition-all ${formData.urgentHire === "yes" ? "border-secondary bg-emerald-50" : "border-gray-100 bg-gray-50"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${formData.urgentHire === "yes" ? "bg-secondary animate-pulse" : "bg-gray-400"}`}
                />
                <p className="text-sm font-bold text-gray-800">
                  {formData.urgentHire === "yes"
                    ? "Urgent Hire Enabled"
                    : "Standard Availability"}
                </p>
              </div>
              <p className="text-xs text-gray-500 leading-tight">
                {formData.urgentHire === "yes"
                  ? "You are appearing in urgent searches for customers."
                  : "Switch to urgent if you are ready to work right now."}
              </p>
              <button
                onClick={() =>
                  updateField({
                    urgentHire: formData.urgentHire === "yes" ? "no" : "yes",
                  })
                }
                className={`mt-3 w-full text-xs py-1.5 rounded-full font-medium transition-all ${
                  formData.urgentHire === "yes"
                    ? "bg-secondary text-white"
                    : "bg-white border border-secondary text-secondary"
                }`}
              >
                {formData.urgentHire === "yes"
                  ? "Disable Urgent"
                  : "Enable Urgent"}
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button className="w-full flex items-center justify-between text-sm font-medium text-gray-600 hover:text-secondary group">
                <span className="flex items-center gap-2">
                  <FaAward /> Certifications
                </span>
                <IoOpenOutline className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
