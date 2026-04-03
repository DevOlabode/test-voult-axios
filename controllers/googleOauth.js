const axios = require('axios');

module.exports.googleLogin = async(req, res)=>{
    try {
        const response = await axios.post(
            'https://voult.dev/api/auth/google/login',
            req.body,
            {
                headers : {
                    'Content-Type': 'application/json',
                    'X-Client-Id': process.env.CLIENT_ID
                }
            }
        );

        console.log(response.data);

        res.json({
            success: true,
            data: response.data
        })

    }catch(error) {
        console.error(error.response.data);
  
        res.status(error.response?.status || 500).json({
          success: false,
          message: error.response?.data || "Something went wrong"
        });
    }
}

module.exports.googleRegister = async(req, res)=>{
    try {
        const response = await axios.post(
            'https://voult.dev/api/auth/google/register',
            req.body,
            {
                headers : {
                    'Content-Type': 'application/json',
                    'X-Client-Id': process.env.CLIENT_ID
                }
            }
        );

        console.log(response.data);

        res.json({
            success: true,
            data: response.data
        })

    }catch(error) {
        console.error(error.response.data);
  
        res.status(error.response?.status || 500).json({
          success: false,
          message: error.response?.data || "Something went wrong"
        });
    }
}