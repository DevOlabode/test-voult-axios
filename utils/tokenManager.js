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
  
      // Refresh token
      const response = await fetch('/api/session/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
  
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
  
      const { accessToken, refreshToken } = await response.json();
      
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      
      // Decode JWT to get expiry (or estimate 15 minutes)
      this.tokenExpiry = Date.now() + 15 * 60 * 1000;
      
      // Update .env file with new refresh token
      this.updateEnvFile('REFRESH_TOKEN', refreshToken);
      
      return accessToken;
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