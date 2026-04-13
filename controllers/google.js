const axios = require('axios');

function encodeState(stateObj) {
  return Buffer.from(JSON.stringify(stateObj)).toString('base64url');
}

function decodeState(encodedState) {
  return JSON.parse(Buffer.from(encodedState, 'base64url').toString());
}

function buildGoogleAuthUrl({ clientId, redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function getIntent(value) {
  return value === 'register' ? 'register' : 'login';
}

function getGoogleRedirectUri() {
  const explicitRedirectUri = (process.env.GOOGLE_REDIRECT_URI || '').trim();
  if (explicitRedirectUri) {
    return explicitRedirectUri.replace(/\/$/, '');
  }

  const configuredBaseUrl = (process.env.API_BASE_URL || '').trim();
  if (!configuredBaseUrl) {
    return '';
  }

  try {
    const parsedUrl = new URL(configuredBaseUrl);
    const normalizedPath = parsedUrl.pathname.replace(/\/$/, '');

    if (normalizedPath.endsWith('/google/callback')) {
      parsedUrl.pathname = normalizedPath;
      return parsedUrl.toString();
    }

    parsedUrl.pathname = `${normalizedPath}/google/callback`.replace(/\/{2,}/g, '/');
    return parsedUrl.toString();
  } catch (error) {
    const normalizedValue = configuredBaseUrl.replace(/\/$/, '');
    if (normalizedValue.endsWith('/google/callback')) {
      return normalizedValue;
    }
    return `${normalizedValue}/google/callback`;
  }
}

module.exports.generateAuthUrl = async (req, res) => {
  try {
    const intent = getIntent(req.body.intent);
    const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    const callbackUrl = getGoogleRedirectUri();

    if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      req.flash('error', 'Google OAuth is not configured. Add GOOGLE_CLIENT_ID in .env.');
      return res.status(500).json({ success: false, message: 'GOOGLE_CLIENT_ID_NOT_CONFIGURED' });
    }

    if (!callbackUrl) {
      req.flash('error', 'Set GOOGLE_REDIRECT_URI or API_BASE_URL for Google OAuth callback.');
      return res.status(500).json({ success: false, message: 'GOOGLE_REDIRECT_URI_NOT_CONFIGURED' });
    }
    const state = encodeState({ intent, ts: Date.now() });
    const authUrl = buildGoogleAuthUrl({
      clientId: googleClientId,
      redirectUri: callbackUrl,
      state
    });

    return res.json({ success: true, authUrl });
  } catch (error) {
    console.error('Failed to generate Google OAuth URL:', error.message);
    return res.status(500).json({ success: false, message: 'FAILED_TO_GENERATE_AUTH_URL' });
  }
};

module.exports.handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      req.flash('error', 'Missing OAuth callback parameters.');
      return res.redirect('/login');
    }

    const decodedState = decodeState(state);
    const intent = getIntent(decodedState.intent);
    const tokenManager = req.app.get('tokenManager');

    const callbackUrl = getGoogleRedirectUri();
    if (!callbackUrl) {
      req.flash('error', 'Set GOOGLE_REDIRECT_URI or API_BASE_URL for Google OAuth callback.');
      return res.redirect('/login');
    }

    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code'
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const idToken = tokenRes.data.id_token;
    if (!idToken) {
      req.flash('error', 'Google did not return id_token.');
      return res.redirect('/login');
    }

    const voultRes = await axios.post(
      `${process.env.API_URL}/auth/google/${intent}`,
      { idToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': process.env.CLIENT_ID
        }
      }
    );
    
    tokenManager.setTokens(voultRes.data.accessToken, voultRes.data.refreshToken);

    const profileRes = await axios.get(`${process.env.API_URL}/user/me`, {
      headers: {
        'x-client-token': `Bearer ${voultRes.data.accessToken}`
      }
    });

    req.session.voultUser = profileRes.data;
    await new Promise((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });

    req.flash('success', voultRes.data.message || `Google ${intent} successful`);
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Google callback failed:', error.response?.data || error.message);
    req.flash('error', error.response?.data?.message || 'Google OAuth callback failed');
    return res.redirect('/login');
  }
};
