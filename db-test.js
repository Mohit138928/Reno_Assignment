// db-test.js - Script to test database connection
import { executeQuery, initializeDatabase } from "./lib/db.js";
import mysql from "mysql2/promise";

async function testDatabaseConnection() {
  console.log("\n🔍 DATABASE CONNECTION TEST");
  console.log("==========================\n");

  // Display connection info (without password)
  console.log("Connection settings:");
  console.log("- HOST:", process.env.DB_HOST || "localhost");
  console.log("- USER:", process.env.DB_USER || "root");
  console.log("- DB:", process.env.DB_NAME || "school_management");
  console.log("- PORT:", process.env.DB_PORT || "3306");
  console.log("- ENV:", process.env.NODE_ENV || "development");

  try {
    console.log("\nTesting database connection...");
    const result = await executeQuery("SELECT 1 as test");

    console.log("✅ Database connection successful!");
    console.log("Test query result:", result);

    console.log("\nInitializing database and creating tables if needed...");
    await initializeDatabase();
    console.log("✅ Database initialization complete!");

    console.log("\nFetching existing schools...");
    const schools = await executeQuery("SELECT COUNT(*) as count FROM schools");
    console.log(`✅ Found ${schools[0].count} school(s) in the database.`);

    // Test if we can create a test record
    console.log("\nTesting record creation...");
    try {
      await executeQuery(
        "INSERT INTO schools (name, address, city, state, contact, email_id, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          "Test School (Delete Me)",
          "123 Test St",
          "Test City",
          "Test State",
          "1234567890",
          "test@example.com",
          "/test-image.jpg",
        ]
      );
      console.log("✅ Test record created successfully");

      // Remove the test record
      await executeQuery("DELETE FROM schools WHERE name = ?", [
        "Test School (Delete Me)",
      ]);
      console.log("✅ Test record removed successfully");
    } catch (insertError) {
      console.error("❌ Could not create test record:", insertError.message);
    }

    console.log("\n✅ SUCCESS: Database is ready for use!");
    console.log(
      "Your application should be able to connect to this database.\n"
    );
    process.exit(0);
  } catch (error) {
    console.error("\n❌ DATABASE CONNECTION FAILED!");
    console.error("Error details:", error.message);

    console.error("\nDebug information:");
    try {
      // Try to get more information about MySQL server
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        port: process.env.DB_PORT || 3306,
      });
      const [rows] = await conn.execute("SELECT VERSION() as version");
      console.log("MySQL server version:", rows[0].version);
      console.log(
        "The server is running, but specific database might not exist"
      );
      await conn.end();
    } catch (debugError) {
      console.error(
        "Could not connect to MySQL server at all:",
        debugError.message
      );
    }

    console.error("\nPlease check:");
    console.error("1. Database server is running and accessible");
    console.error("2. Database credentials in .env.local are correct");
    console.error(
      '3. Database exists (Railway uses "railway" as default database name)'
    );
    console.error("4. User has proper permissions");
    console.error(
      "5. If using Railway, check if your IP is allowed in their settings\n"
    );
    process.exit(1);
  }
}

testDatabaseConnection();
