const jwt = require('jsonwebtoken');

// Secret key for JWT - in production, this should be in an environment variable
const JWT_SECRET = 'fitfaat-secret-key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);

    // Ensure both id and user_id are available for compatibility
    if (verified.id && !verified.user_id) {
      verified.user_id = verified.id;
    } else if (verified.user_id && !verified.id) {
      verified.id = verified.user_id;
    }

    // Log the token data for debugging
    console.log("Verified token data:", {
      id: verified.id,
      user_id: verified.user_id,
      email: verified.email
    });

    req.user = verified;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Function to generate JWT token
const generateToken = (user) => {
  // Remove sensitive information and ensure consistent field names
  const userData = {
    id: user.user_id  ||user.id, // Use user_id from DB or id if already transformed
    email: user.email,
    name: user.first_name ? `${user.first_name} ${user.last_name  || ''}`.trim() : user.name || user.username
  };

  console.log("Generating token with user data:", userData);

  // Generate token with expiration of 7 days
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
};

const JWT_SECRET_KEY = JWT_SECRET;
module.exports = { verifyToken, generateToken, JWT_SECRET_KEY };