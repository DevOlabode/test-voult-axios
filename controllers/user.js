const axios = require('axios');
const TokenManager = require('../utils/tokenManager');
const tokenManager = new TokenManager();

module.exports.getProfile = async(req, res)=>{
    try {
      const currentToken = tokenManager.getCurrentToken();

      const response = await axios.get(
        `${process.env.API_URL}/user/me`,
        {
          headers: {
            'X-Client-Token': `Bearer ${currentToken}`
          }
        }
      );
      
      console.log(response.data);
  
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

module.exports.editProfile = async(req, res) =>{
    try {
      const currentToken = tokenManager.getCurrentToken();
      const response = await axios.patch(
        `${process.env.API_URL}/user/me`,
        req.body,
        {
          headers : {
            'Content-Type': 'application/json',
            'x-client-id': `${process.env.CLIENT_ID}`,
            'x-client-secret': `${process.env.CLIENT_SECRET}`,
            'X-Client-Token': `Bearer ${currentToken}`
          }
        }
      );
  
      console.log(response.data);
  
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