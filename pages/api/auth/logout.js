import { clearAuthCookie } from "../../../lib/jwt";

export default function handler(req, res) {
  // Set cookie to expire
  const logoutCookie = clearAuthCookie();
  res.setHeader("Set-Cookie", logoutCookie);

  // Return success message
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}
