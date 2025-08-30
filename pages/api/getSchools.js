import { executeQuery } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    // Fetch all schools from the database
    const schools = await executeQuery(
      "SELECT * FROM schools ORDER BY created_at DESC"
    );

    // Return the schools data
    return res.status(200).json({ success: true, data: schools });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch schools" });
  }
}
