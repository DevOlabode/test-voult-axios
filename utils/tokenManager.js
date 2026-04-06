// tokenManager.js
class TokenManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = process.env.REFRESH_TOKEN;
    this.tokenExpiry = null;
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
    
    async getValidAccessToken() {
      // Return cached token if still valid (with 1-minute buffer)
      if (this.accessToken && this.tokenExpiry > Date.now() + 60000) {
        return this.accessToken;
      }
    
      // Refresh token - use axios for better error handling
      const axios = require('axios');
      
      try {
        const response = await axios.post(
          `${process.env.API_URL}/session/refresh`,  // ✅ Correct endpoint: /session/refresh (singular)
          { refreshToken: this.refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-client-id': process.env.CLIENT_ID,      // ✅ Add client credentials
              'x-client-secret': process.env.CLIENT_SECRET
            }
          }
        );
    
        const { accessToken, refreshToken } = response.data;
        
        this.setTokens(accessToken, refreshToken);
        
        return accessToken;
        
      } catch (error) {
        console.error('Token refresh failed:', error.response?.data || error.message);
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

  module.exports = TokenManager