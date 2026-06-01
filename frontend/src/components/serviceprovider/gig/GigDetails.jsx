import React, { useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiChevronRight,
} from "react-icons/hi";
import {
  MdOutlineWifiTethering,
  MdOutlineAccountBalanceWallet,
  MdOutlineModeEdit,
} from "react-icons/md";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import {
  IoPersonCircle,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoTrashOutline,
  IoCloudUploadOutline,
} from "react-icons/io5";
import { TbCalendarTime } from "react-icons/tb";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCategories } from "../../../store/serviceProvider/category-slice";
import {
  deleteGigThunk,
  getGigById,
  setGigAvailableThunk,
  setGigUnavailableThunk,
  enableAutoModeThunk,
  updateGigThunk,
} from "../../../store/serviceProvider/gig-slice";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      if (rating >= star)
        return <FaStar key={star} className="text-amber-400 text-sm" />;
      if (rating >= star - 0.5)
        return <FaStarHalfAlt key={star} className="text-amber-400 text-sm" />;
      return <FaRegStar key={star} className="text-gray-300 text-sm" />;
    })}
  </div>
);

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleEdit = (id, data) => {
    dispatch(updateGigThunk({ id, data }));
  };

  const handleDelete = (id) => {
    dispatch(deleteGigThunk(id)).then(() => {
      navigate("/serviceprovider/gigs");
    });
  };

  const handleToggleStatus = (gig) => {
    if (gig.availabilityStatus === "available") {
      dispatch(setGigUnavailableThunk(gig._id));
    } else {
      dispatch(setGigAvailableThunk(gig._id));
    }
  };

  const handleToggleAuto = (id) => {
    dispatch(enableAutoModeThunk(id));
  };


  const { gigs } = useSelector((state) => state.gigs);
  const { categories } = useSelector((state) => state.categories);
  const [isEditing, setIsEditing] = useState(location.state?.editMode || false);
  const [errors, setErrors] = useState({});
  const [activeImage, setActiveImage] = useState(0);

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

  if (!gig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
      </div>
    );
  }
  const selectedCategory = categories.find(
    (c) => c._id === String(formData.categoryId),
  );
  const isAvailable = gig.availabilityStatus === "available";
  const images = isEditing ? [...formData.images, ...formData.newImages.map(img => ({ url: URL.createObjectURL(img), isNew: true }))] : (gig.images || []);

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

  const handleCancel = () => {
      // restore original gig data
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

      setErrors({});
      setIsEditing(false);
  };
  const sortedHours = [...(gig.availabilityHours || [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.days?.[0]) - DAY_ORDER.indexOf(b.days?.[0])
  );

  return (
    <div className="min-h-screen bg-gray-50 transition-opacity duration-300">
      {/* ── Breadcrumb Header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200 shadow-sm hover:shadow active:scale-95"
          >
            <HiArrowLeft className="text-gray-600 text-lg" />
          </button>
          <div>
            <p className="text-xs text-gray-400">
              My Gigs &rsaquo;{" "}
              <span className="text-gray-600 font-semibold">{formData.title || gig.title}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ════════════════════════════════════
              LEFT COLUMN — Gallery + Forms/Details
          ════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery & Upload */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm p-4 space-y-4">
              <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden">
                {images[activeImage]?.url ? (
                  <img
                    src={images[activeImage].url}
                    alt={gig.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MdOutlineAccountBalanceWallet className="text-gray-200 text-6xl" />
                  </div>
                )}
                <div
                  className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${isAvailable ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" : "bg-white/90 text-gray-500 border-gray-200 shadow-sm backdrop-blur-sm"}`}
                >
                  <MdOutlineWifiTethering className={`text-sm ${isAvailable ? "animate-pulse" : ""}`} />
                  {isAvailable ? "Available" : "Unavailable"}
                </div>
              </div>

              {/* Thumbnails list / Edit actions */}
              <div className="flex flex-wrap gap-3 items-center">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <button
                      onClick={() => setActiveImage(i)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-secondary shadow-md scale-105" : "border-transparent opacity-70"}`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                    {isEditing && (
                      <button
                        onClick={() => img.isNew ? removeNewImage(i - formData.images.length) : removeOldImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                      >
                        <IoTrashOutline size={12} />
                      </button>
                    )}
                  </div>
                ))}

                {isEditing && (images.length < 3) && (
                  <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all">
                    <IoCloudUploadOutline size={20} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 font-bold mt-1">Add</span>
                    <input type="file" hidden Glory multiple onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
            </div>

            {/* Main Details Card / Form Area */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Category display */}
              <div>
                <span className="inline-block text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 px-3 py-1 rounded-full mb-2 uppercase tracking-wider">
                  {gig.categoryId?.name || "Service Category"}
                </span>
              </div>

              {/* GIG TITLE */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gig Title</label>
                {isEditing ? (
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary rounded-xl text-gray-900 font-medium"
                    placeholder="Enter short illustrative title"
                  />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                    {gig.title}
                  </h1>
                )}
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* DESCRIPTION */}
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About This Service</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary rounded-xl h-36 text-sm text-gray-700"
                    placeholder="Describe your service in detail..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {gig.description || <span className="italic text-gray-300">No description provided.</span>}
                  </p>
                )}
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* SUBCATEGORIES MANAGEMENT */}
              {selectedCategory?.subcategory && (
                <div className="border-t border-gray-100 pt-6 space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Subcategories {isEditing && "(Max 3)"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.subcategory.map((sub, i) => {
                      const isSelected = formData.subcategoryIds.includes(sub.name);
                      if (!isEditing && !isSelected) return null;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleSubcategory(sub.name)}
                          disabled={!isEditing}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                            isSelected
                              ? "bg-secondary text-white border-secondary shadow-sm"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Availability Schedule */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <TbCalendarTime className="text-secondary text-xl" />
                <h2 className="text-base font-bold text-gray-800">Availability Schedule</h2>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  {formData.availabilityHours.map((slot, index) => (
                    <div key={index} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        {daysOfWeek.map((day) => {
                          const isChecked = slot.days.includes(day);
                          return (
                            <label
                              key={day}
                              className={`px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-secondary text-white border-secondary"
                                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={isChecked}
                                onChange={() => handleDayToggle(index, day)}
                              />
                              {day.substring(0, 3)}
                            </label>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Start Time</p>
                          <input
                            type="time"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            value={slot.startTime}
                            onChange={(e) => updateAvailability(index, "startTime", e.target.value)}
                          />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">End Time</p>
                          <input
                            type="time"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            value={slot.endTime}
                            onChange={(e) => updateAvailability(index, "endTime", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {errors.days && <p className="text-red-500 text-xs">{errors.days}</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sortedHours.length > 0 ? (
                    sortedHours.map((slot, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                        <IoCheckmarkCircle className="text-secondary text-lg flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-700">{slot.days?.join(", ")}</p>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <IoTimeOutline className="text-secondary" /> {slot.startTime} – {slot.endTime}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No schedule set.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════
              RIGHT COLUMN — Sticky Pricing & Provider Actions
          ════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-32 space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Gig Configuration</h3>
                <p className="text-xs text-gray-500 mt-1">Manage your service rules and baseline workflow pricing.</p>
              </div>

              {/* PRICING INPUTS / STATS */}
              <div className="space-y-4">
                {/* Hourly Pricing Card */}
                <div className="p-4 border border-gray-100 bg-gray-50/50 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-bold text-gray-700">Hourly Rate</span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Base Standard Rate</span>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-1 max-w-[120px]">
                      <span className="text-xs font-bold text-gray-400">PKR</span>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-200 rounded-xl text-right font-extrabold text-sm"
                      />
                    </div>
                  ) : (
                    <span className="text-lg font-extrabold text-secondary">
                      <span className="text-xs font-medium mr-0.5 text-gray-400">Rs</span>
                      {gig.hourlyRate ?? "—"}
                    </span>
                  )}
                </div>
                {errors.hourlyRate && <p className="text-red-500 text-xs">{errors.hourlyRate}</p>}

                {/* Inspection Pricing Card */}
                <div className="p-4 border border-gray-100 bg-gray-50/50 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-bold text-gray-700">Inspection Fee</span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Pre-work Diagnostics</span>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-1 max-w-[120px]">
                      <span className="text-xs font-bold text-gray-400">PKR</span>
                      <input
                        type="number"
                        name="inspectionRate"
                        value={formData.inspectionRate}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-200 rounded-xl text-right font-extrabold text-sm"
                      />
                    </div>
                  ) : (
                    <span className="text-lg font-extrabold text-purple-700">
                      <span className="text-xs font-medium mr-0.5 text-gray-400">Rs</span>
                      {gig.inspectionRate || 0}
                    </span>
                  )}
                </div>
              </div>

              {/* LIVE OPERATION TOGGLES */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                {/* Status Switch Toggle */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">Gig Availability</span>
                    <span className="text-[10px] text-gray-400">Toggle public visibility</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={gig.availabilityStatus === "available"}
                      onChange={() => handleToggleStatus(gig)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Auto-Mode Switch Toggle */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">Auto Mode</span>
                    <span className="text-[10px] text-gray-400">Automate calendar routing</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={gig.statusMode === "auto"}
                      onChange={() => handleToggleAuto(gig._id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>

              {/* ACTION CALL-TO-ACTIONS */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full py-3.5 bg-secondary text-white text-sm font-extrabold rounded-xl hover:bg-[#0e5641] shadow-md transition-all duration-150 flex items-center justify-center gap-2"
                    >
                      <MdOutlineModeEdit className="text-lg" />
                      Edit Details
                    </button>

                    <button
                      onClick={() => handleDelete(gig._id)}
                      className="w-full py-3 bg-white text-red-600 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-50 transition-all duration-150 flex items-center justify-center gap-2"
                    >
                      <IoTrashOutline className="text-base" />
                      Delete Service
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleSubmit}
                      className="py-3 bg-secondary text-white text-xs font-extrabold rounded-xl hover:bg-[#0e5641] transition-all shadow-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="py-3 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetails;
