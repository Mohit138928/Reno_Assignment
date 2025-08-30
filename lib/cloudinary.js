import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image file to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} filename - Original filename
 * @returns {Promise<string>} - URL of the uploaded image
 */
export async function uploadImageToCloudinary(fileBuffer, filename) {
  try {
    // Convert buffer to base64
    const b64 = Buffer.from(fileBuffer).toString("base64");
    const dataURI = `data:image/jpeg;base64,${b64}`;

    // Upload to cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: "school-management/schools",
          public_id: `school_${Date.now()}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Determine if we should use Cloudinary or local storage
 * based on environment
 */
export function shouldUseCloudinary() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.USE_CLOUDINARY === "true"
  );
}
