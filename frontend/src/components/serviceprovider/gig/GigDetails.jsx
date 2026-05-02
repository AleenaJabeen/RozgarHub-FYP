import React, { useEffect, useState } from "react";
import { IoTrashOutline, IoCloudUploadOutline } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCategories } from "../../../store/serviceProvider/category-slice";
import {
  deleteGigThunk,
  getGigById,
  setGigOnlineThunk,
  setGigOfflineThunk,
  enableAutoModeThunk,
  updateGigThunk,
} from "../../../store/serviceProvider/gig-slice";

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleEdit = (id, data) => {
    dispatch(updateGigThunk({ id, data }));
  };

  const handleDelete = (id) => {
    dispatch(deleteGigThunk(id)).then(() => {
      navigate("/serviceprovider/gigs");
    });
  };

  const handleToggleStatus = (gig) => {
    if (gig.availabilityStatus === "online") {
      dispatch(setGigOfflineThunk(gig._id));
    } else {
      dispatch(setGigOnlineThunk(gig._id));
    }
  };

  const handleToggleAuto = (id) => {
    dispatch(enableAutoModeThunk(id));
  };

  const dispatch = useDispatch();

  const { gigs } = useSelector((state) => state.gigs);
  const { categories } = useSelector((state) => state.categories);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  const gig = gigs.find((g) => g._id === id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    subcategoryIds: [],
    hourlyRate: "",
    inspectionRate: "",
    availabilityHours: [],
    images: [],
    newImages: [],
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  useEffect(() => {
  if (!gig) {
    dispatch(getGigById(id));
  }
}, [dispatch, id, gig]);
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    if (gig) {
      setFormData({
        title: gig.title,
        description: gig.description,
        categoryId: gig.categoryId?._id,
        subcategoryIds: gig.subcategories || [],
        hourlyRate: gig.hourlyRate,
        inspectionRate: gig.inspectionRate,
        availabilityHours:
          gig.availabilityHours?.length > 0
            ? gig.availabilityHours
            : [
                {
                  days: [],
                  startTime: "",
                  endTime: "",
                },
              ],
        images: gig.images || [],
        newImages: [],
      });
    }
  }, [gig]);

  if (!gig) return null;

  const selectedCategory = categories.find(
    (c) => c._id === String(formData.categoryId),
  );

  // ================= HANDLERS =================

  const handleChange = (e) => {
    if (!isEditing) return;
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "categoryId" ? { subcategoryIds: [] } : {}),
    }));
  };

  const updateAvailability = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.availabilityHours.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot,
      );

      return { ...prev, availabilityHours: updated };
    });
  };

  const handleDayToggle = (slotIndex, day) => {
    setFormData((prev) => {
      const updated = prev.availabilityHours.map((slot, i) => {
        if (i !== slotIndex) return slot;

        const exists = slot.days.includes(day);

        return {
          ...slot,
          days: exists
            ? slot.days.filter((d) => d !== day)
            : [...slot.days, day],
        };
      });

      return { ...prev, availabilityHours: updated };
    });
  };

  const toggleSubcategory = (name) => {
    if (!isEditing) return;

    setFormData((prev) => {
      const exists = prev.subcategoryIds.includes(name);

      if (exists) {
        return {
          ...prev,
          subcategoryIds: prev.subcategoryIds.filter((s) => s !== name),
        };
      }

      if (prev.subcategoryIds.length >= 3) return prev;

      return {
        ...prev,
        subcategoryIds: [...prev.subcategoryIds, name],
      };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!isEditing) return;

    if (formData.images.length + formData.newImages.length + files.length > 3)
      return;

    setFormData((prev) => ({
      ...prev,
      newImages: [...prev.newImages, ...files],
    }));
  };

  const removeOldImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeNewImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  };

  // ================= VALIDATION =================

  const validate = () => {
    let newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.categoryId) newErrors.categoryId = "Category is required.";
    if (!formData.hourlyRate || formData.hourlyRate <= 0)
      newErrors.hourlyRate = "Rate is required.";
    if (formData.images.length === 0)
      newErrors.images = "Upload at least one image.";
    if (
      !formData.availabilityHours.length ||
      formData.availabilityHours.every((slot) => slot.days.length === 0)
    ) {
      newErrors.days = "Select at least one day.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SUBMIT =================

  const handleSubmit = () => {
    if (!validate()) return;

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("subcategoryIds", JSON.stringify(formData.subcategoryIds));
    data.append("hourlyRate", formData.hourlyRate);
    data.append("inspectionRate", formData.inspectionRate);
    data.append(
      "availabilityHours",
      JSON.stringify(formData.availabilityHours),
    );
    data.append("existingImages", JSON.stringify(formData.images));

    formData.newImages.forEach((img) => {
      data.append("images", img);
    });

    // 🔥 OPTIMISTIC UPDATE
    handleEdit(gig._id, data);

    setIsEditing(false);
  };



  return (
    <div className="flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white w-[95%] max-w-6xl rounded-2xl p-6 relative">
        <h2 className="text-2xl font-bold text-secondary mb-2">
          {isEditing ? "Edit Gig" : "Gig Details"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="md:col-span-2 space-y-3">
            {/* TITLE */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Gig Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border rounded-xl"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-4 border rounded-xl h-20"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Category
              </label>
              <input
                value={selectedCategory?.name || ""}
                disabled
                className="w-full px-4 py-2 border rounded-full bg-gray-100"
              />
            </div>
            {/* SUBCATEGORIES */}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Subcategories (Max 3)
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedCategory?.subcategory.map((sub, i) => {
                  const selected = formData.subcategoryIds.includes(sub.name);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleSubcategory(sub.name)}
                      className={`px-3 py-1 rounded-full border ${
                        selected ? "bg-secondary text-white" : "bg-gray-100"
                      }`}
                      disabled={!isEditing}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRICING */}
            <div className="sm:grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Hiring Price (PKR/hr)
                </label>
                <input
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="px-4 py-2 border rounded-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Inspection Price (PKR)
                </label>
                <input
                  name="inspectionRate"
                  value={formData.inspectionRate}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="px-4 py-2 border rounded-full"
                />
              </div>
            </div>

            
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Available Days & Hours
              </label>
              {formData.availabilityHours.map((slot, index) => (
                <div
                  key={index}
                  className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4"
                >
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <label
                        key={day}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                          slot.days.includes(day)
                            ? "bg-secondary text-white border-secondary"
                            : "bg-white text-gray-600 border-gray-300 hover:border-secondary"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={slot.days.includes(day)}
                          disabled={!isEditing}
                          onChange={() => handleDayToggle(index, day)}
                        />
                        {day.substring(0, 3)}
                      </label>
                    ))}
                  </div>
                  {errors.days && (
                    <p className="text-red-500 text-[10px]">{errors.days}</p>
                  )}

                  <div className="sm:flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                        Start Time
                      </p>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={slot.startTime}
                        disabled={!isEditing}
                        onChange={(e) =>
                          updateAvailability(index, "startTime", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                        End Time
                      </p>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={slot.endTime}
                        disabled={!isEditing}
                        onChange={(e) =>
                          updateAvailability(index, "endTime", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* TOGGLES */}

            <div className="flex gap-6">
              {/* STATUS */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span>Status</span>
                <input
                  type="checkbox"
                  checked={gig.availabilityStatus === "online"}
                  onChange={() => handleToggleStatus(gig)}
                />
                <span>Available</span>
              </label>

              {/* MODE */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span>Auto Mode</span>
                <input
                  type="checkbox"
                  checked={gig.statusMode === "auto"}
                  onChange={() => handleToggleAuto(gig._id)}
                />
              </label>
            </div>
            {/* IMAGES */}

            <label className="flex flex-col items-center justify-center border-2 border-dashed h-40 rounded-xl cursor-pointer">
              <IoCloudUploadOutline size={30} />
              <input
                type="file"
                hidden
                multiple
                onChange={handleImageUpload}
                disabled={!isEditing}
              />
            </label>

            <div className="grid grid-cols-3 gap-2">
              {formData.images.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={img.url}
                    className="h-20 w-full object-cover rounded"
                  />
                  {isEditing && (
                    <button
                      onClick={() => removeOldImage(i)}
                      className="absolute top-0 right-0 bg-red-500 text-white"
                    >
                      <IoTrashOutline size={12} />
                    </button>
                  )}
                </div>
              ))}

              {formData.newImages.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    className="h-20 w-full object-cover rounded"
                  />
                  <button
                    onClick={() => removeNewImage(i)}
                    className="absolute top-0 right-0 bg-red-500 text-white"
                  >
                    <IoTrashOutline size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-secondary text-white py-3 rounded-xl"
              >
                Edit Gig
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="w-full bg-secondary text-white py-3 rounded-xl"
              >
                Save Changes
              </button>
            )}

            <button
              onClick={() => handleDelete(gig._id)}
              className="w-full bg-red-500 text-white py-3 rounded-xl"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
 
    </div>
  );
};

export default GigDetails;
