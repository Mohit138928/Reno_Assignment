# Fixing the "mysql.railway.internal" Error in Vercel Deployment

You're experiencing an error `getaddrinfo ENOTFOUND mysql.railway.internal` because your application is trying to use Railway's internal hostname, which is not accessible from Vercel's environment.

Follow these steps to fix the issue:

## 1. Get Your Railway Connection Details

1. Log in to [Railway](https://railway.app/)
2. Go to your project dashboard
3. Click on your MySQL database service
4. Navigate to the "Connect" tab
5. Look for the "Connect" section and find the external connection details:
   - **Host**: Should look like `containers-us-west-X.railway.app` (NOT `mysql.railway.internal`)
   - **Port**: Usually a 5-digit number like `5678`
   - **Username**: Copy this exactly
   - **Password**: Copy this exactly
   - **Database Name**: Usually `railway` by default

## 2. Update Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to "Settings" > "Environment Variables"
4. Replace your existing database environment variables with these:

   ```
   DB_HOST=containers-us-west-X.railway.app
   DB_PORT=5678
   DB_USER=your_railway_username
   DB_PASSWORD=your_railway_password
   DB_NAME=railway
   ```

   Replace the values with your actual connection details from Railway.

5. Click "Save" to apply these changes

## 3. Force a Redeployment

1. In your Vercel project dashboard, go to the "Deployments" tab
2. Click "Redeploy" on your latest deployment (or create a new deployment)

## 4. Verify the Connection

After redeployment, test your application by:

1. Visiting your app's URL
2. Attempting to add a new school
3. Checking the Vercel logs for any errors

## 5. Use the Database Test API

Visit your app's URL with the path `/api/db-test` appended to check the database connection. For example:
```
https://your-app-name.vercel.app/api/db-test
```

If successful, you'll see:
```json
{
  "success": true,
  "message": "Connection successful"
}
```

## Troubleshooting

If you still encounter issues:

1. Check the Vercel logs for detailed error messages
2. Verify that Railway hasn't changed their connection format
3. Ensure your database service is running on Railway
4. Test the connection locally with the same credentials using the provided `test-railway-connection.js` script

## Local Testing

To test your Railway connection locally before deploying:

1. Update your `.env.local` file with the Railway connection details
2. Comment out the local database configuration
3. Run the test script:
   ```
   node test-railway-connection.js
   ```

This should help resolve the connection issue with Railway in your Vercel deployment.
