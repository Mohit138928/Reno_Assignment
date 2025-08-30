import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Creates a buffer from a readable stream
 * @param {Readable} readable - The readable stream
 * @returns {Promise<Buffer>} - A promise that resolves to a buffer
 */
async function streamToBuffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Upload an image file to Cloudinary from a buffer
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
 * Upload file directly from a multipart form without saving to disk
 * @param {Object} file - The file object from multer
 * @returns {Promise<string>} - URL of the uploaded image
 */
export async function uploadBufferToCloudinary(buffer, filename) {
  try {
    // Convert buffer to base64
    const b64 = buffer.toString("base64");
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
    throw new Error("Failed to upload image: " + error.message);
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
