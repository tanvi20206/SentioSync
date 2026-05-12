const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Header se token lo
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "No token provided. Please login." });
    }

    // "Bearer <token>" mein se sirf token nikalo
    const token = authHeader.split(" ")[1];

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User info request mein attach karo
    req.user = decoded;
    next(); // aage jao
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
