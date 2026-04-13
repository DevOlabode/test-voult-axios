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

      // Persist end-user profile across requests (HTTP is stateless; req.user alone does not survive redirect)
      req.session.voultUser = profileResponse.data;

      await new Promise((resolve, reject) => {
        req.session.save((err) => (err ? reject(err) : resolve()));
      });

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
  const tokenManager = req.app.get('tokenManager');

  try {
    const currentToken = tokenManager.getCurrentToken();
    
    if (!currentToken) {
      delete req.session.voultUser;
      await new Promise((resolve, reject) => {
        req.session.save((err) => (err ? reject(err) : resolve()));
      });
      req.flash('info', 'No active session to log out');
      return res.redirect('/login');
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

    tokenManager.clearTokens();
    delete req.session.voultUser;

    await new Promise((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });

    req.flash('success', response.data?.message || 'Logged out successfully');
    return res.redirect('/login');

  } catch(error){
    tokenManager.clearTokens();
    delete req.session.voultUser;

    await new Promise((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });

    const status = error.response?.status || 500;
    const message = error.response?.data?.message 
                 || error.response?.data?.error 
                 || error.message 
                 || "Logout failed";

    req.flash('error', message);
    return res.redirect(status >= 400 && status < 500 ? '/login' : '/');
  }
};
