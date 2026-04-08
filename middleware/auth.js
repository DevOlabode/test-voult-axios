// middleware/auth.js
module.exports = async (req, res, next) => {
    try {
      const tokenManager = req.app.get('tokenManager');
      const accessToken = tokenManager.getCurrentToken();
      
      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }
      
      // Optionally decode the JWT to get user info
      const jwt = require('jsonwebtoken');
      const payload = jwt.decode(accessToken);
      
      // Set req.user with user info from token
      req.user = {
        id: payload.sub,
        email: payload.email,
        appId: payload.appId
      };
      
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  };
  