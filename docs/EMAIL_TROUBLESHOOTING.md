# Email Authentication Troubleshooting Guide

## Option 1: Using Gmail with App Password (for Production)

Gmail requires an "App Password" for applications to send emails through SMTP. Your regular Gmail password will not work.

### How to set up an App Password:

1. Go to [Google Account Settings](https://myaccount.google.com)
2. Select "Security" from the left menu
3. Enable "2-Step Verification" if not already enabled
4. Return to Security and look for "App passwords" (appears after 2-Step Verification is enabled)
5. Select "Other (Custom name)" from the dropdown
6. Enter "School Management" and click "Generate"
7. Copy the 16-character password that appears
8. Update your `.env.local` file:
   ```
   EMAIL_PASS=your-16-character-app-password
   ```

## Option 2: Development Mode (Already Set Up)

For easier development and testing, the system has been modified to work without sending real emails:

1. Make sure `NODE_ENV=development` is set in your `.env.local` file (already done)
2. When you request an OTP:
   - The OTP will be saved in the database as usual
   - The OTP will be displayed in the server console
   - The OTP will be automatically included in the response and filled in the form
3. This lets you test the authentication flow without needing to set up real email services

## Option 3: Alternative Email Testing Services

If you prefer to test with actual email delivery:

### Ethereal Email (Fake SMTP Service)

1. Install Nodemailer (already installed)
2. Update your email.js file to use Ethereal Email for testing:

```javascript
// At the top of email.js
async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// In initializeTransporter()
if (process.env.NODE_ENV !== 'production') {
  transporter = await createTestAccount();
  console.log('Using Ethereal test account for email');
} else {
  // regular email config
}
```

### Mailtrap (Email Testing Service)

1. Create a free [Mailtrap](https://mailtrap.io) account
2. Get your SMTP credentials from Mailtrap
3. Update your `.env.local` file:

```
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_password
```

## Debugging Email Issues

If you're still having issues with email delivery:

1. Check the server console for error messages
2. Make sure your Gmail account allows less secure apps or use an App Password
3. Verify your .env.local file has the correct email configuration
4. Try sending a test email from your code using a simple script

Remember: For security reasons, never commit your `.env.local` file with real passwords to a public repository.
