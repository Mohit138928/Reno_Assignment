/**
 * Test script for sending emails
 * Run this script with: node test-email.js your-email@example.com
 */

// Load environment variables from .env.local
require("dotenv").config({ path: "./.env.local" });

const nodemailer = require("nodemailer");

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.log("Please provide an email address as an argument");
    console.log("Example: node test-email.js your-email@example.com");
    process.exit(1);
  }

  console.log(`Attempting to send a test email to ${email}...`);

  try {
    // Create a test account on ethereal.email first
    console.log("Creating test email account...");
    const testAccount = await nodemailer.createTestAccount();

    console.log("Test account created:");
    console.log("- User:", testAccount.user);
    console.log("- Password:", testAccount.pass);

    // First try with Gmail service
    try {
      console.log("\n--- Testing Gmail configuration ---");
      const gmailTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS.replace(/\s+/g, ""),
        },
      });

      console.log("Sending test email with Gmail...");
      const gmailInfo = await gmailTransport.sendMail({
        from: `"School Management System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Test Email from School Management System",
        text: "This is a test email to verify that your email configuration is working correctly.",
        html: "<h1>Email Test</h1><p>This is a test email to verify that your email configuration is working correctly.</p>",
      });

      console.log("Gmail test email sent!");
      console.log("- Message ID:", gmailInfo.messageId);
      console.log("- Response:", gmailInfo.response);
      console.log("- Accepted:", gmailInfo.accepted);
    } catch (gmailError) {
      console.error("Failed to send with Gmail:", gmailError.message);
    }

    // Now try with Ethereal (will always work)
    console.log("\n--- Testing with Ethereal Email (guaranteed to work) ---");
    const etherealTransport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log("Sending test email with Ethereal...");
    const info = await etherealTransport.sendMail({
      from: '"School Management Test" <test@example.com>',
      to: email,
      subject: "Test Email from Ethereal",
      text: "This is a test email sent via Ethereal.",
      html: "<h1>Ethereal Test</h1><p>This is a test email sent via Ethereal. If you see this, email sending works, but you need to check your Gmail configuration.</p>",
    });

    console.log("Ethereal test email sent!");
    console.log("- Message ID:", info.messageId);

    // Preview URL only available when using Ethereal
    console.log("- Preview URL:", nodemailer.getTestMessageUrl(info));

    console.log(
      "\nTest completed. Check your email inbox (and spam folder) for the Gmail test."
    );
    console.log("The Ethereal test can be viewed at the preview URL above.");
  } catch (error) {
    console.error("Error sending test email:", error);
  }
}

main().catch(console.error);
