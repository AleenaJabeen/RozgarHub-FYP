import {
  IoCamera,
  IoLocationOutline,
  IoMailOutline,
  IoCheckmark,
} from "react-icons/io5";
import { capitalizeWords } from "../../../utils/capitalize";
import { MdOutlineEdit } from "react-icons/md";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import { updateProviderProfile } from "../../../store/serviceProvider/profile-slice";
import { FaPhoneAlt } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";

const ProfileHeader = ({
  user,
  formData,
  editSection,
  setEditSection,
  updateField,
}) => {
  const handleInputChange = (e) =>
    updateField({ [e.target.name]: e.target.value });
  const fileInputRef = useRef(null);
  const dispatch=useDispatch();

  // 3. Handle image selection and conversion
 const handleImageChange = async(e) => {
  const file = e.target.files[0];

  if (file) {
    const previewUrl = URL.createObjectURL(file); // ✅ create preview

    updateField({
      avatar: file,        // ✅ for backend
      avatarPreview: previewUrl // ✅ for UI
    });
    const payload=new formData();
    payload.append({avatar:file});
    await dispatch(updateProviderProfile(payload));
  }
};
  // 4. Trigger the hidden input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      {/* Header Card */}
      <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Profile Image Section */}
          <div className="relative flex-shrink-0">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={triggerFileInput} // Click image to change
              className="w-32 h-32 rounded-full bg-secondary overflow-hidden border-4 border-white shadow-md cursor-pointer group relative"
            >
              <img
                src={
                  formData.avatarPreview ||
                  formData.avatar || user.avatar ||
                  "https://via.placeholder.com/150"
                }
                alt="Profile"
                className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
              />
              {/* Optional: Overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <IoCamera size={24} className="text-white" />
              </div>
            </div>

            <button
              onClick={triggerFileInput} // Click camera icon to change
              className="absolute bottom-1 right-1 bg-white p-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 text-secondary"
            >
              <IoCamera size={18} />
            </button>
          </div>
          <div className="flex-1 w-full text-center sm:text-left space-y-3">
            {/* Name */}
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {editSection === "name" ? (
                <div className="flex items-center gap-2 ">
                  <input
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="text-2xl font-bold  outline-none px-1 flex-1 bg-transparent"
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
                  <MdOutlineEdit
                    size={24}
                    className="text-gray-700 hover:text-secondary cursor-pointer"
                    onClick={() => setEditSection("name")}
                  />
                </>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500">
              <IoMailOutline size={18} />
              <span className="text-sm cursor-not-allowed select-none">
                {user.email}
              </span>
            </div>
            {/* Phone */}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500">
              <FiPhone  size={18} />
              <span className="text-sm cursor-not-allowed select-none">
                {user?.phone || "no phone"}
              </span>
            </div>
          </div>
        </div>
      </div>

    
    </>
  );
};

export default ProfileHeader;
