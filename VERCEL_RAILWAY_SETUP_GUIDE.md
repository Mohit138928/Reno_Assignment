# Complete Guide: Fixing Vercel Deployment with Railway MySQL

Your application is encountering the `getaddrinfo ENOTFOUND mysql.railway.internal` error because Vercel cannot access Railway's internal hostnames. This guide provides step-by-step instructions to fix this issue and ensure your application deploys successfully.

## Step 1: Get Your Railway MySQL Connection Details

First, you need to get the correct connection information from Railway:

1. Login to [Railway](https://railway.app/)
2. Go to your MySQL database project
3. Click on the MySQL service
4. Go to the "Connect" tab
5. Find the section titled "Connect" or "Connection Information"
6. Look for the **external connection** details:
   - **Host**: Typically looks like `containers-us-west-XXX.railway.app` (NOT `mysql.railway.internal`)
   - **Port**: A numeric port (often 5-digits)
   - **Username**: Copy exactly as shown
   - **Password**: Copy exactly as shown (you'll need to click "Reveal")
   - **Database**: Usually `railway` by default

## Step 2: Update Vercel Environment Variables

Next, update your environment variables in Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your school management project
3. Navigate to "Settings" > "Environment Variables"
4. Update or add the following variables with the values from Railway:
   ```
   DB_HOST=containers-us-west-XXX.railway.app
   DB_PORT=7777 (replace with your actual port)
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=railway
   
   # Also ensure your Cloudinary variables are set:
   CLOUDINARY_CLOUD_NAME=dkznxfk5w
   CLOUDINARY_API_KEY=897268969981194
   CLOUDINARY_API_SECRET=1tSFHS44l-df2IHZIKpMw8IY3Uo
   ```
5. Click "Save"

## Step 3: Test Railway Connection Locally First

Before redeploying, test that your Railway connection works locally:

1. Update your `.env.local` file with the Railway connection details:
   ```
   # Comment out local database settings
   # DB_HOST=localhost
   # DB_USER=root
   # DB_PASSWORD=Mohit@12345
   # DB_NAME=school_management
   
   # Railway database (use your actual values)
   DB_HOST=containers-us-west-XXX.railway.app
   DB_PORT=7777
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=railway
   
   # Cloudinary credentials
   CLOUDINARY_CLOUD_NAME=dkznxfk5w
   CLOUDINARY_API_KEY=897268969981194
   CLOUDINARY_API_SECRET=1tSFHS44l-df2IHZIKpMw8IY3Uo
   ```

2. Run the connection test script:
   ```
   node test-railway-connection.js
   ```

3. If successful, the script will show: "All tests passed! Your Railway MySQL connection is working correctly."

## Step 4: Use the Enhanced Railway Database Connection

For better reliability, use the enhanced Railway database connection file:

1. In your API routes (like `pages/api/addSchool.js`, `pages/api/getSchools.js`), update the import:

   ```javascript
   // Change this:
   import { executeQuery } from "../../lib/db";
   
   // To this:
   import { executeQuery } from "../../lib/railway-db";
   ```

## Step 5: Redeploy Your Application

Now redeploy your application:

1. Go to your Vercel project dashboard
2. Go to the "Deployments" tab
3. Click "Redeploy" on your latest deployment
4. Monitor the deployment logs for any errors

## Step 6: Verify the Deployment

After deployment completes:

1. Visit your application URL
2. Navigate to `/api/db-test` to check database connectivity
3. Try adding a new school to verify the full workflow

## Troubleshooting Common Issues

### "DB Connection Failed" Error

If you see a database connection error:

1. Check that all environment variables are set correctly in Vercel
2. Verify that your Railway database is running
3. Ensure your database is publicly accessible (not IP restricted)
4. Check if Railway requires SSL connections (it usually does)

### Image Upload Issues

If images upload but database operations fail:

1. The issue is specifically with the database connection, not Cloudinary
2. Check Vercel logs for detailed database error messages
3. Verify that your Railway database has the schools table created

### SSL Connection Issues

Railway typically requires SSL for external connections:

1. Ensure your connection code includes SSL configuration:
   ```javascript
   ssl: process.env.NODE_ENV === "production" ? {} : undefined,
   ```

2. If SSL issues persist, try updating to:
   ```javascript
   ssl: {
     rejectUnauthorized: false
   }
   ```

## Final Steps for Robust Operation

For a reliable production setup:

1. Update your `next.config.js` to explicitly include environment variables:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     env: {
       DB_HOST: process.env.DB_HOST,
       DB_PORT: process.env.DB_PORT,
       DB_USER: process.env.DB_USER,
       DB_PASSWORD: process.env.DB_PASSWORD,
       DB_NAME: process.env.DB_NAME,
     },
   };
   
   module.exports = nextConfig;
   ```

2. Add proper error handling in your database initialization code to provide clear error messages

3. Set up monitoring for your database connection to be alerted of issues

By following these steps, your application should successfully connect to your Railway MySQL database from Vercel.
