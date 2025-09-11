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

    // Development mode: bypass email sending
    if (process.env.NODE_ENV === "development") {
      console.log("\n=================================");
      console.log(`📧 OTP for ${email}: ${otp}`);
      console.log("=================================\n");

      // Return success with the OTP in the response (only in development mode)
      return res.status(200).json({
        success: true,
        message:
          "Development mode: OTP generated. Check server console for the code.",
        email,
        // Include OTP in response for auto-filling in dev mode
        otp,
      });
    }

    // Production mode: actually send the email
    const emailSent = await sendOTPEmail(email, otp);

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: `OTP sent to ${email}. Please check your inbox.`,
        email,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
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
