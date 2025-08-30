// test-railway-connection.js
// Run this file with: node test-railway-connection.js
require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function testRailwayConnection() {
  // Display connection parameters (with password masked)
  console.log("=== Railway MySQL Connection Test ===");
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_PORT:", process.env.DB_PORT || 3306);
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "********" : "Not set");
  console.log("DB_NAME:", process.env.DB_NAME);

  try {
    // Create a connection
    console.log("\nAttempting to connect...");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_HOST.includes("railway.app") ? {} : undefined,
    });

    // Test the connection
    console.log("Connection established successfully!");

    // Run a test query
    console.log("\nTesting query execution...");
    const [rows] = await connection.execute("SELECT 1 + 1 AS result");
    console.log("Query executed successfully. Result:", rows[0].result);

    // Close the connection
    await connection.end();
    console.log("\nConnection closed.");
    console.log(
      "\n✅ All tests passed! Your Railway MySQL connection is working correctly."
    );
  } catch (error) {
    console.error("\n❌ Connection failed:", error.message);
    console.error("\nTroubleshooting tips:");
    console.error("1. Verify your Railway database is running");
    console.error("2. Check that your connection credentials are correct");
    console.error(
      "3. Ensure you're using the public connection URL (ending with .railway.app)"
    );
    console.error(
      "4. Check if your IP address is allowed in Railway's network settings"
    );
    console.error("\nDetailed error:");
    console.error(error);
  }
}

testRailwayConnection();
