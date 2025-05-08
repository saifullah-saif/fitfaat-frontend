
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
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Function to generate JWT token
const generateToken = (user) => {
  // Remove sensitive information
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name
  };
  
  // Generate token with expiration of 7 days
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
};

const JWT_SECRET_KEY = JWT_SECRET;
module.exports = { verifyToken, generateToken, JWT_SECRET_KEY };
