# Testing Your Railway MySQL Connection Before Deployment

Before redeploying to Vercel, follow these steps to verify your Railway MySQL connection:

## Step 1: Get Railway Connection Information

1. Log in to [Railway](https://railway.app/)
2. Go to your MySQL database project
3. Click on the MySQL service
4. Navigate to the "Connect" tab
5. Copy the following information:
   - Host
   - Port
   - Username
   - Password
   - Database name (usually "railway")

## Step 2: Update Your Local Environment Variables

1. Open your `.env.local` file
2. Comment out the local database configuration
3. Add the Railway configuration with your actual values:

```
# Local database (commented out)
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=Mohit@12345
# DB_NAME=school_management

# Railway database (uncommented with your values)
DB_HOST=containers-us-west-123.railway.app
DB_PORT=7777
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=railway

# Cloudinary (leave as is)
CLOUDINARY_CLOUD_NAME=dkznxfk5w
CLOUDINARY_API_KEY=897268969981194
CLOUDINARY_API_SECRET=1tSFHS44l-df2IHZIKpMw8IY3Uo
```

## Step 3: Run the Connection Test Script

1. Open a terminal in your project root directory
2. Run the test script:

```powershell
node test-railway-connection.js
```

3. Check the output for any errors or success messages

## Step 4: Test with Your Application Locally

1. Start your Next.js development server:

```powershell
npm run dev
```

2. Open your browser to http://localhost:3000
3. Try adding a new school via the form
4. Check if the school appears in the show schools page

## Step 5: Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to "Settings" > "Environment Variables"
4. Update with the same Railway connection details you verified locally

## Step 6: Redeploy on Vercel

1. Go to your project's "Deployments" tab
2. Click "Redeploy" on your latest deployment

## Troubleshooting Tips

### If Testing Locally Fails

- Check that your Railway database is running
- Verify your connection credentials are correct
- Make sure your IP address is allowed in Railway's network settings (if applicable)
- Try temporarily setting `ssl: { rejectUnauthorized: false }` for testing

### If Vercel Deployment Fails

- Check Vercel logs for detailed error messages
- Verify all environment variables are correctly set in Vercel
- Test the API endpoints directly (e.g., `/api/db-test`) to isolate the issue

By thoroughly testing locally first, you can avoid multiple failed deployments and quickly identify any connection issues.
