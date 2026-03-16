import { useDispatch, useSelector } from "react-redux";
import {
  createGig,
  resetGigState,
} from "../../../store/serviceProvider/gig-slice";
import { getCategories } from "../../../store/serviceProvider/category-slice";
import { useEffect, useState } from "react";
import { IoCloudUploadOutline, IoTrashOutline } from "react-icons/io5";
import { showToast } from "../../../utils/toastHelper";

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  categoryId: "",
  subcategoryIds: [],
  hourlyRate: "",
  inspectionRate: "",
  images: [],
  availabilityHours: [{ days: [], startTime: "09:00", endTime: "18:00" }],
};

const CreateGig = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.gigs);
  const { categories } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, options } = e.target;

    if (name === "subcategoryIds") {
      const selected = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);

      if (selected.length > 3) {
        showToast("Maximum 2 subcategories allowed", "error");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        subcategoryIds: selected,
      }));

      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "categoryId" ? { subcategoryIds: [] } : {}),
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDayToggle = (slotIndex, day) => {
    const updatedHours = [...formData.availabilityHours];
    const currentDays = updatedHours[slotIndex].days;

    if (currentDays.includes(day)) {
      updatedHours[slotIndex].days = currentDays.filter((d) => d !== day);
    } else {
      updatedHours[slotIndex].days = [...currentDays, day];
    }

    setFormData((prev) => ({ ...prev, availabilityHours: updatedHours }));
    if (errors.days) setErrors((prev) => ({ ...prev, days: "" }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const totalImages = formData.images.length + files.length;

    if (totalImages > 3) {
      showToast("You can upload maximum 3 images per gig", "error");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateAvailability = (index, field, value) => {
    const updated = [...formData.availabilityHours];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, availabilityHours: updated }));
  };

  const toggleSubcategory = (name) => {
    setFormData((prev) => {
      const alreadySelected = prev.subcategoryIds.includes(name);

      if (alreadySelected) {
        return {
          ...prev,
          subcategoryIds: prev.subcategoryIds.filter((s) => s !== name),
        };
      }

      if (prev.subcategoryIds.length >= 3) {
        showToast("Maximum 3 subcategories allowed", "error");
        return prev;
      }

      return {
        ...prev,
        subcategoryIds: [...prev.subcategoryIds, name],
      };
    });
  };

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
    if (formData.availabilityHours[0].days.length === 0)
      newErrors.days = "Select at least one day.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const selectedCategory = categories.find(
    (c) => c._id === formData.categoryId,
  );

  useEffect(() => {
    if (success) {
      showToast("Gig created successfully!");
      setFormData(INITIAL_FORM_STATE);
      setErrors({});
      // Optionally reset form or redirect
      dispatch(resetGigState());
    }
    if (error) {
      showToast(error, "error");
      dispatch(resetGigState());
    }
  }, [success, error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("categoryId", formData.categoryId);
    data.append("subcategoryIds", JSON.stringify(formData.subcategoryIds));
    data.append("hourlyRate", formData.hourlyRate);
    data.append("inspectionRate", formData.inspectionRate);

    // Append images
    formData.images.forEach((file) => {
      data.append("images", file);
    });

    // Stringify complex objects for Multer/Express parsing
    data.append(
      "availabilityHours",
      JSON.stringify(formData.availabilityHours),
    );

    dispatch(createGig(data));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-secondary">Create New Gig</h2>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div className="md:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Gig Title
            </label>
            <input
              name="title"
              type="text"
              placeholder="e.g. Professional Ceiling Fan Repair"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 ${errors.title ? "border-red-500" : "border-gray-300"}`}
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description - Re-added here */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Describe your service in detail..."
              className={`w-full p-4 border rounded-xl h-32 focus:outline-none focus:ring-2 focus:ring-secondary/20 ${errors.description ? "border-red-500" : "border-gray-300"}`}
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Category & SubCategory */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Category
              </label>
              <select
                name="categoryId"
                className={`w-full px-4 py-2.5 border rounded-full bg-white focus:outline-none ${errors.categoryId ? "border-red-500" : "border-gray-300"}`}
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Subcategories (Max 3)
              </label>

              <div className="flex flex-wrap gap-2">
                {selectedCategory?.subcategory.map((sub, i) => {
                  const isSelected = formData.subcategoryIds.includes(sub.name);

                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => toggleSubcategory(sub.name)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition
          ${
            isSelected
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
          }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>

              <p className="ml-3 text-xs text-gray-500">
                {formData.subcategoryIds.length}/3 selected
              </p>
            </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Hiring Price (PKR/hr)
              </label>
              <input
                name="hourlyRate"
                type="number"
                placeholder="1500"
                className={`w-full px-4 py-2 border rounded-full focus:outline-none ${errors.hourlyRate ? "border-red-500" : "border-gray-300"}`}
                value={formData.hourlyRate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Inspection Price (PKR)
              </label>
              <input
                name="inspectionRate"
                type="number"
                placeholder="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                value={formData.inspectionRate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Availability */}
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

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white p-2">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Gig Images
            </label>
            <label
              className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors ${errors.images ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50"}`}
            >
              <IoCloudUploadOutline className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">Upload Gig Images</p>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
            {errors.images && (
              <p className="text-red-500 text-xs mt-1">{errors.images}</p>
            )}

            <div className="grid grid-cols-3 gap-2 mt-4">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-16 w-full rounded-lg overflow-hidden border"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg"
                  >
                    <IoTrashOutline size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-secondary text-white font-bold py-4 rounded-xl hover:bg-[#0e5641] transition-all shadow-lg disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Gig"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGig;
