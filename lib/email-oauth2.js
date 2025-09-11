import nodemailer from "nodemailer";

/**
 * This file provides an alternative implementation of email sending using Gmail OAuth2
 * This is more secure than using App Passwords and might improve email deliverability
 *
 * To use this:
 * 1. Set up OAuth2 credentials in the Google Cloud Console
 * 2. Install required packages: npm install googleapis
 * 3. Update your .env.local file with the OAuth2 credentials
 * 4. Replace the import in your request-otp.js file
 */

import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;

let transporter;

/**
 * Initialize the email transporter with OAuth2 authentication
 */
async function initializeTransporter() {
  if (transporter) return;

  try {
    // Check for required OAuth2 config
    if (
      !process.env.GMAIL_CLIENT_ID ||
      !process.env.GMAIL_CLIENT_SECRET ||
      !process.env.GMAIL_REFRESH_TOKEN ||
      !process.env.EMAIL_USER
    ) {
      console.warn(
        "Missing Gmail OAuth2 configuration. Falling back to dev mode."
      );

      // In development mode, we can proceed without real email config
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Running in development mode - emails will be logged to console"
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

      throw new Error("Missing Gmail OAuth2 configuration");
    }

    // Create OAuth2 client
    const oauth2Client = new OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground" // Redirect URL for playground
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    // Get access token
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.error("Failed to get access token:", err);
          reject(err);
        }
        resolve(token);
      });
    });

    // Create transporter
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    console.log("OAuth2 email transporter initialized successfully");
  } catch (error) {
    console.error("Failed to initialize OAuth2 email transporter:", error);
  }
}

/**
 * Send OTP email to user using OAuth2 authentication
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
    console.error(
      "OAuth2 email transporter not initialized. Cannot send email."
    );
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

    // Setup email data with simplified sender
    const mailOptions = {
      from: `"School Management System" <${process.env.EMAIL_USER}>`,
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
      headers: {
        "X-Priority": "1 (Highest)",
        "X-MSMail-Priority": "High",
        Importance: "High",
      },
    };

    console.log("Attempting to send OAuth2 email to:", to);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("OAuth2 email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OAuth2 OTP email:", error);
    return false;
  }
}

// Initialize the email transporter
initializeTransporter();
