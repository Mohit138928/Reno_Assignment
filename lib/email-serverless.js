import nodemailer from "nodemailer";

// Lightweight email service for serverless environments like Vercel
let cachedTransporter = null;

/**
 * Get an email transporter (creates a new one or uses cached one)
 * @returns {Object} Nodemailer transporter
 */
export async function getEmailTransporter() {
  // Return cached transporter if it exists
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // Check if we have the necessary environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Missing email configuration (EMAIL_USER or EMAIL_PASS)");

    // In development, return a mock transporter
    if (process.env.NODE_ENV !== "production") {
      return {
        sendMail: async (options) => {
          console.log("\n==== DEV MODE EMAIL ====");
          console.log("To:", options.to);
          console.log("Subject:", options.subject);
          console.log("Text:", options.text.substring(0, 100) + "...");
          console.log("=======================\n");
          return { messageId: "dev-mode-email" };
        },
      };
    }
    return null;
  }

  try {
    // Create transporter using Gmail service (works well in serverless)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.replace(/\s+/g, ""), // Remove any spaces
      },
    });

    // Cache the transporter
    cachedTransporter = transporter;
    return transporter;
  } catch (error) {
    console.error("Failed to create email transporter:", error.message);
    return null;
  }
}

/**
 * Send OTP email
 * @param {string} to - Recipient email address
 * @param {string} otp - OTP code
 * @returns {Promise<boolean>} Success status
 */
export async function sendOTPEmail(to, otp) {
  try {
    const transporter = await getEmailTransporter();

    if (!transporter) {
      console.error("No email transporter available");
      return false;
    }

    // Calculate expiry time
    const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 10;
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + parseInt(expiryMinutes));
    const expiryTime = expiryDate.toLocaleTimeString();

    // In development mode, always log the OTP
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n==== OTP for ${to}: ${otp} ====\n`);
    }

    // Set up email content
    const mailOptions = {
      from: `"School Management" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: "Your Login OTP Code",
      text: `Your OTP code is: ${otp}\n\nThis code will expire at ${expiryTime} (valid for ${expiryMinutes} minutes).`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3b82f6; text-align: center;">Your Login OTP Code</h2>
          <div style="text-align: center; padding: 20px; background-color: #f0f9ff; border-radius: 4px; margin: 20px 0;">
            <h1 style="font-size: 32px; letter-spacing: 8px; margin: 10px 0; color: #1e40af;">${otp}</h1>
          </div>
          <p>Please use the above code to login to your School Management System account.</p>
          <p>This code will expire at <strong>${expiryTime}</strong> (valid for ${expiryMinutes} minutes).</p>
        </div>
      `,
      priority: "high",
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    return !!info.messageId;
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    return false;
  }
}
