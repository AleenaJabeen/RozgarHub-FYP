// ViewProfile.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaAward } from "react-icons/fa";
import { IoOpenOutline } from "react-icons/io5";
import { capitalizeWords } from "../../utils/capitalize";
import {
  getProviderProfile,
  updateProviderProfile,
} from "../../store/serviceProvider/profile-slice";
import ProfileHeader from "../../components/serviceprovider/viewProfile/ProfileHeader";
import ExperienceSection from "../../components/serviceprovider/viewProfile/ExperienceSection";
import SkillsSection from "../../components/serviceprovider/viewProfile/SkillsSection";
import EducationSection from "../../components/serviceprovider/viewProfile/EducationSection";
const ViewProfile = () => {
  const dispatch = useDispatch();
  const isInitialLoad = useRef(true);
  const {
    profile = null,
    user = null,
    loading = false,
  } = useSelector((state) => state.serviceProviderProfile) || {};

  const [formData, setFormData] = useState({});
  const [editSection, setEditSection] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  const timerRef = useRef(null);
  const latestDataRef = useRef({});

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    dispatch(getProviderProfile()).unwrap().catch(console.error);
  }, [dispatch]);

  useEffect(() => {
    if (profile && user && isInitialLoad.current) {
      const initial = {
        bio: profile.bio || "",
        experienceDetails: profile.experienceDetails || "",
        skills: profile.skills || [],
        name: capitalizeWords(user.name) || "",
        city: capitalizeWords(user.location?.address?.city) || "",
        urgentHire: profile.urgentHire || "no",
        experienceDocuments: profile.experienceDocuments || [],
        certificates: profile.certificates || [],
        education: profile.education || "",
      };

      setFormData(initial);
      latestDataRef.current = initial;

      isInitialLoad.current = false; // ✅ prevent future overrides
    }
  }, [profile, user]);
  const scheduleSave = useCallback(
    (nextData) => {
      latestDataRef.current = nextData;

      if (timerRef.current) clearTimeout(timerRef.current);

      setSaving(true); // ✅ show saving

      timerRef.current = setTimeout(() => {
        const d = latestDataRef.current;
        const payload = new FormData();

        payload.append("bio", d.bio || "");
        payload.append("experienceDetails", d.experienceDetails || "");
        payload.append(
          "skills",
          Array.isArray(d.skills) ? d.skills.join(",") : "",
        );
        payload.append("name", d.name || "");
        payload.append("city", d.city || "");
        payload.append("urgentHire", d.urgentHire); 
        if (Array.isArray(d.experience)) {
          payload.append("experience", JSON.stringify(d.experience));
        }
        // Handle Certificates
        if (Array.isArray(d.certificates)) {
          d.certificates.forEach((cert) => {
            if (cert.file) {
              payload.append("certificates", cert.file);
            } else {
              payload.append("existingCertificates", cert);
            }
          });
        }
        payload.append("education", JSON.stringify(d.education || ""));
        if (d.avatar) {
          // If d.avatar is a Base64 string from FileReader
          payload.append("avatar", d.avatar);
        }
        dispatch(updateProviderProfile(payload)).finally(() =>
          setSaving(false),
        ); // ✅ stop saving
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

  if (loading || (!profile && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {saving && (
            <p className="text-xs text-gray-400 px-1">Saving changes...</p>
          )}
          <ProfileHeader
            user={user}
            formData={formData}
            editSection={editSection}
            setEditSection={setEditSection}
            updateField={updateField}
          />
          <SkillsSection
            formData={formData}
            editSection={editSection}
            setEditSection={setEditSection}
            updateField={updateField}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
          />

          <EducationSection formData={formData} updateField={updateField} />

          <ExperienceSection formData={formData} updateField={updateField} />
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-10 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Hire Status</h3>

            <div
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                formData.urgentHire === true
                  ? "border-emerald-500 bg-emerald-50 shadow-inner"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {/* Status Indicator Dot */}
                <div
                  className={`w-3 h-3 rounded-full transition-all ${
                    formData.urgentHire === true
                      ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      : "bg-gray-400"
                  }`}
                />
                <p
                  className={`text-sm font-bold ${
                    formData.urgentHire === true
                      ? "text-emerald-700"
                      : "text-gray-700"
                  }`}
                >
                  {formData.urgentHire === true
                    ? "Urgent Hire: ON"
                    : "Urgent Hire: OFF"}
                </p>
              </div>

              <p className="text-xs text-gray-500 leading-tight mb-4">
                {formData.urgentHire === true
                  ? "You are currently prioritized in urgent searches for immediate customers."
                  : "Switch to urgent if you are available to take jobs right now."}
              </p>

              <button
                onClick={() =>
                  updateField({
                    urgentHire: !formData.urgentHire, // Toggles between true/false
                  })
                }
                className={`w-full text-xs py-2 rounded-full font-bold uppercase tracking-wider transition-all transform active:scale-95 ${
                  formData.urgentHire === true
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-white border-2 border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-600"
                }`}
              >
                {formData.urgentHire === true
                  ? "Disable Urgent Mode"
                  : "Enable Urgent Mode"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
