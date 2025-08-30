// lib/railway-db.js
import mysql from "mysql2/promise";

/**
 * Creates and returns a MySQL connection pool specifically configured for Railway
 * Optimized for production use on Vercel with Railway MySQL
 */
const createRailwayPool = () => {
  const isProduction = process.env.NODE_ENV === "production";

  // Check if we have all required environment variables
  const requiredVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
    console.error("Please check your environment configuration");

    // In development, we can fall back to defaults
    if (!isProduction) {
      console.warn(
        "Using default local database configuration for development"
      );
    }
  }

  // Log connection attempt (for debugging)
  console.log(
    `Attempting to connect to MySQL at ${process.env.DB_HOST}:${
      process.env.DB_PORT || 3306
    }`
  );

  // Connection configuration
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: isProduction ? 5 : 10, // Lower limit for serverless environments
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000, // 10 seconds
    // SSL configuration for production
    ssl: isProduction
      ? {
          rejectUnauthorized: false, // Verify the server certificate
        }
      : undefined,
  };

  try {
    return mysql.createPool(config);
  } catch (error) {
    console.error("Failed to create database connection pool:", error);
    throw error;
  }
};

// Create the connection pool
const railwayPool = createRailwayPool();

/**
 * Execute a SQL query with optional parameters
 * @param {string} query - SQL query to execute
 * @param {Array} params - Parameters for prepared statement
 * @returns {Promise<Array>} - Query results
 */
export async function executeQuery(query, params = []) {
  try {
    const [results] = await railwayPool.execute(query, params);
    return results;
  } catch (error) {
    // Detailed error logging for troubleshooting
    console.error("Database query error:", error);
    console.error("Failed query:", query);
    console.error("Query parameters:", JSON.stringify(params));
    throw error;
  }
}

/**
 * Create the schools table if it doesn't exist
 */
export async function initializeDatabase() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        contact VARCHAR(20) NOT NULL,
        email_id VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// Check connection status immediately
(async () => {
  try {
    await railwayPool.execute("SELECT 1");
    console.log("Successfully connected to MySQL database!");
    // Initialize the database tables
    await initializeDatabase();
  } catch (error) {
    console.error("Failed to connect to database on startup:", error);
  }
})();

export default railwayPool;
