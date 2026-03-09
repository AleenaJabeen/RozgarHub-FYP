import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});


const uploadOnCloudinary = async (localFilePath, options = {}) => {  // ✅ add options param
  try {
    if (!localFilePath) return null;

    // ✅ Fix Windows backslash paths
    const normalizedPath = localFilePath.replace(/\\/g, "/");

    const response = await cloudinary.uploader.upload(normalizedPath, {
      resource_type: "auto",
      ...options,
    });

    console.log("Uploaded to Cloudinary:", response.url);

    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {
    console.error("=== CLOUDINARY ERROR ===", error.message); // ✅ see real error
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error.message);
    return null;
  }
};


export {uploadOnCloudinary,deleteFromCloudinary}