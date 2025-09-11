import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
let transporter;

/**
 * Initialize the email transporter
 */
function initializeTransporter() {
  if (transporter) return;

  try {
    // Check if required email config exists
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      console.warn("Missing email configuration. Check your .env file");

      // In development mode, we can proceed without real email config
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Running in development mode - emails will be logged to console instead of sent"
        );
        transporter = {
          sendMail: async (options) => {
            console.log(
              "\n==== DEVELOPMENT MODE: EMAIL NOT ACTUALLY SENT ===="
            );
            console.log("From:", options.from);
            console.log("To:", options.to);
            console.log("Subject:", options.subject);
            console.log("Text content:", options.text);
            console.log("====================================\n");
            return { messageId: "dev-mode-no-actual-email" };
          },
        };
        return;
      }
    }

    // Log email configuration for debugging (without password)
    console.log("Email configuration:", {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        // Not logging password for security
      },
    });

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } catch (error) {
    console.error("Failed to initialize email transporter:", error);
  }
}

/**
 * Send OTP email to user
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 * @returns {Promise<boolean>} - Whether the email was sent successfully
 */
export async function sendOTPEmail(to, otp) {
  // Initialize transporter if not already done
  if (!transporter) {
    initializeTransporter();
  }

  // Check if transporter was initialized
  if (!transporter) {
    console.error("Email transporter not initialized. Cannot send email.");
    return false;
  }

  try {
    // Calculate expiry time (10 minutes from now)
    const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 10;
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + parseInt(expiryMinutes));
    const expiryTime = expiryDate.toLocaleTimeString();

    // In development mode, just log the OTP
    if (process.env.NODE_ENV === "development") {
      console.log("\n=================================");
      console.log(`📧 OTP for ${to}: ${otp}`);
      console.log("=================================\n");
      return true;
    }

    // Check for required environment variables
    if (!process.env.EMAIL_FROM) {
      console.error("EMAIL_FROM environment variable is not set");
      return false;
    }

    // Setup email data
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: "Your Login OTP Code",
      text: `Your OTP code is: ${otp}\n\nThis code will expire at ${expiryTime} (valid for ${expiryMinutes} minutes).\n\nIf you did not request this code, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3b82f6; text-align: center;">Your Login OTP Code</h2>
          <div style="text-align: center; padding: 20px; background-color: #f0f9ff; border-radius: 4px; margin: 20px 0;">
            <h1 style="font-size: 32px; letter-spacing: 8px; margin: 10px 0; color: #1e40af;">${otp}</h1>
          </div>
          <p>Please use the above code to login to your School Management System account.</p>
          <p>This code will expire at <strong>${expiryTime}</strong> (valid for ${expiryMinutes} minutes).</p>
          <p style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            If you did not request this code, please ignore this email.
          </p>
        </div>
      `,
    };

    console.log("Attempting to send email to:", to);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
}

// Initialize the email transporter
initializeTransporter();
