import {
  generateOTP,
  saveOTP,
  verifyOTP,
  createOrUpdateUser,
} from "../../../lib/auth";
import { sendOTPEmail } from "../../../lib/email";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid email is required" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database
    await saveOTP(email, otp);

    // Always attempt to send the email, but in development mode it might just log to console
    console.log(`Sending OTP ${otp} to ${email}`);

    const emailSent = await sendOTPEmail(email, otp);

    // In development mode, always return the OTP for testing
    if (process.env.NODE_ENV === "development") {
      return res.status(200).json({
        success: true,
        message:
          "Development mode: OTP generated. Check server console for the code.",
        email,
        // Include OTP in response for auto-filling in dev mode
        otp,
      });
    }

    // In production, don't include the OTP in the response
    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: `OTP sent to ${email}. Please check your inbox and spam folder.`,
        email,
      });
    } else {
      return res.status(500).json({
        success: false,
        message:
          "Failed to send OTP email. Please try again or contact support.",
      });
    }
  } catch (error) {
    console.error("Error requesting OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server error when sending OTP. Please try again.",
    });
  }
}
