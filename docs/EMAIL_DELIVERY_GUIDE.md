# Email Delivery Troubleshooting Guide

If you're experiencing issues with OTP emails not arriving in your inbox, try these troubleshooting steps in order:

## 1. Check Gmail App Password Configuration

1. Ensure you have a valid App Password:
   - Go to [Google Account Settings](https://myaccount.google.com/security)
   - Make sure 2-Step Verification is enabled
   - Go to "App passwords" (under "Signing in to Google")
   - Create a new app password specifically for your application
   - Make sure it's a 16-character password with no spaces

2. Verify your .env.local file has the correct values:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM=School Management System <your-email@gmail.com>
   NODE_ENV=production
   ```

## 2. Check Gmail Security Settings

1. Make sure your Gmail account isn't blocking the application:
   - Check for any security alerts in your Gmail account
   - Go to [Recent security events](https://myaccount.google.com/notifications)
   - If you see "Sign-in blocked" or similar alerts, click "Yes, it was me" to allow

2. Allow less secure apps (only if using regular password, not recommended):
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Look for "Less secure app access" and turn it on
   - Note: This option may not be available if you have 2-Step Verification enabled (which is recommended)

## 3. Test with Different Email Services

If Gmail isn't working, try one of these alternatives:

1. **Mailtrap** (for testing):
   - Create a free account at [Mailtrap](https://mailtrap.io)
   - Get your SMTP credentials
   - Update your .env.local file with Mailtrap credentials:
   ```
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your-mailtrap-username
   EMAIL_PASS=your-mailtrap-password
   EMAIL_FROM=School Management System <test@example.com>
   ```

2. **SendGrid** (for production):
   - Create a free account at [SendGrid](https://sendgrid.com)
   - Create an API key or SMTP credentials
   - Update your .env.local file:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   EMAIL_FROM=School Management System <your-verified-sender@example.com>
   ```

## 4. Check Server Logs for Errors

Look for these specific error types in your server console:

1. **Authentication errors** (EAUTH):
   - Indicates wrong username/password
   - Solution: Check EMAIL_USER and EMAIL_PASS in .env.local

2. **Connection errors** (ESOCKET, ECONNECTION):
   - Indicates server connection issues
   - Solution: Check EMAIL_HOST and EMAIL_PORT in .env.local
   - Solution: Check your firewall or network settings

3. **Configuration errors**:
   - Look for any "Missing email configuration" messages
   - Make sure all required environment variables are set

## 5. Use Gmail OAuth2 Authentication (More Reliable)

If App Password isn't working, try using OAuth2 authentication:

1. Install the required package:
   ```
   npm install googleapis
   ```

2. Set up OAuth2 credentials in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Gmail API
   - Create OAuth2 credentials (Web application type)
   - Add authorized redirect URIs (including https://developers.google.com/oauthplayground)

3. Get your refresh token:
   - Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
   - Click the gear icon and select "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret
   - Select "Gmail API v1" and authorize
   - Exchange authorization code for tokens
   - Copy the refresh token

4. Update your .env.local file:
   ```
   GMAIL_CLIENT_ID=your-client-id
   GMAIL_CLIENT_SECRET=your-client-secret
   GMAIL_REFRESH_TOKEN=your-refresh-token
   ```

5. Use the email-oauth2.js file provided in the project

## 6. Deliverability Tips

If emails are sent but not appearing in inbox:

1. Check spam/junk folders
2. Add a proper SPF/DKIM record if using a custom domain
3. Use a consistent sender address
4. Make the subject line clear and avoid spam-triggering words
5. Keep HTML simple and avoid excessive images or links
