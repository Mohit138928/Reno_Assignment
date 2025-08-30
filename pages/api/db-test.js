// db-test.js - Test MySQL connection
import mysql from "mysql2/promise";

async function testConnection() {
  // Log environment variables (sanitized for security)
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_PORT:", process.env.DB_PORT);
  console.log("DB_USER:", process.env.DB_USER ? "✓ Set" : "✗ Not set");
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "✓ Set" : "✗ Not set");
  console.log("DB_NAME:", process.env.DB_NAME);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.NODE_ENV === "production" ? {} : undefined,
    });

    console.log("Successfully connected to MySQL database!");
    await connection.end();
    return { success: true, message: "Connection successful" };
  } catch (error) {
    console.error("Database connection error:", error);
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  const result = await testConnection();
  res.status(result.success ? 200 : 500).json(result);
}
