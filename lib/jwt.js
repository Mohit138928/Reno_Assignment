import jwt from "jsonwebtoken";
import { serialize } from "cookie";

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.is_admin || false,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // Token valid for 7 days
  );
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

/**
 * Create an authentication cookie with JWT token
 * @param {string} token - JWT token
 * @returns {string} - Serialized cookie string
 */
export function createAuthCookie(token) {
  return serialize("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  });
}

/**
 * Create a cookie to clear the auth token (for logout)
 * @returns {string} - Serialized cookie string to clear auth
 */
export function clearAuthCookie() {
  return serialize("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1,
    path: "/",
  });
}

/**
 * Extract user from request cookie
 * @param {Object} req - Next.js API request
 * @returns {Object|null} - User object or null if not authenticated
 */
export function getUserFromRequest(req) {
  try {
    // Get token from cookie
    const token = req.cookies?.auth_token;
    if (!token) return null;

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) return null;

    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      isAdmin: decoded.isAdmin,
    };
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}
