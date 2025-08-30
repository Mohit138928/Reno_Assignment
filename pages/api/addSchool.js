import { executeQuery } from "../../lib/db";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
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
    // Handle file upload
    await uploadMiddleware(req, res);

    // Validate body fields
    const validationErrors = validateFields(req.body);

    if (validationErrors) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    // Ensure file was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "School image is required" });
    }

    // Get relative path for the database
    const imageRelativePath = `/schoolImages/${req.file.filename}`;

    // Insert data into the database
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
        imageRelativePath,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "School added successfully",
      schoolId: result.insertId,
    });
  } catch (error) {
    console.error("Error handling school submission:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to add school" });
  }
}
