// Test API endpoint for email functionality in production
import { sendOTPEmail } from "../../../lib/email-serverless";

export default async function handler(req, res) {
  // Only allow POST requests with API key for security
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  // API key verification - basic security to prevent abuse
  const apiKey = req.headers["x-api-key"];
  if (
    apiKey !== process.env.API_TEST_KEY &&
    apiKey !== "test-email-debug-key"
  ) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    // Generate a test OTP
    const testOTP = "123456";

    // Get environment info for diagnostics
    const envInfo = {
      nodeEnv: process.env.NODE_ENV || "not set",
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
      emailService: process.env.EMAIL_SERVICE || "not set",
    };

    // Try to send email
    console.log(`Test: Attempting to send OTP ${testOTP} to ${email}`);
    const emailSent = await sendOTPEmail(email, testOTP);

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: `Test email with OTP sent to ${email}`,
        envInfo,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send test email",
        envInfo,
      });
    }
  } catch (error) {
    console.error("Error in test-email API:", error);
    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
