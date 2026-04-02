const axios = require('axios');

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
  
      res.json({
        success: true,
        data: response.data
      });
  
    } catch (error) {
      console.error(error.response.data);
  
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data || "Something went wrong"
      });
    }
  };

  module.exports.login = async(req, res) =>{
    try {
      const response = await axios.post(
        'https://voult.dev/api/auth/login',
        req.body,
        {
          headers : {
            'Content-Type': 'application/json',
            'x-client-id': `${process.env.CLIENT_ID}`,
            'x-client-secret': `${process.env.CLIENT_SECRET}`
          }
        }
      );
  
      console.log(response.data);
  
      res.json({
        success: true,
        data: response.data
      });
  
    }catch(error) {
      console.error(error.response.data);
  
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data || "Something went wrong"
      });
    }
  };