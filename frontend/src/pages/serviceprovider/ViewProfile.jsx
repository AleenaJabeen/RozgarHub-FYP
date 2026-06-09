// ViewProfile.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import { showToast } from "../../utils/toastHelper";
import LocationSection from "../../components/serviceprovider/viewProfile/LocationSection";
import RozgarHubLoader from "../../components/layout/Loader";
import { checkAuth } from "../../store/auth-slice";

const ViewProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const originalDataRef = useRef({});

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    dispatch(getProviderProfile())
      .unwrap()
      .catch((err) => {
        if (err.toLowerCase().includes("not found") || err.includes("404")) {
          navigate("/serviceprovider/profile");
        } else {
          console.error(err);
        }
      });
  }, [dispatch, navigate]);

  useEffect(() => {
    if (profile && user) {
      if (!isInitialLoad.current) return;
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
        phone: user.phone || "",
        address: {
          street: user.location?.address?.street || "",
          city: user.location?.address?.city || "",
          state: user.location?.address?.state || "",
          country: user.location?.address?.country || "",
          zipCode: user.location?.address?.zipCode || "",
        },
        currentLocation: {
          latitude: user.location?.currentLocation?.coordinates?.[1] || null,
          longitude: user.location?.currentLocation?.coordinates?.[0] || null,
        },
      };

      setFormData(initial);
      latestDataRef.current = initial;
      originalDataRef.current = initial;

      isInitialLoad.current = false;
    }
  }, [profile, user]);

  const scheduleSave = useCallback(
    (nextData) => {
      latestDataRef.current = nextData;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const current = latestDataRef.current;
        const original = originalDataRef.current;

        const payload = new FormData();
        let hasChanges = false;

        Object.keys(current).forEach((key) => {
          const currentValue = current[key];
          const originalValue = original[key];

          const isEqual = Array.isArray(currentValue)
            ? JSON.stringify(currentValue) === JSON.stringify(originalValue)
            : currentValue === originalValue;

          if (!isEqual) {
            hasChanges = true;

            if (key === "skills") {
              payload.append("skills", currentValue.join(","));
            } else if (key === "education") {
              payload.append("education", currentValue);
            } else if (key === "longitude" || key === "latitude") {
              // ✅ FIX: Just append the coordinate key safely. Do not overwrite 'education'.
              if (currentValue !== null && currentValue !== undefined) {
                payload.append(key, currentValue);
              }
            } else if (key === "experienceDocuments") {
              currentValue.forEach((doc, index) => {
                if (doc.title) payload.append(`expTitle_${index}`, doc.title);
                if (doc.file) {
                  payload.append(`expFile_${index}`, doc.file);
                } else if (doc.documentUrl) {
                  payload.append(`expUrl_${index}`, doc.documentUrl);
                }
              });
              payload.append("expCount", currentValue.length);
            } else if (key === "certificates") {
              // ✅ Your original logic — just add existing URLs too
              currentValue.forEach((cert, index) => {
                if (cert.file) {
                  payload.append("certificates", cert.file); // new upload
                } else if (typeof cert === "string") {
                  payload.append("existingCerts", cert); // existing Cloudinary URL
                }
              });
            } else if (key === "avatar" && currentValue instanceof File) {
              payload.append("avatar", currentValue);
            } else if (key === "currentLocation") {
              if (currentValue?.latitude && currentValue?.longitude) {
                payload.append("latitude", currentValue.latitude);
                payload.append("longitude", currentValue.longitude);
              }
            } else if (key === "address") {
              Object.entries(currentValue).forEach(([subKey, subVal]) => {
                payload.append(subKey, subVal);
              });
            } else {
              payload.append(key, currentValue);
            }
          }
        });

        if (!hasChanges) return;

        setSaving(true);

        dispatch(updateProviderProfile(payload))
          .unwrap()
          .then(() => { 
            dispatch(getProviderProfile());
            dispatch(checkAuth());
            
          })
          .catch((err) => {
            // It's good practice to log or surface why backend rejected it here
            console.error("Auto-save failed:", err);
            showToast(err || "Failed to sync background updates.", "error");
          })
          .finally(() => setSaving(false));
      }, 3000);
    },
    [dispatch],
  );

  const updateField = (updates) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };

      const isSame =
        JSON.stringify(prev, (key, val) =>
          val instanceof File ? val.name + val.size : val,
        ) ===
        JSON.stringify(next, (key, val) =>
          val instanceof File ? val.name + val.size : val,
        );
      if (!isSame) {
        scheduleSave(next);
      }

      return next;
    });
  };

  // ✅ Location fetching logic when activating Urgent Mode
  const handleUrgentToggle = () => {
    if (!formData.urgentHire) {
      if (!navigator.geolocation) {
        showToast("Geolocation is not supported by your browser.", "error");
        return;
      }

      // showToast("Fetching location to activate Urgent Mode...");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateField({
            urgentHire: true,
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          });
          showToast(
            "Urgent Mode Activated! You are now visible to nearby customers.",
            "success",
          );
        },
        (err) => {
          console.error("Location error:", err);
          showToast(
            "Please allow location access to enable Urgent Mode.",
            "error",
          );
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      updateField({ urgentHire: false });
    }
  };

  // 1. Show loading state if it's the very first load
  if (loading && isInitialLoad.current) {
    return <RozgarHubLoader />;
  }

  // 2. Show empty state if there is no profile
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-300 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Profile Found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            You need to create a profile before you can start offering services
            and making gigs.
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

  // 3. Render the main page if the profile exists
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
          <LocationSection formData={formData} updateField={updateField} />

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
                onClick={handleUrgentToggle}
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
