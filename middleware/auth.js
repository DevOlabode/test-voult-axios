// middleware/auth.js — protect JSON/API-style routes that call Voult with a token
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    if (req.session && req.session.voultUser) {
      req.user = req.session.voultUser;
      return next();
    }

    const tokenManager = req.app.get('tokenManager');
    const accessToken = tokenManager.getCurrentToken();

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    const payload = jwt.decode(accessToken);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      appId: payload.appId || payload.app
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};
