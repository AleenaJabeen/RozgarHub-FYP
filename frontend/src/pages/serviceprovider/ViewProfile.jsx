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
import { useNavigate } from "react-router-dom";
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
  const navigate=useNavigate();

  const timerRef = useRef(null);
  const latestDataRef = useRef({});
  const originalDataRef = useRef({});

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
      urgentHire: profile.urgentHire ?? false,
      experienceDocuments: profile.experienceDocuments || [],
      certificates: profile.certificates || [],
      education: profile.education || "",
    };

    setFormData(initial);
    latestDataRef.current = initial;
    originalDataRef.current = initial; // ✅ store original

    isInitialLoad.current = false;
  }
}, [profile, user]);
 const scheduleSave = useCallback((nextData) => {
  latestDataRef.current = nextData;

  if (timerRef.current) clearTimeout(timerRef.current);

  timerRef.current = setTimeout(() => {
    const current = latestDataRef.current;
    const original = originalDataRef.current;

    const payload = new FormData();
    let hasChanges = false;

    // 🔥 Compare fields
    Object.keys(current).forEach((key) => {
      const currentValue = current[key];
      const originalValue = original[key];

      // Handle arrays
      const isEqual =
        Array.isArray(currentValue)
          ? JSON.stringify(currentValue) === JSON.stringify(originalValue)
          : currentValue === originalValue;

      if (!isEqual) {
        hasChanges = true;

        if (key === "skills") {
          payload.append("skills", currentValue.join(","));
        } else if (key === "education") {
          payload.append("education",currentValue);
        } else if (key === "certificates") {
          currentValue.forEach((cert) => {
            if (cert.file) {
              payload.append("certificates", cert.file);
            }
          });
        } else if (key === "avatar" && currentValue instanceof File) {
          payload.append("avatar", currentValue);
        } else {
          payload.append(key, currentValue);
        }
      }
    });

    // 🚫 No changes → NO API CALL
    if (!hasChanges) return;

    setSaving(true);

    dispatch(updateProviderProfile(payload))
      .unwrap()
      .then(() => {
        originalDataRef.current = { ...current }; // ✅ update baseline
      })
      .finally(() => setSaving(false));
  }, 2000); // ⏱ better UX than 6s
}, [dispatch]);

 const updateField = (updates) => {
  setFormData((prev) => {
    const next = { ...prev, ...updates };

    // 🚫 prevent unnecessary scheduling
    const isSame = JSON.stringify(prev) === JSON.stringify(next);
    if (!isSame) {
      scheduleSave(next);
    }

    return next;
  });
};

if (loading && isInitialLoad.current) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          {/* Simple Tailwind Spinner */}
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }
 if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-300 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Profile Found
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            You need to create a profile before you can start offering services and making gigs.
          </p>

          <button
            onClick={() => navigate("/serviceprovider/createProfile")}
            className="cursor-pointer bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-all"
          >
            Create Your Profile
          </button>
        </div>
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
