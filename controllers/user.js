const axios = require('axios');

module.exports.getProfile = async(req, res)=>{
    try {
      const response = await axios.get(
        'https://voult.dev/api/user/me',
        {
          headers: {
            'X-Client-Token': `Bearer ${process.env.ACCESS_TOKEN}`
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