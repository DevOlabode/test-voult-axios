// utils/tokenManager.js
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

class TokenManager {
  constructor() {
    // Only initialize if not already initialized
    if (TokenManager.instance) {
      return TokenManager.instance;
    }
    
    this.accessToken = null;
    this.refreshToken = process.env.REFRESH_TOKEN;
    this.tokenExpiry = null;
    TokenManager.instance = this;
  }

   // Get current token WITHOUT auto-refresh (for logout)
   getCurrentToken() {
    return this.accessToken;
  }

  // Clear all tokens (for logout)
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    // Clear from .env file
    this.updateEnvFile('REFRESH_TOKEN', '');
  }

  // Set tokens after login
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    // Update .env with refresh token
    this.updateEnvFile('REFRESH_TOKEN', refreshToken);
  }
    
    // async getValidAccessToken() {
    //   // Return cached token if still valid (with 1-minute buffer)
    //   if (this.accessToken && this.tokenExpiry > Date.now() + 60000) {
    //     return this.accessToken;
    //   }
    
    //   // Refresh token - use axios for better error handling
    //   const axios = require('axios');
      
    //   try {
    //     const response = await axios.post(
    //       `${process.env.API_URL}/session/refresh`,  // ✅ Correct endpoint: /session/refresh (singular)
    //       { refreshToken: this.refreshToken },
    //       {
    //         headers: {
    //           'Content-Type': 'application/json',
    //           'x-client-id': process.env.CLIENT_ID,      // ✅ Add client credentials
    //           'x-client-secret': process.env.CLIENT_SECRET
    //         }
    //       }
    //     );
    
    //     const { accessToken, refreshToken } = response.data;
        
    //     this.setTokens(accessToken, refreshToken);
        
    //     return accessToken;
        
    //   } catch (error) {
    //     console.error('Token refresh failed:', error.response?.data || error.message);
    //     throw new Error('Token refresh failed');
    //   }
    // }    

    async getValidAccessToken() {
      console.log('=== TOKEN REFRESH DEBUG ===');
      console.log('Current accessToken:', this.accessToken ? 'EXISTS' : 'NULL');
      console.log('Current refreshToken:', this.refreshToken ? 'EXISTS' : 'NULL');
      console.log('API_URL:', process.env.API_URL);
      console.log('CLIENT_ID:', process.env.CLIENT_ID ? 'SET' : 'NOT SET');
      console.log('Token expiry:', this.tokenExpiry);
      console.log('Is expired?', this.tokenExpiry && this.tokenExpiry <= Date.now() + 60000);
      console.log('=========================');
    
      // Return cached token if still valid (with 1-minute buffer)
      if (this.accessToken && this.tokenExpiry > Date.now() + 60000) {
        console.log('Using cached token');
        return this.accessToken;
      }
    
      console.log('Need to refresh token...');
      
      const axios = require('axios');
      
      try {
        console.log('Making request to:', `${process.env.API_URL}/session/refresh`);
        console.log('With refreshToken:', this.refreshToken ? this.refreshToken.substring(0, 20) + '...' : 'NULL');
        
        const response = await axios.post(
          `${process.env.API_URL}/session/refresh`,
          { refreshToken: this.refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-client-id': process.env.CLIENT_ID,
              'x-client-secret': process.env.CLIENT_SECRET
            }
          }
        );
    
        console.log('Refresh response:', response.status);
        const { accessToken, refreshToken } = response.data;
        
        this.setTokens(accessToken, refreshToken);
        
        return accessToken;
        
      } catch (error) {
        console.error('Refresh failed!');
        console.error('Error:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
          console.error('No response received:', error.request);
        }
        throw new Error('Token refresh failed');
      }
    }

    updateEnvFile(key, value) {
      const fs = require('fs');
      const envPath = '.env';
      let content = fs.readFileSync(envPath, 'utf8');
      content = content.replace(
        new RegExp(`^${key}=.*`, 'm'),
        `${key}=${value}`
      );
      fs.writeFileSync(envPath, content);
    }

}

// Export a singleton instance
module.exports = new TokenManager();