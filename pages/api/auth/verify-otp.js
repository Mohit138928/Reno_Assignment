import { verifyOTP, createOrUpdateUser } from "../../../lib/auth";
import { generateToken, createAuthCookie } from "../../../lib/jwt";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, otp, name } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(email, otp);

    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    // Create or update user
    const user = await createOrUpdateUser(email, name);

    // Generate JWT token
    const token = generateToken(user);

    // Set auth cookie
    const authCookie = createAuthCookie(token);
    res.setHeader("Set-Cookie", authCookie);

    // Return user info (without sensitive data)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server error when verifying OTP. Please try again.",
    });
  }
}
