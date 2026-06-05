// LocationSection.jsx
import { useState, useRef, useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import LocationPickerMap from "../profile/LocationPickerMap"; // Ensure your file path matches
import { FaAddressCard, FaRegAddressCard } from "react-icons/fa6";
import {
  MdHome,
  MdLocationCity,
  MdMap,
  MdPublic,
  MdLocalPostOffice,
} from "react-icons/md";

const baseInputCls =
  "w-full px-3 py-2 border rounded-full text-sm outline-none transition-all";

const LocationSection = ({ formData, updateField }) => {
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  const addr = formData.address || {};
  const currentLoc = formData.currentLocation || {};

  const [draft, setDraft] = useState({
    street: addr.street || "",
    city: addr.city || "",
    state: addr.state || "",
    country: addr.country || "",
    zipCode: addr.zipCode || "",
    latitude: currentLoc.latitude || null,
    longitude: currentLoc.longitude || null,
  });

  // Reset draft when formData updates from backend
  useEffect(() => {
    const a = formData.address || {};
    const c = formData.currentLocation || {};
    setDraft({
      street: a.street || "",
      city: a.city || "",
      state: a.state || "",
      country: a.country || "",
      zipCode: a.zipCode || "",
      latitude: c.latitude || null,
      longitude: c.longitude || null,
    });
  }, [formData.address, formData.currentLocation]);

  // Handle Outside Click to minimize section editing
  useEffect(() => {
    const handler = (e) => {
      if (editing && ref.current && !ref.current.contains(e.target)) {
        // Only close if user isn't clicking deep inside a leaflet map modal backdrop
        if (
          !e.target.closest(".leaflet-container") &&
          !e.target.closest("[style*='rgba(0, 0, 0, 0.55)']")
        ) {
          setEditing(false);
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [editing]);

  const handleSave = () => {
    updateField({
      address: {
        street: draft.street,
        city: draft.city,
        state: draft.state,
        country: draft.country,
        zipCode: draft.zipCode,
      },
      currentLocation: {
        latitude: draft.latitude,
        longitude: draft.longitude,
      },
    });
    setEditing(false);
  };

  const handleCancel = () => {
    const a = formData.address || {};
    const c = formData.currentLocation || {};
    setDraft({
      street: a.street || "",
      city: a.city || "",
      state: a.state || "",
      country: a.country || "",
      zipCode: a.zipCode || "",
      latitude: c.latitude || null,
      longitude: c.longitude || null,
    });
    setEditing(false);
  };

  // Maps your draft values to what your custom component expects as `value`
  const getMapValue = () => {
    if (draft.latitude != null && draft.longitude != null) {
      return {
        lat: draft.latitude,
        lng: draft.longitude,
        displayName: "", // Automatically managed inside MapModal
      };
    }
    return null;
  };

  // Handles updates coming back from your map's onChange callback
  const handleMapChange = (mapLocation) => {
    if (mapLocation) {
      setDraft((prev) => ({
        ...prev,
        latitude: mapLocation.lat,
        longitude: mapLocation.lng,
      }));
    }
  };

  // Dynamic style engine to apply readable design values based on edit active toggle status
  const getInputClassName = () => {
    return editing
      ? `${baseInputCls} border-gray-200 rounded-full bg-gray-50 text-gray-700 focus:ring-1 focus:ring-tertiary focus:border-tertiary`
      : `${baseInputCls} border-gray-100 bg-gray-50/40 text-gray-600 select-none cursor-not-allowed`;
  };

  return (
    <div
      ref={ref}
      className="border border-gray-300 rounded-2xl p-6 shadow-md mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100">
        <h3 className="md:text-2xl text-xl font-bold text-gray-800 flex items-center gap-3 mb-4">
          <FaAddressCard className="text-secondary" size={18} />
          Address
        </h3>
        {!editing && (
          <MdOutlineEdit
            size={24}
            className="cursor-pointer text-gray-600 hover:text-secondary cursor-pointer"
            onClick={() => setEditing("bio")}
          />
        )}
      </div>

      <div className="py-4">
        <div className="space-y-4">
          {/* Street Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <MdHome className="text-base text-gray-400" />
              Street address
            </label>
            <input
              type="text"
              disabled={!editing}
              readOnly={!editing}
              value={draft.street}
              onChange={(e) =>
                setDraft((p) => ({ ...p, street: e.target.value }))
              }
              placeholder={
                editing
                  ? "e.g. House 12, Street 4, Satellite Town"
                  : "Not Provided"
              }
              className={`${getInputClassName()} border-gray-300 focus:ring-tertiary`}
            />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 tracking-wide">
                <MdLocationCity className="text-sm text-gray-400" />
                City
              </label>
              <input
                type="text"
                disabled={!editing}
                readOnly={!editing}
                value={draft.city}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, city: e.target.value }))
                }
                placeholder={editing ? "e.g. Rawalpindi" : "Not Provided"}
                className={`${getInputClassName()}  border-gray-300 focus:ring-tertiary`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 tracking-wide">
                <MdMap className="text-sm text-gray-400" />
                State / Province
              </label>
              <input
                type="text"
                disabled={!editing}
                readOnly={!editing}
                value={draft.state}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, state: e.target.value }))
                }
                placeholder={editing ? "e.g. Punjab" : "Not Provided"}
                className={`${getInputClassName()}  border-gray-300 focus:ring-tertiary`}
              />
            </div>
          </div>

          {/* Country + Zip */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 tracking-wide">
                <MdPublic className="text-sm text-gray-400" />
                Country
              </label>
              <input
                type="text"
                disabled={!editing}
                readOnly={!editing}
                value={draft.country}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, country: e.target.value }))
                }
                placeholder={editing ? "e.g. Pakistan" : "Not Provided"}
                className={`${getInputClassName()} border-gray-300 focus:ring-tertiary`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 tracking-wide">
                <MdLocalPostOffice className="text-sm text-gray-400" />
                Zip code
              </label>
              <input
                type="text"
                disabled={!editing}
                readOnly={!editing}
                value={draft.zipCode}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, zipCode: e.target.value }))
                }
                placeholder={editing ? "e.g. 46000" : "Not Provided"}
                className={`${getInputClassName()} border-gray-300 focus:ring-tertiary`}
              />
            </div>
          </div>

          {/* Map Picker Module */}

          <div
            className={`mt-4 pb-2 transition-all duration-200 ${
              !editing ? "pointer-events-none opacity-60 select-none" : ""
            }`}
          >
            {" "}
            <LocationPickerMap
              value={getMapValue()}
              onChange={handleMapChange}
              error={null}
            />
          </div>

          {/* Saved Pinpoint Verification Badge */}
          {!editing && draft.latitude && draft.longitude && (
            <p className="text-xs text-emerald-600 font-medium pt-1 flex items-center gap-1.5 select-none animate-[fadeIn_0.2s_ease-out]">
              <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
              Live coordinate pinpoint verification set (
              {draft.latitude.toFixed(4)}, {draft.longitude.toFixed(4)})
            </p>
          )}

          {/* Action Row */}
          {editing && (
            <div className="flex justify-end gap-2 pt-2 animate-[fadeIn_0.15s_ease-out]">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-1.5 text-sm border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-1.5 text-sm bg-secondary text-white rounded-full hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSection;
