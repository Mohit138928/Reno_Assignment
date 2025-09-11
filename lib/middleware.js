import { getUserFromRequest } from "./jwt";

/**
 * Middleware to check if user is authenticated
 * @param {Function} handler - API route handler
 * @returns {Function} - Middleware wrapped handler
 */
export function withAuth(handler) {
  return async (req, res) => {
    // Get user from request
    const user = getUserFromRequest(req);

    // Check if user is authenticated
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Add user to request object
    req.user = user;

    // Call original handler
    return handler(req, res);
  };
}

/**
 * Get current user from request if authenticated
 * Can be used in both API routes and getServerSideProps
 * @param {Object} req - Next.js request object
 * @returns {Object|null} - User object or null if not authenticated
 */
export function getAuthUser(req) {
  return getUserFromRequest(req);
}
