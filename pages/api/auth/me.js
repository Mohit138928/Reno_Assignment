import { getAuthUser } from "../../../lib/middleware";

export default function handler(req, res) {
  const user = getAuthUser(req);

  // Return user info if authenticated
  if (user) {
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } else {
    // Return null if not authenticated
    return res.status(200).json({
      success: false,
      user: null,
    });
  }
}
