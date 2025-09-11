// Simple email test script
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Load environment variables manually from .env.local file
const envFile = fs.readFileSync(path.join(__dirname, ".env.local"), "utf8");
const envVars = envFile
  .split("\n")
  .filter((line) => line && !line.startsWith("#"))
  .reduce((acc, line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});

console.log("Running simple email test...");
console.log("Email configuration:");
console.log("- User:", envVars.EMAIL_USER);
console.log("- Host:", envVars.EMAIL_HOST);
console.log("- Port:", envVars.EMAIL_PORT);

// Create test email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: envVars.EMAIL_USER,
    pass: envVars.EMAIL_PASS.replace(/\s+/g, ""), // Remove spaces if any
  },
});

// Send a test email
transporter
  .sendMail({
    from: `"School Management" <${envVars.EMAIL_USER}>`,
    to: "mauryamohit138@gmail.com", // Change this to your test email
    subject: "Test Email - OTP System",
    text: "This is a test email from the School Management System. Your test OTP is: 123456",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #3b82f6; text-align: center;">Your Test OTP Code</h2>
      <div style="text-align: center; padding: 20px; background-color: #f0f9ff; border-radius: 4px; margin: 20px 0;">
        <h1 style="font-size: 32px; letter-spacing: 8px; margin: 10px 0; color: #1e40af;">123456</h1>
      </div>
      <p>This is a test email to verify that your email configuration is working correctly.</p>
    </div>
  `,
  })
  .then((info) => {
    console.log("Email sent successfully!");
    console.log("- Message ID:", info.messageId);
    console.log("- Response:", info.response);
  })
  .catch((error) => {
    console.error("Failed to send email:", error);
    if (error.code === "EAUTH") {
      console.error(
        "\nAuthentication error: Check your EMAIL_USER and EMAIL_PASS"
      );
      console.error("For Gmail, you need to:");
      console.error(
        "1. Enable 2-Step Verification at https://myaccount.google.com/security"
      );
      console.error(
        "2. Create an App Password at https://myaccount.google.com/apppasswords"
      );
      console.error("3. Use that App Password without spaces in EMAIL_PASS\n");
    }
  });
