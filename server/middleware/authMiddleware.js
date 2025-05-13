const jwt = require('jsonwebtoken');

// Secret key for JWT - in production, this should be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'fitfaat-secret-key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const verified = jwt.verify(token, JWT_SECRET);

    // If both `id` and `user_id` are present in the token, use the `user_id` as the identifier
    if (verified.id && !verified.user_id) {
      verified.user_id = verified.id;  // Add `user_id` if only `id` is present
    } else if (verified.user_id && !verified.id) {
      verified.id = verified.user_id;  // Add `id` if only `user_id` is present
    }

    // Log the token data for debugging
    console.log("Verified token data:", {
      id: verified.id,
      user_id: verified.user_id,
      email: verified.email,
    });

    // Store the user data in the `req.user` object for downstream use
    req.user = verified;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Function to generate JWT token
const generateToken = (user) => {
  // Generate the token based on user data, using `user_id` as the unique identifier
  const userData = {
    user_id: user.user_id || user.id, // Always ensure `user_id` is used
    email: user.email,
    name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.name || user.username
  };

  // Log the user data being used to generate the token
  console.log("Generating token with user data:", userData);

  // Generate the token with an expiration of 7 days
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
};

// Export the middleware and the function
module.exports = { verifyToken, generateToken };
