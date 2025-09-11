import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
let transporter;

/**
 * Initialize the email transporter
 */
async function initializeTransporter() {
  if (transporter) return;

  try {
    // Check if required email config exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
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

    // If we're in development mode but want to test with real emails
    // Create a test account on ethereal.email for testing
    if (
      process.env.NODE_ENV === "development" &&
      process.env.USE_TEST_EMAIL === "true"
    ) {
      try {
        console.log("Creating test email account...");
        const testAccount = await nodemailer.createTestAccount();
        console.log("Test email account created:", testAccount.user);

        // Create a transporter with the test account
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        console.log("Using ethereal.email for testing");
        return;
      } catch (err) {
        console.error("Failed to create test email account:", err);
      }
    }

    // Log email configuration for debugging (without password)
    console.log("Email configuration:", {
      service: process.env.EMAIL_SERVICE || "Using direct SMTP",
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        // Not logging password for security
      },
    });

    // Use service configuration if specified (recommended for Gmail)
    if (process.env.EMAIL_SERVICE) {
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          // Make sure there are no spaces in the password
          pass: process.env.EMAIL_PASS.replace(/\s+/g, ""),
        },
      });
      console.log(`Using ${process.env.EMAIL_SERVICE} service`);
    } else {
      // Fall back to direct SMTP configuration
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_PORT === "465",
        auth: {
          user: process.env.EMAIL_USER,
          // Make sure there are no spaces in the password
          pass: process.env.EMAIL_PASS.replace(/\s+/g, ""),
        },
        tls: {
          // Do not fail on invalid certificates
          rejectUnauthorized: false,
        },
      });
      console.log("Using direct SMTP configuration");
    }

    // Verify the connection configuration
    try {
      await transporter.verify();
      console.log("SMTP connection verified successfully");
    } catch (verifyError) {
      console.error("SMTP connection verification failed:", verifyError);
      throw verifyError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error("Failed to initialize email transporter:", error);
    console.error("Error details:", error.message);
    if (error.response) {
      console.error("Server responded with:", error.response);
    }
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
    await initializeTransporter();
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

    // In development mode, always log the OTP
    if (process.env.NODE_ENV === "development") {
      console.log("\n=================================");
      console.log(`📧 OTP for ${to}: ${otp}`);
      console.log("=================================\n");

      // If we're not using test emails in development, just return success
      if (process.env.USE_TEST_EMAIL !== "true") {
        return true;
      }
      // Otherwise continue to actually send the email for testing
    }

    // Determine the correct "from" address
    let fromAddress;
    if (process.env.EMAIL_FROM) {
      fromAddress = process.env.EMAIL_FROM;
    } else {
      fromAddress = `"School Management System" <${process.env.EMAIL_USER}>`;
    }

    // Setup email data
    const mailOptions = {
      from: fromAddress,
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
      // Add these headers to improve deliverability
      priority: "high",
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "High",
      },
    };

    console.log("Attempting to send email to:", to);

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:");
    console.log("- Message ID:", info.messageId);

    // If this is a test email from ethereal, show the preview URL
    if (info.messageId && info.messageId.includes("ethereal")) {
      console.log("- Preview URL:", nodemailer.getTestMessageUrl(info));
      return true;
    }

    // Log detailed information for debugging
    if (info.response) {
      console.log("- Response:", info.response);
    }

    if (info.accepted && info.accepted.includes(to)) {
      console.log("- Email was accepted by the mail server");
      return true;
    } else {
      console.warn("- Email might not have been accepted properly");
      // Still return true if we got a message ID (email was accepted by some server)
      return !!info.messageId;
    }
  } catch (error) {
    console.error("Error sending OTP email:", error);

    // Provide detailed error information
    if (error.code === "EAUTH") {
      console.error(
        "Authentication error - check your EMAIL_USER and EMAIL_PASS"
      );
      console.error("Make sure you're using an App Password if using Gmail");
    } else if (error.code === "ESOCKET" || error.code === "ECONNECTION") {
      console.error("Connection error - check your EMAIL_HOST and EMAIL_PORT");
      console.error("Make sure your network allows SMTP connections");
    } else if (error.responseCode) {
      console.error(`SMTP Error ${error.responseCode}: ${error.response}`);
    }

    return false;
  }
}

// Initialize the email transporter
(async function () {
  console.log("Initializing email transporter...");
  await initializeTransporter();
})();
