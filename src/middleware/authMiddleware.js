const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // Step 1: Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No token provided. Please login.' 
      });
    }

    // Step 2: Extract token
    const token = authHeader.split(' ')[1];

    // Step 3: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Attach user to request
    req.user = decoded;

    // Step 5: Continue to next middleware/route
    next();

  } catch (error) {
    res.status(401).json({ 
      message: 'Invalid or expired token. Please login again.' 
    });
  }
};

module.exports = { protect };