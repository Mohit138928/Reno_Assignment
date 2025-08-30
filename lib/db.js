import mysql from "mysql2/promise";

/**
 * MySQL connection pool configuration
 * Uses environment variables for database credentials
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "school_management",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false, 
  },
});

/**
 * Execute a SQL query with optional parameters
 * @param {string} query - SQL query to execute
 * @param {Array} params - Parameters for prepared statement
 * @returns {Promise<Array>} - Query results
 */
export async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
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

// Initialize the database when this module is imported
initializeDatabase();

export default pool;
