const axios = require('axios');

module.exports.registerForm = (req, res)=>{
  res.render('register');
}

module.exports.register = async (req, res) => {
    try {
      const response = await axios.post(
        'https://voult.dev/api/auth/register',
        req.body,
        {
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': `${process.env.CLIENT_ID}`,
            'x-client-secret': `${process.env.CLIENT_SECRET}`
          }
        }
      );
  
      console.log(response.data);

      req.flash('success', response.data.message);
      res.redirect('/')
  
      // res.json({
      //   success: true,
      //   data: response.data
      // });
  
    } catch (error) {
      console.error(error.response.data);
  
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data || "Something went wrong"
      });
    }
  };

  module.exports.loginForm = (req, res)=>{
    res.render('login')
  }

  module.exports.login = async(req, res) =>{
    try {
      const tokenManager = req.app.get('tokenManager');
      const response = await axios.post(
        `${process.env.API_URL}/auth/login`,
        req.body,
        {
          headers : {
            'Content-Type': 'application/json',
            'x-client-id': `${process.env.CLIENT_ID}`,
            'x-client-secret': `${process.env.CLIENT_SECRET}`
          }
        }
      );
  
      // ✅ CRITICAL: Store tokens in TokenManager after login
      tokenManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken
      );

      const profileResponse = await axios.get(
        `${process.env.API_URL}/user/me`,
        {
          headers: {
            'x-client-token': `Bearer ${response.data.accessToken}`
          }
        }
      );

      req.user = profileResponse;

      // res.json({
      //   success: true,
      //   data: response.data
      // });

      req.flash('success', response.data.message);
      res.redirect('/');
  
    } catch(error) {
      console.error(error.response?.data || error.message);
  
      res.status(error.response?.status || 500).json({
        success: false,
        // message: error.response?.data?.message
        message : error.message
      });
    }
  };

module.exports.logout = async(req, res)=>{
  try {
    const tokenManager = req.app.get('tokenManager');
    const currentToken = tokenManager.getCurrentToken();
    
    if (!currentToken) {
      return res.status(401).json({
        success: false,
        message: 'No active session to logout'
      });
    }
    
    const response = await axios.post(
      `${process.env.API_URL}/auth/logout`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': `${process.env.CLIENT_ID}`,
          'x-client-secret': `${process.env.CLIENT_SECRET}`,
          'X-Client-Token': `Bearer ${currentToken}`
        }
      }
    );

    // Clear tokens after successful logout
    tokenManager.clearTokens();

    res.json({
      success: true,
      data: response.data
    });

  } catch(error){
    // Clear tokens even if logout fails
    tokenManager.clearTokens();
    
    // Safe error handling - error.response might be undefined
    const status = error.response?.status || 500;
    const message = error.response?.data?.message 
                 || error.response?.data?.error 
                 || error.message 
                 || "Logout failed";
    
    res.status(status).json({
      success: false,
      message
    });
  }
};
