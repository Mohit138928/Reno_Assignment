# School Management System

A comprehensive full-stack Next.js application for managing school information, featuring a modern form for adding school details and an interactive gallery page with search and filter capabilities. The application supports both local development with MySQL and production deployment with Railway MySQL and Cloudinary image storage.

## Features

### Core Features
- Add new schools with complete validation for all input fields
- Upload and store school images locally (development) or in Cloudinary (production)
- View all schools in a responsive, e-commerce style grid layout
- Search and filter functionality for quickly finding schools
- MySQL database integration with automatic table creation
- Production-ready with Railway MySQL support for deployment
- Mobile-first responsive design with Tailwind CSS

### Form Functionality (addSchool.jsx)
- Complete form validation with react-hook-form:
  - Email format validation
  - Contact number validation (must be 10 digits)
  - All fields required validation
- Image preview before submission
- Client-side and server-side validation
- Clear success/error message display
- Image upload with file type restrictions

### School Display (showSchools.jsx)
- Responsive grid layout that works on all screen sizes
- Search functionality to find schools by name or address
- Filter options for city and state
- Dynamic filter dropdowns that update based on available data
- "No results" state when filters don't match any schools
- Counter showing number of schools matching current filters

## Tech Stack

- **Frontend:** 
  - Next.js (React)
  - Tailwind CSS for styling
  - react-hook-form for form validation and handling

- **Backend:** 
  - Next.js API Routes
  - MySQL for database (local and Railway)
  - multer for image upload handling
  - Environment-specific configurations for development and production

- **Database:**
  - Local MySQL for development
  - Railway MySQL for production
  - mysql2/promise with connection pooling
  - Automatic table creation and initialization
  - SSL support for secure connections

- **File Handling:**
  - multer disk storage for local development
  - multer memory storage for serverless environments
  - Cloudinary for cloud image storage in production
  - Local file system for development environments

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)

### Database Setup

#### Local MySQL (Development)
1. Install MySQL Server (if not already installed)
2. Create a new database:
   ```sql
   CREATE DATABASE school_management;
   ```
3. The application will automatically create the required `schools` table on startup

#### Railway MySQL (Production)
1. Create an account on [Railway](https://railway.app/)
2. Create a new MySQL database project
3. Note down the connection details (host, port, username, password)
4. The application will automatically create the required `schools` table on startup

### Project Setup

1. Clone the repository:
```bash
git clone https://github.com/Mohit138928/Reno_Assignment.git
cd Reno_Assignment
```

2. Install dependencies:
```bash
npm install
```

3. Configure your environment variables:
   - Create a `.env.local` file in the root directory with:
   
   ```
   # Local MySQL Configuration (Development)
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=school_management
   DB_PORT=3306
   
   # Cloudinary Configuration (For production image storage)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # For Railway deployment testing, uncomment and fill these:
   # DB_HOST=containers-us-west-xxx.railway.app
   # DB_PORT=your_railway_port
   # DB_USER=your_railway_username
   # DB_PASSWORD=your_railway_password
   # DB_NAME=railway
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/pages
  _app.jsx              # Main application component
  index.jsx             # Redirects to showSchools page
  addSchool.jsx         # Form to add a new school
  showSchools.jsx       # Display all schools with search & filters
  /api
    addSchool.js        # API endpoint to add a school with image upload
    getSchools.js       # API endpoint to get all schools
    db-test.js          # API endpoint to test database connection
/lib
  db.js                 # Local MySQL connection & utility functions
  railway-db.js         # Railway MySQL connection with enhanced error handling
  cloudinary.js         # Cloudinary integration for image storage
/public
  /schoolImages         # Local storage for uploaded school images (development only)
/styles
  globals.css           # Global styles including Tailwind imports
/docs
  vercel-railway-setup.md        # Guide for configuring Vercel with Railway
  fix-railway-mysql-error.md     # Troubleshooting Railway MySQL connection issues
test-railway-connection.js       # Script to test Railway MySQL connection
VERCEL_RAILWAY_SETUP_GUIDE.md    # Comprehensive guide for Vercel/Railway setup
TESTING_RAILWAY_CONNECTION.md    # Step-by-step testing procedure for database connections
```

## Workflow

1. User is initially directed to the showSchools page
2. They can view all schools in a grid layout
3. Search or filter schools by name, city, or state
4. Click "Add New School" to navigate to the form page
5. Fill in school details and upload an image
6. Form validates all entries client-side
7. On submission, data is validated server-side
8. In development:
   - Image is stored locally in /public/schoolImages
   - Data is saved to local MySQL database
9. In production:
   - Image is uploaded to Cloudinary cloud storage
   - Data is saved to Railway MySQL database
10. School is added to the database and user receives confirmation
11. User can return to the gallery to see the newly added school

## Deployment

This project is configured for deployment to Vercel with Railway MySQL:

1. Push your code to GitHub
2. Set up your Railway MySQL database:
   - Create an account on [Railway](https://railway.app/)
   - Create a new MySQL database service
   - Note down the connection details from the Connect tab
   
3. Set up your Cloudinary account:
   - Create an account on [Cloudinary](https://cloudinary.com/)
   - Get your cloud name, API key, and API secret
   
4. Connect your GitHub repository to Vercel
5. Configure environment variables in Vercel:
   ```
   # Railway MySQL Configuration
   DB_HOST=containers-us-west-xxx.railway.app  # Use external connection URL
   DB_PORT=your_railway_port
   DB_USER=your_railway_username
   DB_PASSWORD=your_railway_password
   DB_NAME=railway
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
   
6. Deploy!
7. Test your deployment with the `/api/db-test` endpoint

### Troubleshooting Deployment

If you encounter database connection issues:

1. Ensure you're using Railway's external connection URL (ending with `.railway.app`), not internal hostnames
2. Check that your Railway database is running and accessible
3. Verify environment variables are correctly set in Vercel
4. See `docs/fix-railway-mysql-error.md` for detailed troubleshooting

For detailed instructions, refer to `VERCEL_RAILWAY_SETUP_GUIDE.md` in the project root.

## Development vs. Production

The project is configured to work differently based on the environment:

### Development (Local)
- MySQL database running locally
- Images stored in local filesystem (`/public/schoolImages`)
- Multer configured to use disk storage

### Production (Vercel/Railway)
- MySQL database hosted on Railway
- Images stored in Cloudinary
- Multer configured to use memory storage (compatible with serverless)
- SSL enabled for secure database connections

## Testing Database Connections

You can test your database connections using:

1. **Railway Connection Test Script**:
   ```bash
   node test-railway-connection.js
   ```

2. **API Test Endpoint**:
   Visit `/api/db-test` in your browser or send a GET request to test database connectivity

## Future Enhancements

- User authentication and authorization
- School editing and deletion functionality
- Pagination for large datasets
- Advanced filtering options
- Image optimization for faster loading
- Database migration utilities
- Comprehensive error logging

## License

MIT
