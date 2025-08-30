import { executeQuery } from "../../lib/db";
import {
  uploadImageToCloudinary,
  shouldUseCloudinary,
} from "../../lib/cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "public/schoolImages");

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

// Middleware to handle the multer upload
const uploadMiddleware = (req, res) => {
  return new Promise((resolve, reject) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

// Validate form fields
const validateFields = (body) => {
  const errors = {};

  // Check required fields
  const requiredFields = [
    "name",
    "address",
    "city",
    "state",
    "contact",
    "email_id",
  ];
  for (const field of requiredFields) {
    if (!body[field]) {
      errors[field] = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } is required`;
    }
  }

  // Validate email format
  if (body.email_id && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email_id)) {
    errors.email_id = "Invalid email address";
  }

  // Validate contact number
  if (
    body.contact &&
    (!/^\d+$/.test(body.contact) || body.contact.length !== 10)
  ) {
    errors.contact = "Contact must be a 10-digit number";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    // Log environment for debugging
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Using Cloudinary:", shouldUseCloudinary());

    // Handle file upload
    try {
      await uploadMiddleware(req, res);
    } catch (uploadError) {
      console.error("File upload middleware error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error processing file upload",
        details: uploadError.message,
      });
    }

    // Log request body and file for debugging
    console.log("Request body:", req.body);
    console.log("File uploaded:", req.file ? "Yes" : "No");

    // Validate body fields
    const validationErrors = validateFields(req.body);

    if (validationErrors) {
      // Delete uploaded file if validation fails
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error(
            "Error removing file after validation failure:",
            unlinkError
          );
        }
      }
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    // Ensure file was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "School image is required" });
    }

    let imageUrl;

    // Use Cloudinary in production, local storage in development
    if (shouldUseCloudinary()) {
      try {
        console.log("Attempting to upload to Cloudinary...");
        // Upload to Cloudinary
        imageUrl = await uploadImageToCloudinary(
          fs.readFileSync(req.file.path),
          req.file.filename
        );

        console.log("Cloudinary upload successful, URL:", imageUrl);

        // Delete local file after successful upload
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error(
            "Error removing local file after Cloudinary upload:",
            unlinkError
          );
          // Continue execution despite this error
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to cloud storage",
          details: cloudinaryError.message,
        });
      }
    } else {
      // Use local path in development
      imageUrl = `/schoolImages/${req.file.filename}`;
      console.log("Using local file path:", imageUrl);
    }

    // Test database connection before inserting
    try {
      const connectionTest = await executeQuery("SELECT 1");
      console.log("Database connection test successful:", connectionTest);
    } catch (dbTestError) {
      console.error("Database connection test failed:", dbTestError);
      return res.status(500).json({
        success: false,
        message: "Database connection error",
        details: dbTestError.message,
      });
    }

    // Insert data into the database
    try {
      const result = await executeQuery(
        `INSERT INTO schools (name, address, city, state, contact, email_id, image) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.name,
          req.body.address,
          req.body.city,
          req.body.state,
          req.body.contact,
          req.body.email_id,
          imageUrl,
        ]
      );

      console.log("Database insert successful, ID:", result.insertId);

      return res.status(201).json({
        success: true,
        message: "School added successfully",
        schoolId: result.insertId,
      });
    } catch (dbInsertError) {
      console.error("Database insert error:", dbInsertError);
      return res.status(500).json({
        success: false,
        message: "Failed to insert school data",
        details: dbInsertError.message,
      });
    }
  } catch (error) {
    console.error("Error handling school submission:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add school",
      details: error.message,
    });
  }
}
