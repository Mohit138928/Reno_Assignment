# School Management System

A comprehensive full-stack Next.js application for managing school information, featuring a modern form for adding school details and an interactive gallery page with search and filter capabilities.

## Features

### Core Features
- Add new schools with complete validation for all input fields
- Upload and store school images in the server
- View all schools in a responsive, e-commerce style grid layout
- Search and filter functionality for quickly finding schools
- MySQL database integration with automatic table creation
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
  - MySQL for database
  - multer for image upload handling

- **Database:**
  - MySQL with mysql2/promise
  - Automatic table creation and initialization

- **File Handling:**
  - multer for processing multipart/form-data
  - File system operations for image storage

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)

### MySQL Setup

1. Install MySQL Server (if not already installed)
2. Create a new database:
   ```sql
   CREATE DATABASE school_management;
   ```
3. The application will automatically create the required `schools` table on startup

### Project Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/school-management.git
cd school-management
```

2. Install dependencies:
```bash
npm install
```

3. Configure your environment variables:
   - Create a `.env.local` file in the root directory with:
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=school_management
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
/lib
  db.js                 # MySQL connection & utility functions
/public
  /schoolImages         # Storage for uploaded school images
/styles
  globals.css           # Global styles including Tailwind imports
```

## Workflow

1. User is initially directed to the showSchools page
2. They can view all schools in a grid layout
3. Search or filter schools by name, city, or state
4. Click "Add New School" to navigate to the form page
5. Fill in school details and upload an image
6. Form validates all entries client-side
7. On submission, data is validated server-side
8. School is added to the database and user receives confirmation
9. User can return to the gallery to see the newly added school

## Deployment

This project is ready for deployment to platforms like Vercel:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel:
   - DB_HOST
   - DB_USER
   - DB_PASSWORD
   - DB_NAME
4. Deploy!

## Future Enhancements

- User authentication and authorization
- School editing and deletion functionality
- Pagination for large datasets
- Advanced filtering options
- Image optimization for faster loading

## License

MIT
