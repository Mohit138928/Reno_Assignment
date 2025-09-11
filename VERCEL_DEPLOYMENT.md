# Deploying to Vercel

To fix the 500 error in the OTP email functionality on Vercel, make sure to configure these environment variables in your Vercel project:

1. Go to your Vercel dashboard
2. Select your project (Reno_Assignment)
3. Go to the "Settings" tab
4. Click on "Environment Variables"
5. Add the following variables:

## Required Email Configuration

```
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tannuvashisth419@gmail.com
EMAIL_PASS=ievyxkerkofgplzj
EMAIL_FROM=School Management System <tannuvashisth419@gmail.com>
```

## Required Database Configuration 

```
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=your-production-db-name
DB_PORT=3306
```

## Other Required Variables

```
NODE_ENV=production
JWT_SECRET=665b52742da6f39296c400e9397069add4f8063e70618d0c6d6a86d9c20767f3
OTP_EXPIRY_MINUTES=10
API_TEST_KEY=test-email-debug-key
```

## Testing Email in Production

After deployment, you can test if email is working by making a POST request to:

```
https://reno-assignment-ten.vercel.app/api/test/email
```

Include these headers:
```
Content-Type: application/json
x-api-key: test-email-debug-key
```

And this body:
```json
{
  "email": "youremail@example.com"
}
```

This will send a test email with OTP "123456" to verify your email configuration is working correctly.

## Checking Logs

If you continue to have issues, check your function logs in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Deployments"
4. Select the latest deployment
5. Click on "Functions"
6. Find "api/auth/request-otp" and click on it
7. Look for error messages in the logs

These detailed logs can help identify what's causing the 500 error.
