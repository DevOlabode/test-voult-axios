// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get the TokenManager instance from app
    const tokenManager = req.app.get('tokenManager');
    
    // Get current access token
    const accessToken = tokenManager.getCurrentToken();
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    // Decode JWT to get user info (we're not verifying since we got it from our own TokenManager)
    const payload = jwt.decode(accessToken);
    
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Set req.user with decoded user info
    req.user = {
      id: payload.sub,
      email: payload.email,
      appId: payload.appId || payload.app
    };

    // Continue to next middleware/route
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};
