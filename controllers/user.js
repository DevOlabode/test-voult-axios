const axios = require('axios');

module.exports.getProfile = async(req, res)=>{
    try {
      const tokenManager = req.app.get('tokenManager');
      const accessToken = await tokenManager.getValidAccessToken();

      const response = await axios.get(
        `${process.env.API_URL}/user/me`,
        {
          headers: {
            'X-Client-Token': `Bearer ${accessToken}`
          }
        }
      );
        
      res.json({
        success: true,
        data: response.data
      });
  
    } catch(error){
      console.error(error.response.data);
  
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data || "Something went wrong"
      });
    }
};

module.exports.updateProfileForm = async(req, res)=>{
  res.render('user/editProfile');
}

module.exports.editProfile = async(req, res) =>{
    try {
      const tokenManager = req.app.get('tokenManager');
      const accessToken = await tokenManager.getValidAccessToken();
      const response = await axios.patch(
        `${process.env.API_URL}/user/me`,
        req.body,
        {
          headers : {
            'Content-Type': 'application/json',
            'x-client-id': `${process.env.CLIENT_ID}`,
            'x-client-secret': `${process.env.CLIENT_SECRET}`,
            'X-Client-Token': `Bearer ${accessToken}`
          }
        }
      );

      res.json({
        success: true,
        data: response.data
      });
    }catch(error){
      console.error(error.response.data);
  
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data || "Something went wrong"
      });
    }
  }