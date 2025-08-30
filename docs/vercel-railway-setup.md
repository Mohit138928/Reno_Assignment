# Deploying to Vercel with Railway MySQL Database

This guide explains how to correctly set up your environment variables in Vercel to connect to a Railway MySQL database.

## Step 1: Get Railway Connection Information

1. Go to your Railway project dashboard
2. Click on your MySQL service
3. Go to the "Connect" tab
4. Find the connection details including:
   - Host
   - Port
   - Username
   - Password
   - Database name

## Step 2: Configure Vercel Environment Variables

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to Settings > Environment Variables
4. Add the following variables with values from Railway:

```
DB_HOST=your_railway_host.railway.app  
DB_PORT=your_railway_port
DB_USER=your_railway_username
DB_PASSWORD=your_railway_password
DB_NAME=your_railway_database_name
```

## Step 3: Test the Database Connection

1. After deploying, visit: `https://your-vercel-app-url/api/db-test`
2. If the connection is successful, you'll see: `{"success":true,"message":"Connection successful"}`
3. If there's an error, you'll see the error details which can help troubleshoot

## Common Issues and Solutions

### "getaddrinfo ENOTFOUND mysql.railway.internal"

This error occurs when your application is trying to use an internal Railway hostname that's only available within Railway's infrastructure.

**Solution:** Make sure you're using the public connection string (ending with `.railway.app`) in your Vercel environment variables, not the internal hostname.

### SSL Connection Issues

Railway MySQL requires SSL for connections from external sources.

**Solution:** Ensure your database connection code has SSL enabled:

```javascript
ssl: process.env.NODE_ENV === "production" ? {} : undefined,
```

### Connection Timeout

If your connection times out, it might be due to network restrictions.

**Solution:** Check if Railway has any IP allowlisting features and ensure Vercel's IPs are allowed.

## Need Further Help?

- Check Vercel logs for detailed error messages
- Verify your environment variables are set correctly
- Test your database connection locally using the Railway connection parameters
