import { executeQuery } from "./db";

/**
 * Create tables needed for authentication
 */
export async function initializeAuthTables() {
  try {
    // Create users table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100),
        is_admin BOOLEAN DEFAULT FALSE,
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create OTP table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (email, code),
        INDEX (expires_at)
      )
    `);

    console.log("Authentication tables initialized successfully");
  } catch (error) {
    console.error("Failed to initialize authentication tables:", error);
    throw error;
  }
}

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
export function generateOTP() {
  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

/**
 * Save an OTP code for a user
 * @param {string} email - User's email
 * @param {string} code - Generated OTP code
 */
export async function saveOTP(email, code) {
  try {
    // Calculate expiry time (10 minutes from now)
    const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 10;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiryMinutes));

    // Delete any existing OTP for this email
    await executeQuery("DELETE FROM otp_codes WHERE email = ?", [email]);

    // Insert new OTP
    await executeQuery(
      "INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)",
      [email, code, expiresAt]
    );

    return true;
  } catch (error) {
    console.error("Error saving OTP:", error);
    throw error;
  }
}

/**
 * Verify an OTP code for a user
 * @param {string} email - User's email
 * @param {string} code - OTP code to verify
 * @returns {boolean} - Whether the OTP is valid
 */
export async function verifyOTP(email, code) {
  try {
    // Find OTP that matches email, code, and hasn't expired
    const now = new Date();
    const results = await executeQuery(
      "SELECT * FROM otp_codes WHERE email = ? AND code = ? AND expires_at > ?",
      [email, code, now]
    );

    if (results.length > 0) {
      // Delete the used OTP
      await executeQuery("DELETE FROM otp_codes WHERE id = ?", [results[0].id]);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return false;
  }
}

/**
 * Create or update a user after successful OTP verification
 * @param {string} email - User's email
 * @param {string} name - User's name (optional)
 * @returns {Object} - User object
 */
export async function createOrUpdateUser(email, name = null) {
  try {
    // Check if user exists
    const existingUsers = await executeQuery(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      // Update existing user's last login
      const now = new Date();
      await executeQuery("UPDATE users SET last_login = ? WHERE id = ?", [
        now,
        existingUsers[0].id,
      ]);

      return existingUsers[0];
    } else {
      // Create new user
      const result = await executeQuery(
        "INSERT INTO users (email, name) VALUES (?, ?)",
        [email, name || email.split("@")[0]] // Use part of email as name if not provided
      );

      return {
        id: result.insertId,
        email,
        name: name || email.split("@")[0],
        is_admin: false,
      };
    }
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw error;
  }
}

// Initialize auth tables
initializeAuthTables();
